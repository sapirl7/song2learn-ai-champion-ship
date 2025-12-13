import json
import time
from typing import Optional, Dict, Any, Tuple
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client
from app.services.cache_service import cache_service, make_analysis_key

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

        cache_key = make_analysis_key(song_id, line_index, line, native_lang)
        cached = cache_service.get(cache_key)
        if cached:
            return {**cached, "cached": True, "latency_ms": int((time.time() - start) * 1000)}

        prompt = f"""Analyze lyric for language learner. Translate to {native_lang}.
Line: "{line}"

JSON only:
{{"translation":"...","grammar":"short","vocabulary":[{{"word":"...","meaning":"...","part_of_speech":"..."}}]}}
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


cerebras_service = CerebrasService()
