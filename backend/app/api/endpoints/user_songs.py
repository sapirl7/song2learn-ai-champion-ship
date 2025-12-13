from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import structlog

from app.db.session import get_db
from app.models.song import Song
from app.models.user_song import UserSong
from app.schemas.song import SongResponse
from app.core.security import get_current_user_id

logger = structlog.get_logger()
router = APIRouter(prefix="/user-songs", tags=["user-songs"])


@router.post("/{song_id}/save", status_code=status.HTTP_200_OK)
async def save_song(
    song_id: int,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Save a song to user's library (toggle: saves if not saved, removes if already saved).
    """
    # Check if song exists
    song_result = await db.execute(select(Song).where(Song.id == song_id))
    song = song_result.scalar_one_or_none()

    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found",
        )

    # Check if already saved
    result = await db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Remove from saved
        await db.execute(
            delete(UserSong).where(
                UserSong.user_id == user_id,
                UserSong.song_id == song_id,
            )
        )
        await db.commit()
        logger.info("song_unsaved", user_id=str(user_id), song_id=song_id)
        return {"saved": False, "message": "Song removed from library"}
    else:
        # Add to saved
        user_song = UserSong(user_id=user_id, song_id=song_id)
        db.add(user_song)
        await db.commit()
        logger.info("song_saved", user_id=str(user_id), song_id=song_id)
        return {"saved": True, "message": "Song added to library"}


@router.get("/saved", response_model=List[SongResponse])
async def get_saved_songs(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all saved songs for the current user."""
    result = await db.execute(
        select(Song)
        .join(UserSong, UserSong.song_id == Song.id)
        .where(UserSong.user_id == user_id)
        .order_by(UserSong.saved_at.desc())
    )
    songs = result.scalars().all()
    return songs


@router.get("/{song_id}/is-saved")
async def is_song_saved(
    song_id: int,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Check if a song is saved by the current user."""
    result = await db.execute(
        select(UserSong).where(
            UserSong.user_id == user_id,
            UserSong.song_id == song_id,
        )
    )
    existing = result.scalar_one_or_none()
    return {"saved": existing is not None}
