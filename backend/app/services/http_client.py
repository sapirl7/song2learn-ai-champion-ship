import httpx
from typing import Optional

# Shared HTTP client instance (initialized on app startup)
_http_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    """Get the shared HTTP client instance."""
    if _http_client is None:
        raise RuntimeError("HTTP client not initialized. Call init_http_client() first.")
    return _http_client


async def init_http_client():
    """Initialize the shared HTTP client."""
    global _http_client
    _http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(30.0),
        limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
    )


async def close_http_client():
    """Close the shared HTTP client."""
    global _http_client
    if _http_client is not None:
        await _http_client.aclose()
        _http_client = None
