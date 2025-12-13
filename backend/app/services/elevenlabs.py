import hashlib
import structlog

from app.core.config import settings
from app.services.http_client import get_http_client
from app.services.storage import storage_service

logger = structlog.get_logger()


class ElevenLabsService:
    """Service for text-to-speech using ElevenLabs API."""

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.voice_id = settings.ELEVENLABS_VOICE_ID
        self.base_url = "https://api.elevenlabs.io/v1"

    def _generate_key(self, text: str, voice_id: str) -> str:
        """Generate a unique key for the audio file."""
        content = f"{text}|{voice_id}"
        hash_val = hashlib.md5(content.encode()).hexdigest()
        return f"tts/{hash_val}.mp3"

    async def speak(self, text: str, voice_id: str | None = None) -> str:
        """
        Generate speech from text and upload to Vultr storage.

        Args:
            text: Text to convert to speech
            voice_id: Optional voice ID (uses default if not provided)

        Returns:
            Public URL to the audio file
        """
        voice_id = voice_id or self.voice_id
        key = self._generate_key(text, voice_id)

        # Check if audio already exists in storage
        existing_url = await storage_service.get_public_url(key)
        if existing_url:
            logger.debug("elevenlabs_cache_hit", key=key[:20])
            return existing_url

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

            # Upload audio to Vultr storage
            audio_data = response.content
            public_url = await storage_service.upload_audio(key, audio_data)

            logger.info("elevenlabs_speech_generated", text_len=len(text), url=public_url[:50])
            return public_url

        except Exception as e:
            logger.error("elevenlabs_speak_error", text=text[:50], error=str(e))
            raise


# Singleton instance
elevenlabs_service = ElevenLabsService()
