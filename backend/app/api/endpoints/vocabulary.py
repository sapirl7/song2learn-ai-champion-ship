from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import structlog

from app.db.session import get_db
from app.models.vocabulary import Vocabulary
from app.schemas.vocabulary import (
    VocabularyCreate,
    VocabularyResponse,
    VocabularyTranslateRequest,
    VocabularyTranslateResponse,
)
from app.core.security import get_current_user_id
from app.services.cerebras import cerebras_service

logger = structlog.get_logger()
router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


@router.post("", response_model=VocabularyResponse, status_code=status.HTTP_201_CREATED)
async def create_vocabulary(
    data: VocabularyCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Add a word to the user's vocabulary."""
    vocab = Vocabulary(
        user_id=user_id,
        word=data.word,
        translation=data.translation,
        source_lang=data.source_lang,
        target_lang=data.target_lang,
        context=data.context,
        song_id=data.song_id,
    )
    db.add(vocab)
    await db.commit()
    await db.refresh(vocab)

    logger.info("vocabulary_created", user_id=str(user_id), vocab_id=vocab.id)
    return vocab


@router.post("/translate", response_model=VocabularyTranslateResponse)
async def translate_vocab_word(
    data: VocabularyTranslateRequest,
    _: UUID = Depends(get_current_user_id),
):
    """
    Translate a word into another target language (does not mutate stored vocab).
    """
    t = await cerebras_service.translate_word(
        word=data.word,
        source_lang=data.source_lang,
        target_lang=data.target_lang,
    )
    if not t:
        raise HTTPException(status_code=503, detail="Translation unavailable")
    return VocabularyTranslateResponse(translation=t)


@router.get("", response_model=List[VocabularyResponse])
async def get_vocabulary(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all vocabulary for the current user."""
    result = await db.execute(
        select(Vocabulary)
        .where(Vocabulary.user_id == user_id)
        .order_by(Vocabulary.created_at.desc())
    )
    vocab_list = result.scalars().all()
    return vocab_list


@router.delete("/{vocab_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vocabulary(
    vocab_id: int,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a vocabulary entry."""
    result = await db.execute(
        select(Vocabulary).where(
            Vocabulary.id == vocab_id,
            Vocabulary.user_id == user_id,
        )
    )
    vocab = result.scalar_one_or_none()

    if not vocab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocabulary entry not found",
        )

    await db.execute(
        delete(Vocabulary).where(Vocabulary.id == vocab_id)
    )
    await db.commit()

    logger.info("vocabulary_deleted", user_id=str(user_id), vocab_id=vocab_id)
    return None
