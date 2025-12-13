from uuid import UUID
from fastapi import APIRouter, Depends, Request
import structlog

from app.schemas.exercise import TranslationCheckRequest, TranslationCheckResponse
from app.services.cerebras import cerebras_service
from app.core.security import get_current_user_id
from app.core.limiter import limiter

logger = structlog.get_logger()
router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.post("/translation-check", response_model=TranslationCheckResponse)
@limiter.limit("30/minute")
async def check_translation(
    request: Request,
    data: TranslationCheckRequest,
    _: UUID = Depends(get_current_user_id),
):
    """
    Check a user's translation attempt against the original line.

    Uses Cerebras AI to evaluate the translation and provide feedback.
    Rate limited to 30 requests per minute.
    """
    result = await cerebras_service.check_translation(
        original=data.original,
        user_translation=data.user_translation,
    )

    logger.info(
        "translation_checked",
        song_id=data.song_id,
        line_index=data.line_index,
        is_correct=result.get("is_correct", False),
    )

    return TranslationCheckResponse(**result)
