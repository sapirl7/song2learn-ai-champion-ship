from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.analyze import SpeakRequest, SpeakResponse
from app.services.voice_service import voice_service
from app.core.security import get_current_user_id
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])

def _voice_config_ok() -> bool:
    return bool(
        settings.ELEVENLABS_API_KEY
        and settings.VULTR_S3_ACCESS_KEY
        and settings.VULTR_S3_SECRET_KEY
        and settings.VULTR_S3_BUCKET
        and settings.VULTR_S3_REGION
    )


@router.get("/status")
async def voice_status(_: UUID = Depends(get_current_user_id)):
    """
    Diagnostic endpoint (no secrets): shows whether voice dependencies are configured on the server.
    """
    return {
        "elevenlabs_configured": bool(settings.ELEVENLABS_API_KEY),
        "vultr_configured": bool(settings.VULTR_S3_ACCESS_KEY and settings.VULTR_S3_SECRET_KEY),
        "bucket": settings.VULTR_S3_BUCKET,
        "region": settings.VULTR_S3_REGION,
        "endpoint_url": settings.vultr_endpoint_url,
        "public_url": settings.vultr_public_url,
    }


@router.post("/speak", response_model=SpeakResponse)
@limiter.limit(settings.RATE_LIMIT_VOICE)
async def speak(request: Request, data: SpeakRequest, _: UUID = Depends(get_current_user_id)):
    if not _voice_config_ok():
        raise HTTPException(status_code=503, detail="Voice not configured on server")
    audio_url = await voice_service.speak(
        text=data.text,
        voice_id=data.voice_id,
        language=data.language,
        speed=data.speed,
    )
    return SpeakResponse(audio_url=audio_url)


