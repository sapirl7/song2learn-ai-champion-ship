from uuid import UUID
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import structlog

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.models.song import Song
from app.models.user import User
from app.schemas.song import SongResponse
from app.services.iconic_songs import pick_iconic_song
from app.services.lrclib import lrclib_service
from app.services.cerebras import cerebras_service

logger = structlog.get_logger()

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("/random-iconic")
async def random_iconic_song(
    request: Request,
    learning_lang: str | None = None,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Return a random curated 'iconic' song (by learning language), import it into DB, and explain why it's iconic.
    """
    # Resolve user language preference if not provided
    if not learning_lang:
        res = await db.execute(select(User).where(User.id == user_id))
        u = res.scalar_one_or_none()
        learning_lang = (u.learning_lang if u else "en") or "en"

    pick = pick_iconic_song(learning_lang)

    lrclib_data = await lrclib_service.get_lyrics(track_name=pick.title, artist_name=pick.artist)
    if not lrclib_data:
        # Fallback: still return the pick and the static reason
        return {"song": None, "reason": pick.fallback_reason, "source": "static"}

    # Upsert song (same logic as /songs/import)
    title = lrclib_data.get("trackName") or pick.title
    artist = lrclib_data.get("artistName") or pick.artist

    existing = await db.execute(
        select(Song).where(func.lower(Song.title) == title.lower(), func.lower(Song.artist) == artist.lower())
    )
    song = existing.scalar_one_or_none()
    if not song:
        song = Song(
            title=title,
            artist=artist,
            album=lrclib_data.get("albumName"),
            lyrics=lrclib_data.get("plainLyrics"),
            synced_lyrics=lrclib_data.get("syncedLyrics"),
            duration=lrclib_data.get("duration"),
            lrclib_id=lrclib_data.get("id"),
        )
        db.add(song)
        await db.commit()
        await db.refresh(song)
        logger.info("discover_song_imported", song_id=song.id, title=song.title, lang=learning_lang)

    # Reason (try Cerebras, fallback to static)
    reason = pick.fallback_reason
    source = "static"
    try:
        generated = await cerebras_service.describe_iconic_song(
            title=song.title,
            artist=song.artist,
            learning_lang=learning_lang or "en",
        )
        if generated:
            reason = generated
            source = "cerebras"
    except Exception as e:
        logger.warning("discover_reason_failed", error=str(e))

    return {"song": SongResponse.model_validate(song), "reason": reason, "source": source}


