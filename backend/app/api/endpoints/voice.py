from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.schemas.analyze import SpeakRequest, SpeakResponse
from app.services.voice_service import voice_service
from app.core.security import get_current_user_id
from app.core.limiter import limiter
from app.core.config import settings
from app.db.session import get_db
from app.models.tts_audio import TTSAudio

router = APIRouter(prefix="/voice", tags=["voice"])

def _voice_config_ok() -> bool:
    if not settings.FEATURE_VOICE:
        return False
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
        "signed_urls": settings.VOICE_SIGNED_URLS,
        "signed_url_ttl_seconds": settings.VOICE_SIGNED_URL_TTL_SECONDS,
        "voice_ttl_days": settings.VOICE_TTL_DAYS,
    }


@router.post("/speak", response_model=SpeakResponse)
@limiter.limit(settings.RATE_LIMIT_VOICE)
async def speak(
    request: Request,
    data: SpeakRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if not _voice_config_ok():
        raise HTTPException(status_code=503, detail="Voice not configured on server")
    result = await voice_service.speak(
        text=data.text,
        voice_id=data.voice_id,
        language=data.language,
        speed=data.speed,
    )
    now = datetime.utcnow()
    expires_at = now + timedelta(days=settings.VOICE_TTL_DAYS)

    existing = await db.execute(select(TTSAudio).where(TTSAudio.key == result["key"]))
    row = existing.scalar_one_or_none()
    if row:
        if not row.is_persistent:
            row.expires_at = expires_at
        row.last_accessed_at = now
    else:
        row = TTSAudio(
            user_id=user_id,
            key=result["key"],
            text_hash=result["text_hash"],
            voice_id=result.get("voice_id"),
            language=result.get("language"),
            speed=result.get("speed"),
            text_len=result.get("text_len") or 0,
            created_at=now,
            expires_at=expires_at,
            last_accessed_at=now,
            is_persistent=False,
        )
        db.add(row)
    await db.commit()

    return SpeakResponse(audio_url=result["audio_url"])
