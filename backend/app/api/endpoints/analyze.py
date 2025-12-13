from uuid import UUID
from fastapi import APIRouter, Depends, Request
import structlog

from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, SpeakRequest, SpeakResponse
from app.services.cerebras import cerebras_service
from app.services.voice_service import voice_service
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


@router.post("/speak", response_model=SpeakResponse)
@limiter.limit(settings.RATE_LIMIT_VOICE)
async def speak_text(
    request: Request,
    data: SpeakRequest,
    _: UUID = Depends(get_current_user_id),
):
    """
    Convert text to speech using ElevenLabs.

    Returns a public URL to the audio file stored on Vultr.
    Rate limited per config (default: 20/minute).
    """
    audio_url = await voice_service.speak(
        text=data.text,
        voice_id=data.voice_id,
    )
    return SpeakResponse(audio_url=audio_url)
