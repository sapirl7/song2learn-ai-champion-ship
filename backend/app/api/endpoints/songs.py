from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import structlog

from app.db.session import get_db
from app.models.song import Song
from app.schemas.song import SongResponse, SongSearchResult, SongImportRequest
from app.services.lrclib import lrclib_service
from app.core.security import get_current_user_id

logger = structlog.get_logger()
router = APIRouter(prefix="/songs", tags=["songs"])


@router.get("/search", response_model=List[SongSearchResult])
async def search_songs(
    q: str = Query(..., min_length=1, description="Search query"),
    _: int = Depends(get_current_user_id),  # Require auth
):
    """
    Search for songs via LRCLIB.

    Returns list of matching songs with their LRCLIB IDs.
    """
    results = await lrclib_service.search(q)
    return results


@router.post("/import", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
async def import_song(
    song_data: SongImportRequest,
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_user_id),  # Require auth
):
    """
    Import a song from LRCLIB into the local database.

    Performs upsert based on (lower(title), lower(artist)).
    """
    # Check if song already exists
    result = await db.execute(
        select(Song).where(
            func.lower(Song.title) == song_data.title.lower(),
            func.lower(Song.artist) == song_data.artist.lower(),
        )
    )
    existing_song = result.scalar_one_or_none()

    if existing_song:
        logger.info("song_already_exists", song_id=existing_song.id)
        return existing_song

    # Fetch from LRCLIB
    lrclib_data = await lrclib_service.get_lyrics(
        track_name=song_data.title,
        artist_name=song_data.artist,
    )

    if not lrclib_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found on LRCLIB",
        )

    # Create song
    song = Song(
        title=lrclib_data.get("trackName", song_data.title),
        artist=lrclib_data.get("artistName", song_data.artist),
        album=lrclib_data.get("albumName"),
        lyrics=lrclib_data.get("plainLyrics"),
        synced_lyrics=lrclib_data.get("syncedLyrics"),
        duration=lrclib_data.get("duration"),
        lrclib_id=lrclib_data.get("id"),
    )

    db.add(song)
    await db.commit()
    await db.refresh(song)

    logger.info("song_imported", song_id=song.id, title=song.title)
    return song


@router.get("/{song_id}", response_model=SongResponse)
async def get_song(
    song_id: int,
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_user_id),  # Require auth
):
    """Get a song by ID."""
    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )

    return song


@router.get("/{song_id}/story")
async def get_song_story(
    song_id: int,
    target_lang: str = Query("en", description="Language for the story"),
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_user_id),
):
    """
    Get AI-generated story about the song:
    - Who wrote the lyrics and when
    - Historical/life context of the author
    - How these lyrics ended up with the current artist
    """
    from app.services.cerebras import cerebras_service

    result = await db.execute(select(Song).where(Song.id == song_id))
    song = result.scalar_one_or_none()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )

    story = await cerebras_service.generate_song_story(
        title=song.title,
        artist=song.artist,
        target_lang=target_lang,
    )

    if not story:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Story generation unavailable. AI service may not be configured.",
        )

    return {"story": story, "song_id": song_id}
