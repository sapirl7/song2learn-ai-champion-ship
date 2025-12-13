from uuid import UUID
from fastapi import APIRouter, Depends, Request

from app.schemas.analyze import SpeakRequest, SpeakResponse
from app.services.voice_service import voice_service
from app.core.security import get_current_user_id
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/speak", response_model=SpeakResponse)
@limiter.limit(settings.RATE_LIMIT_VOICE)
async def speak(request: Request, data: SpeakRequest, _: UUID = Depends(get_current_user_id)):
    audio_url = await voice_service.speak(
        text=data.text,
        voice_id=data.voice_id,
        language=data.language,
        speed=data.speed,
    )
    return SpeakResponse(audio_url=audio_url)


