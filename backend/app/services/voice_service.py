import hashlib
import aioboto3
from botocore.exceptions import ClientError
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client

logger = structlog.get_logger()


class VoiceService:
    """
    Combined voice service with ElevenLabs TTS and Vultr S3 storage.
    Uses aioboto3 for async S3 operations with single context per call.
    """

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel - default multilingual voice
        self.bucket = settings.VULTR_S3_BUCKET
        self._session = aioboto3.Session()

    def _generate_key(self, text: str, voice_id: str) -> str:
        """Generate a unique key for the audio file using SHA256."""
        content = f"{text}|{voice_id}"
        hash_val = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"tts/{hash_val}.mp3"

    async def _check_exists(self, key: str) -> str | None:
        """Check if audio exists in S3 and return public URL if found."""
        async with self._session.client(
            "s3",
            endpoint_url=settings.vultr_endpoint_url,
            aws_access_key_id=settings.VULTR_S3_ACCESS_KEY,
            aws_secret_access_key=settings.VULTR_S3_SECRET_KEY,
            region_name=settings.VULTR_S3_REGION,
        ) as s3:
            try:
                await s3.head_object(Bucket=self.bucket, Key=key)
                return f"{settings.vultr_public_url}/{key}"
            except ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    return None
                logger.warning("s3_head_error", key=key, error=str(e))
                return None

    async def _upload_audio(self, key: str, data: bytes) -> str:
        """Upload audio to S3 with graceful ACL handling."""
        async with self._session.client(
            "s3",
            endpoint_url=settings.vultr_endpoint_url,
            aws_access_key_id=settings.VULTR_S3_ACCESS_KEY,
            aws_secret_access_key=settings.VULTR_S3_SECRET_KEY,
            region_name=settings.VULTR_S3_REGION,
        ) as s3:
            try:
                # Try with ACL first
                await s3.put_object(
                    Bucket=self.bucket,
                    Key=key,
                    Body=data,
                    ContentType="audio/mpeg",
                    ACL="public-read",
                )
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code", "")
                if error_code in ("AccessControlListNotSupported", "AccessDenied"):
                    # Retry without ACL - bucket policy handles public access
                    logger.info("s3_acl_not_supported_retrying", key=key)
                    await s3.put_object(
                        Bucket=self.bucket,
                        Key=key,
                        Body=data,
                        ContentType="audio/mpeg",
                    )
                else:
                    raise

            logger.info("s3_upload_success", key=key)
            return f"{settings.vultr_public_url}/{key}"

    async def speak(self, text: str, voice_id: str | None = None) -> str:
        """
        Generate speech from text using ElevenLabs and store in Vultr S3.

        Args:
            text: Text to convert to speech
            voice_id: Optional voice ID (uses default if not provided)

        Returns:
            Public URL to the audio file
        """
        voice_id = voice_id or self.voice_id
        key = self._generate_key(text, voice_id)

        # Check if audio already exists in storage
        existing_url = await self._check_exists(key)
        if existing_url:
            logger.debug("voice_cache_hit", key=key[:30])
            return existing_url

        # Generate audio via ElevenLabs
        client = get_http_client()
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }

        try:
            response = await client.post(
                f"{self.base_url}/text-to-speech/{voice_id}",
                headers=headers,
                json={
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
            )
            response.raise_for_status()

            # Upload to S3
            audio_data = response.content
            public_url = await self._upload_audio(key, audio_data)

            logger.info("voice_generated", text_len=len(text), url=public_url[:50])
            return public_url

        except Exception as e:
            logger.error("voice_speak_error", text=text[:50], error=str(e))
            raise


# Singleton instance
voice_service = VoiceService()
