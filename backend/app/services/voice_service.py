import hashlib
from typing import Optional
import aioboto3
from botocore.exceptions import ClientError
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client

logger = structlog.get_logger()

VOICES = {
    "en": "21m00Tcm4TlvDq8ikWAM",
    "es": "AZnzlk1XvdvUeBnXmlld",
    "fr": "ThT5KcBeYPX3keUQqHPh",
    "de": "g5CIjZEefAph4nQFvHAz",
    "ru": "TX3LPaxmHKxFdv7VOQHJ",
}

MAX_TEXT_LENGTH = 500


class VoiceService:
    """
    ElevenLabs TTS + Vultr S3 storage.
    v5: single S3 context per call + ACL fallback + hash-based keys.
    """

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.bucket = settings.VULTR_S3_BUCKET
        self.region = settings.VULTR_S3_REGION
        self._session = aioboto3.Session()

    def _audio_key(self, text: str, lang: str, speed: float) -> str:
        h = hashlib.sha256(f"{text}:{lang}:{speed}".encode()).hexdigest()[:16]
        return f"tts/{h}.mp3"

    def _public_url(self, key: str) -> str:
        return f"{settings.vultr_public_url}/{key}"

    async def speak(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: Optional[str] = None,
        speed: Optional[float] = None,
    ) -> str:
        # Fail fast with a clear message if server-side voice isn't configured.
        if not settings.ELEVENLABS_API_KEY:
            raise RuntimeError("ELEVENLABS_API_KEY is not set")
        if not settings.VULTR_S3_ACCESS_KEY or not settings.VULTR_S3_SECRET_KEY:
            raise RuntimeError("VULTR_S3_ACCESS_KEY/VULTR_S3_SECRET_KEY are not set")
        if not settings.VULTR_S3_BUCKET:
            raise RuntimeError("VULTR_S3_BUCKET is not set")
        if not settings.VULTR_S3_REGION:
            raise RuntimeError("VULTR_S3_REGION is not set")

        text = (text or "")[:MAX_TEXT_LENGTH]
        lang = (language or "en").lower()
        spd = 1.0 if speed is None else float(speed)
        spd = max(0.7, min(1.2, spd))

        vid = voice_id or VOICES.get(lang, VOICES["en"])
        key = self._audio_key(text, lang, spd)

        async with self._session.client(
            "s3",
            endpoint_url=settings.vultr_endpoint_url,
            aws_access_key_id=settings.VULTR_S3_ACCESS_KEY,
            aws_secret_access_key=settings.VULTR_S3_SECRET_KEY,
            region_name=settings.VULTR_S3_REGION,
        ) as s3:
            # Cache check
            try:
                await s3.head_object(Bucket=self.bucket, Key=key)
                logger.debug("voice_cache_hit", key=key[:30])
                return self._public_url(key)
            except ClientError as e:
                if e.response.get("Error", {}).get("Code") != "404":
                    logger.warning("s3_head_error", key=key, error=str(e))

            # Generate audio via ElevenLabs
            client = get_http_client()
            response = await client.post(
                f"{self.base_url}/text-to-speech/{vid}",
                headers={"xi-api-key": settings.ELEVENLABS_API_KEY, "Content-Type": "application/json"},
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "speed": spd,
                    },
                },
            )
            response.raise_for_status()
            audio_data = response.content

            # Upload with ACL fallback
            try:
                await s3.put_object(
                    Bucket=self.bucket,
                    Key=key,
                    Body=audio_data,
                    ContentType="audio/mpeg",
                    ACL="public-read",
                )
            except ClientError as e:
                code = e.response.get("Error", {}).get("Code", "")
                if code in ("AccessControlListNotSupported", "AccessDenied"):
                    logger.info("s3_acl_not_supported_retrying", key=key)
                    await s3.put_object(
                        Bucket=self.bucket,
                        Key=key,
                        Body=audio_data,
                        ContentType="audio/mpeg",
                    )
                else:
                    raise

            logger.info("voice_generated", text_len=len(text), key=key)
            return self._public_url(key)


voice_service = VoiceService()
