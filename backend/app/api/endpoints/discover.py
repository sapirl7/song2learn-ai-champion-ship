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
    native_lang: str | None = None,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """
    Return a random curated 'iconic' song (by learning language), import it into DB, and explain why it's iconic.
    """
    # Resolve user language preference if not provided
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not learning_lang:
        learning_lang = (u.learning_lang if u else "en") or "en"
    if not native_lang:
        native_lang = (u.native_lang if u else "en") or "en"

    # Try up to 5 different songs from target language, then fallback to English
    MAX_ATTEMPTS = 5
    tried_songs = set()
    lrclib_data = None
    pick = None
    
    # Try target language first
    for _ in range(MAX_ATTEMPTS):
        pick = pick_iconic_song(learning_lang)
        song_key = (pick.title, pick.artist)
        if song_key in tried_songs:
            continue
        tried_songs.add(song_key)
        
        lrclib_data = await lrclib_service.get_lyrics(track_name=pick.title, artist_name=pick.artist)
        if lrclib_data:
            break
        logger.info("discover_song_not_found", title=pick.title, artist=pick.artist, lang=learning_lang, attempt=len(tried_songs))
    
    # Fallback to English if target language songs not found
    if not lrclib_data and learning_lang != "en":
        logger.info("discover_fallback_to_english", original_lang=learning_lang)
        tried_songs.clear()
        for _ in range(3):
            pick = pick_iconic_song("en")
            song_key = (pick.title, pick.artist)
            if song_key in tried_songs:
                continue
            tried_songs.add(song_key)
            
            lrclib_data = await lrclib_service.get_lyrics(track_name=pick.title, artist_name=pick.artist)
            if lrclib_data:
                break
    
    if not lrclib_data:
        # Ultimate fallback: return static reason (should rarely happen)
        return {"song": None, "reason": pick.fallback_reason if pick else "Song not found", "source": "static"}

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
            target_lang=native_lang or "en",
        )
        if generated:
            reason = generated
            source = "cerebras"
    except Exception as e:
        logger.warning("discover_reason_failed", error=str(e))

    return {"song": SongResponse.model_validate(song), "reason": reason, "source": source}


