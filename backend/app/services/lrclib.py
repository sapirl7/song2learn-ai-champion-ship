from typing import Optional, List
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client

logger = structlog.get_logger()


class LRCLibService:
    """Service for interacting with LRCLIB API."""

    def __init__(self):
        self.base_url = settings.LRCLIB_BASE_URL
        self.headers = {
            "User-Agent": settings.LRCLIB_USER_AGENT,
        }

    async def search(self, query: str) -> List[dict]:
        """
        Search for songs on LRCLIB.

        Args:
            query: Search query (song title, artist, etc.)

        Returns:
            List of search results with id, trackName, artistName, etc.
        """
        client = get_http_client()
        try:
            response = await client.get(
                f"{self.base_url}/search",
                params={"q": query},
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("lrclib_search_error", query=query, error=str(e))
            return []

    async def get_lyrics(
        self,
        track_name: str,
        artist_name: str,
        album_name: Optional[str] = None,
        duration: Optional[int] = None,
    ) -> Optional[dict]:
        """
        Get lyrics for a specific song from LRCLIB.

        Args:
            track_name: Name of the track
            artist_name: Name of the artist
            album_name: Optional album name
            duration: Optional track duration in seconds

        Returns:
            Lyrics data including plainLyrics, syncedLyrics, etc.
        """
        client = get_http_client()
        params = {
            "track_name": track_name,
            "artist_name": artist_name,
        }
        if album_name:
            params["album_name"] = album_name
        if duration:
            params["duration"] = duration

        try:
            response = await client.get(
                f"{self.base_url}/get",
                params=params,
                headers=self.headers,
            )
            if response.status_code == 404:
                logger.info("lrclib_lyrics_not_found", track=track_name, artist=artist_name)
                return None
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("lrclib_get_error", track=track_name, artist=artist_name, error=str(e))
            return None

    async def get_by_id(self, lrclib_id: int) -> Optional[dict]:
        """
        Get lyrics by LRCLIB ID.

        Args:
            lrclib_id: The LRCLIB internal ID

        Returns:
            Lyrics data including plainLyrics, syncedLyrics, etc.
        """
        client = get_http_client()
        try:
            response = await client.get(
                f"{self.base_url}/get/{lrclib_id}",
                headers=self.headers,
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error("lrclib_get_by_id_error", lrclib_id=lrclib_id, error=str(e))
            return None


# Singleton instance
lrclib_service = LRCLibService()
