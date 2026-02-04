from uuid import UUID
from fastapi import APIRouter, Depends, Request
import structlog

from app.schemas.analyze import (
    AnalyzeRequest,
    AnalyzeResponse,
    InterlinearRequest,
    InterlinearResponse,
)
from app.services.cerebras import cerebras_service
from app.core.security import get_current_user_id
from app.core.limiter import limiter
from app.core.config import settings

logger = structlog.get_logger()
router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/line", response_model=AnalyzeResponse)
@limiter.limit(settings.RATE_LIMIT_ANALYZE)
async def analyze_line(
    request: Request,
    data: AnalyzeRequest,
    _: UUID = Depends(get_current_user_id),
):
    """
    Analyze a line of lyrics.

    Returns translation, grammar explanation, and vocabulary breakdown.
    Rate limited per config (default: 60/minute).
    """
    result = await cerebras_service.analyze_line(
        line=data.line,
        native_lang=data.native_lang,
        learning_lang=data.learning_lang,
        song_id=data.song_id,
        line_index=data.line_index,
    )
    return AnalyzeResponse(**result)

@router.post("/interlinear", response_model=InterlinearResponse)
@limiter.limit(settings.RATE_LIMIT_ANALYZE)
async def interlinear(
    request: Request,
    data: InterlinearRequest,
    _: UUID = Depends(get_current_user_id),
):
    """
    Word-by-word translation tokens for a lyric line.
    """
    result = await cerebras_service.interlinear_line(
        line=data.line,
        native_lang=data.native_lang,
        learning_lang=data.learning_lang,
        song_id=data.song_id,
        line_index=data.line_index,
    )
    return InterlinearResponse(**result)
