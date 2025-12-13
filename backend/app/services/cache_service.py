from typing import Optional, Any
from cachetools import TTLCache
import threading
import hashlib

_cache = TTLCache(maxsize=1000, ttl=3600)
_lock = threading.Lock()


def make_analysis_key(song_id: int, line_index: int, line: str, native_lang: str) -> str:
    """Cache key with 16-char sha256 hash to minimize collision risk."""
    line_hash = hashlib.sha256(line.lower().strip().encode()).hexdigest()[:16]
    return f"analysis:{song_id}:{line_index}:{line_hash}:{native_lang}"


def make_interlinear_key(song_id: int, line_index: int, line: str, native_lang: str, learning_lang: str) -> str:
    """Cache key for interlinear word-by-word translations."""
    line_hash = hashlib.sha256(line.lower().strip().encode()).hexdigest()[:16]
    return f"interlinear:{song_id}:{line_index}:{line_hash}:{learning_lang}:{native_lang}"


class CacheService:
    def get(self, key: str) -> Optional[Any]:
        with _lock:
            return _cache.get(key)

    def set(self, key: str, value: Any) -> None:
        with _lock:
            _cache[key] = value


cache_service = CacheService()
