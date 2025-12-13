import hashlib
from cachetools import TTLCache


# Cache for analysis results (TTL: 1 hour, max 1000 entries)
analysis_cache: TTLCache = TTLCache(maxsize=1000, ttl=3600)


def make_analysis_key(song_id: int, line_index: int, line: str, native_lang: str) -> str:
    """
    Generate cache key with 16-char hash to minimize collision risk.

    Uses SHA256 for better distribution compared to MD5.
    Key format: analysis:{song_id}:{line_index}:{line_hash}:{native_lang}
    """
    line_hash = hashlib.sha256(line.lower().strip().encode()).hexdigest()[:16]
    return f"analysis:{song_id}:{line_index}:{line_hash}:{native_lang}"
