import json
import time
from typing import Optional, Dict, Any, Tuple
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client
from app.services.cache_service import cache_service, make_analysis_key, make_interlinear_key

logger = structlog.get_logger()

CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions"
MODEL = "llama-3.3-70b"

MAX_LINE_LENGTH = 500
MAX_RESPONSE_LENGTH = 300


def _parse_json(content: str) -> Tuple[Optional[Dict[str, Any]], bool]:
    """Return (result, is_valid_for_caching)."""
    try:
        result = json.loads(content)
    except json.JSONDecodeError as e:
        logger.error("cerebras_json_parse_error", error=str(e), content=content[:200])
        return None, False

    translation = str(result.get("translation", "")).strip()
    if not translation:
        return {"translation": "Parse error", "grammar": "", "vocabulary": []}, False

    grammar = result.get("grammar") or ""
    vocabulary = result.get("vocabulary") or []
    if not isinstance(vocabulary, list):
        vocabulary = []

    out: Dict[str, Any] = {
        "translation": translation[:MAX_RESPONSE_LENGTH],
        "grammar": str(grammar)[:MAX_RESPONSE_LENGTH],
        "vocabulary": vocabulary,
    }
    return out, True


class CerebrasService:
    """Service for interacting with Cerebras API for language analysis."""

    def __init__(self):
        self.api_key = settings.CEREBRAS_API_KEY

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    async def analyze_line(
        self,
        line: str,
        native_lang: str = "en",
        learning_lang: str = "en",
        song_id: int = 0,
        line_index: int = 0,
    ) -> dict:
        start = time.time()
        line = (line or "")[:MAX_LINE_LENGTH]

        cache_key = make_analysis_key(song_id, line_index, line, native_lang, learning_lang)
        cached = cache_service.get(cache_key)
        if cached:
            return {**cached, "cached": True, "latency_ms": int((time.time() - start) * 1000)}

        prompt = f"""Analyze lyric for a language learner.
Input language: {learning_lang}
Learner's native language: {native_lang}
Line: "{line}"

IMPORTANT: Write ALL output (translation, grammar, vocabulary meanings) in {native_lang}.

JSON only:
{{"translation":"...(in {native_lang})","grammar":"short grammar note in {native_lang}","vocabulary":[{{"word":"...(original word)","meaning":"...(in {native_lang})","part_of_speech":"...(in {native_lang})"}}]}}
"""

        fallback = {"translation": "Analysis unavailable", "grammar": "", "vocabulary": []}

        try:
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Language tutor. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 200,
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]

            result, is_valid = _parse_json(content)
            if result is None:
                return {**fallback, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

            if is_valid:
                cache_service.set(cache_key, result)

            return {**result, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

        except Exception as e:
            logger.error("cerebras_analyze_error", error=str(e))
            return {**fallback, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

    async def check_translation(
        self,
        original: str,
        user_translation: str,
        native_lang: str = "en",
        learning_lang: str = "en",
    ) -> dict:
        prompt = f"""Evaluate:
Original ({learning_lang}): "{(original or '')[:300]}"
User ({native_lang}): "{(user_translation or '')[:300]}"

JSON only:
{{"is_correct": true, "score": 0.0, "correct_translation": "...", "feedback": "..."}}
"""

        try:
            if not self.api_key:
                # Graceful fallback (so frontend doesn't crash)
                return {
                    "is_correct": False,
                    "score": 0.0,
                    "correct_translation": "",
                    "feedback": "Check unavailable (AI not configured)",
                }
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Fair language teacher. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 300,
                    "temperature": 0.3,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"is_correct": False, "score": 0.0, "correct_translation": "", "feedback": "Check unavailable"}
        except Exception as e:
            logger.error("cerebras_check_error", error=str(e))
            return {"is_correct": False, "score": 0.0, "correct_translation": "", "feedback": "Check unavailable"}

    async def describe_iconic_song(self, title: str, artist: str, target_lang: str = "en") -> str:
        """
        Short explanation (2-3 sentences) why a song is considered iconic/cult in its culture.
        Returns empty string on failure.
        """
        if not self.api_key:
            return ""
        prompt = f"""Explain (2-3 sentences) why this song is considered iconic/cult.
Song: "{(title or '')[:120]}" — {(artist or '')[:120]}
Write in language: {target_lang}

JSON only:
{{"reason":"..."}}
"""
        try:
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Music critic. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 180,
                    "temperature": 0.4,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            reason = str(data.get("reason", "")).strip()
            return reason[:400]
        except Exception as e:
            logger.error("cerebras_iconic_error", error=str(e))
            return ""

    async def interlinear_line(
        self,
        line: str,
        native_lang: str = "en",
        learning_lang: str = "en",
        song_id: int = 0,
        line_index: int = 0,
    ) -> dict:
        """
        Return word-by-word translation tokens.
        JSON: {"tokens":[{"orig":"...","trans":"..."}]}
        """
        start = time.time()
        line = (line or "")[:MAX_LINE_LENGTH]

        cache_key = make_interlinear_key(song_id, line_index, line, native_lang, learning_lang)
        cached = cache_service.get(cache_key)
        if cached:
            return {**cached, "cached": True, "latency_ms": int((time.time() - start) * 1000)}

        if not self.api_key:
            # No AI configured; best-effort fallback: split words without translation.
            tokens = [{"orig": t, "trans": ""} for t in line.split()]
            return {"tokens": tokens, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

        prompt = f"""Make an interlinear word-by-word translation.
Input language: {learning_lang}
Target language: {native_lang}
Line: "{line}"

Rules:
- Preserve punctuation as separate tokens where possible.
- Keep token count reasonable; do not invent extra words.
- For tokens that are punctuation, set trans to "".

JSON only:
{{"tokens":[{{"orig":"...","trans":"..."}}, ...]}}
"""
        fallback = {"tokens": [{"orig": line, "trans": ""}]}

        try:
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Translator. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 260,
                    "temperature": 0.2,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            tokens = data.get("tokens") or []
            if not isinstance(tokens, list) or not tokens:
                return {**fallback, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

            out = {"tokens": tokens}
            cache_service.set(cache_key, out)
            return {**out, "cached": False, "latency_ms": int((time.time() - start) * 1000)}
        except Exception as e:
            logger.error("cerebras_interlinear_error", error=str(e))
            return {**fallback, "cached": False, "latency_ms": int((time.time() - start) * 1000)}

    async def translate_word(self, word: str, source_lang: str, target_lang: str) -> str:
        """
        Translate a single word/short phrase from source_lang to target_lang.
        JSON: {"translation":"..."}
        """
        if not self.api_key:
            return ""
        w = (word or "")[:120]
        prompt = f"""Translate from {source_lang} to {target_lang}.
Text: "{w}"

JSON only:
{{"translation":"..."}}
"""
        try:
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Translator. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 60,
                    "temperature": 0.2,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            return str(data.get("translation", "")).strip()[:200]
        except Exception as e:
            logger.error("cerebras_translate_word_error", error=str(e))
            return ""

    async def generate_song_story(
        self,
        title: str,
        artist: str,
        target_lang: str = "en",
    ) -> str:
        """
        Generate a story about the song's creation:
        - Who wrote the lyrics and when
        - Historical/life context of the author
        - How these lyrics ended up with the current band/artist

        Returns the story text in target_lang.
        """
        if not self.api_key:
            return ""

        title = (title or "")[:150]
        artist = (artist or "")[:150]

        prompt = f"""Tell the story behind this song in {target_lang}.
Song: "{title}" by {artist}

Include:
1. Who wrote the lyrics (original author if different from performer)
2. What period of their life they wrote it and what inspired it
3. How the song ended up with the current artist/band

Keep it engaging, 3-5 paragraphs. If you're not certain about facts, note that.

JSON only:
{{"story":"..."}}
"""
        try:
            client = get_http_client()
            resp = await client.post(
                CEREBRAS_URL,
                headers=self._headers(),
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": "Music historian and storyteller. Valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 800,
                    "temperature": 0.5,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            story = str(data.get("story", "")).strip()
            return story[:3000]
        except Exception as e:
            logger.error("cerebras_song_story_error", error=str(e))
            return ""


cerebras_service = CerebrasService()
