import json
from typing import Optional, Tuple
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client
from app.services.cache_service import analysis_cache, make_analysis_key

logger = structlog.get_logger()


def _parse_response(content: str) -> Tuple[Optional[dict], bool]:
    """
    Parse Cerebras response and return (result, is_valid) tuple.

    Returns:
        Tuple of (parsed_result, is_valid_for_caching)
        - is_valid is False for parse errors (should not be cached)
    """
    try:
        result = json.loads(content)
        # Validate expected fields exist
        if "translation" in result and "grammar" in result:
            return result, True
        return result, True
    except json.JSONDecodeError as e:
        logger.error("cerebras_json_parse_error", error=str(e), content=content[:200])
        return None, False


class CerebrasService:
    """Service for interacting with Cerebras API for language analysis."""

    def __init__(self):
        self.api_key = settings.CEREBRAS_API_KEY
        self.base_url = "https://api.cerebras.ai/v1"

    async def analyze_line(
        self,
        line: str,
        native_lang: str = "en",
        learning_lang: str = "en",
        song_id: int = 0,
        line_index: int = 0,
    ) -> dict:
        """
        Analyze a line of lyrics using Cerebras AI.

        Args:
            line: The line to analyze
            native_lang: User's native language code
            learning_lang: Language being learned
            song_id: Song ID for cache key
            line_index: Line index for cache key

        Returns:
            Analysis with translation, grammar explanation, and vocabulary
        """
        # Check cache first with v5 key format
        cache_key = make_analysis_key(song_id, line_index, line, native_lang)
        if cache_key in analysis_cache:
            logger.debug("cerebras_cache_hit", cache_key=cache_key[:20])
            return analysis_cache[cache_key]

        client = get_http_client()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        prompt = f"""Analyze this song lyric line for a language learner.
Line: "{line}"
Learning language: {learning_lang}
Native language: {native_lang}

Respond in JSON format:
{{
    "translation": "Translation of the line to {native_lang}",
    "grammar": "Brief grammar explanation of the sentence structure",
    "vocabulary": [
        {{"word": "word1", "meaning": "meaning in {native_lang}", "part_of_speech": "noun/verb/etc"}},
        {{"word": "word2", "meaning": "meaning in {native_lang}", "part_of_speech": "noun/verb/etc"}}
    ]
}}

Only output valid JSON, nothing else."""

        fallback_response = {
            "translation": "Unable to analyze this line",
            "grammar": "Analysis failed",
            "vocabulary": [],
        }

        try:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json={
                    "model": "llama-3.3-70b",
                    "messages": [
                        {"role": "system", "content": "You are a language learning assistant. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]

            # Parse response with validity check
            result, is_valid = _parse_response(content)

            if result is None:
                # Parse error - do NOT cache
                return fallback_response

            # Only cache valid responses
            if is_valid:
                analysis_cache[cache_key] = result

            return result

        except Exception as e:
            logger.error("cerebras_analyze_error", line=line[:50], error=str(e))
            # Do NOT cache errors
            return fallback_response

    async def check_translation(
        self,
        original: str,
        user_translation: str,
        native_lang: str = "en",
        learning_lang: str = "en",
    ) -> dict:
        """
        Check a user's translation attempt.

        Args:
            original: Original line in learning language
            user_translation: User's translation attempt
            native_lang: User's native language
            learning_lang: Language being learned

        Returns:
            Feedback with is_correct, feedback message, and suggested translation
        """
        client = get_http_client()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        prompt = f"""Evaluate this translation attempt:
Original ({learning_lang}): "{original}"
User's translation ({native_lang}): "{user_translation}"

Respond in JSON format:
{{
    "is_correct": true/false,
    "feedback": "Constructive feedback about the translation",
    "suggested_translation": "A correct translation"
}}

Be lenient - mark as correct if the meaning is conveyed accurately, even if wording differs slightly.
Only output valid JSON, nothing else."""

        try:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json={
                    "model": "llama-3.3-70b",
                    "messages": [
                        {"role": "system", "content": "You are a language learning assistant. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 500,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]

            result, _ = _parse_response(content)
            if result is None:
                return {
                    "is_correct": False,
                    "feedback": "Unable to evaluate translation",
                    "suggested_translation": original,
                }
            return result

        except Exception as e:
            logger.error("cerebras_check_error", original=original[:50], error=str(e))
            return {
                "is_correct": False,
                "feedback": "Unable to evaluate translation",
                "suggested_translation": original,
            }


# Singleton instance
cerebras_service = CerebrasService()
