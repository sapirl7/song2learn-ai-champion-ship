from datetime import datetime
import structlog
import aioboto3
from sqlalchemy import select, delete

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.tts_audio import TTSAudio

logger = structlog.get_logger()


def _can_cleanup() -> bool:
    return bool(
        settings.FEATURE_VOICE
        and settings.VULTR_S3_ACCESS_KEY
        and settings.VULTR_S3_SECRET_KEY
        and settings.VULTR_S3_BUCKET
        and settings.VULTR_S3_REGION
    )


async def cleanup_expired_tts() -> None:
    if not _can_cleanup():
        logger.info("tts_cleanup_skipped")
        return

    now = datetime.utcnow()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(TTSAudio)
            .where(TTSAudio.expires_at <= now, TTSAudio.is_persistent.is_(False))
            .limit(settings.TTS_CLEANUP_BATCH)
        )
        rows = result.scalars().all()
        if not rows:
            return

        async with aioboto3.Session().client(
            "s3",
            endpoint_url=settings.vultr_endpoint_url,
            aws_access_key_id=settings.VULTR_S3_ACCESS_KEY,
            aws_secret_access_key=settings.VULTR_S3_SECRET_KEY,
            region_name=settings.VULTR_S3_REGION,
        ) as s3:
            for row in rows:
                try:
                    await s3.delete_object(Bucket=settings.VULTR_S3_BUCKET, Key=row.key)
                except Exception as e:
                    logger.warning("tts_cleanup_delete_failed", error=str(e))

        await db.execute(delete(TTSAudio).where(TTSAudio.id.in_([r.id for r in rows])))
        await db.commit()
        logger.info("tts_cleanup_deleted", count=len(rows))
