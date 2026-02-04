from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://song2learn:song2learn_secret@localhost:5432/song2learn"

    # JWT
    JWT_SECRET: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # Legacy default (7 days) for compatibility
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Google OAuth (ID token verification)
    GOOGLE_CLIENT_IDS: List[str] = []

    # LRCLIB
    LRCLIB_BASE_URL: str = "https://lrclib.net/api"
    LRCLIB_USER_AGENT: str = "Song2Learn/2.0"

    # Cerebras API
    CEREBRAS_API_KEY: str = ""

    # ElevenLabs API
    ELEVENLABS_API_KEY: str = ""

    # Vultr S3 Object Storage
    VULTR_S3_REGION: str = "ams1"
    VULTR_S3_ACCESS_KEY: str = ""
    VULTR_S3_SECRET_KEY: str = ""
    VULTR_S3_BUCKET: str = "song2learn-audio"

    # Voice storage behavior
    VOICE_SIGNED_URLS: bool = False
    VOICE_SIGNED_URL_TTL_SECONDS: int = 3600
    VOICE_TTL_DAYS: int = 30
    TTS_CLEANUP_BATCH: int = 100

    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Rate limits (increased for hover UX)
    RATE_LIMIT_ANALYZE: str = "60/minute"
    RATE_LIMIT_VOICE: str = "20/minute"

    # Trusted proxy IPs (for X-Forwarded-For validation)
    TRUSTED_PROXIES: List[str] = ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12"]

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False  # Set to True in .env for development

    # Feature flags (fail-fast config validation)
    FEATURE_GOOGLE_AUTH: bool = False
    FEATURE_AI: bool = False
    FEATURE_VOICE: bool = False

    @property
    def vultr_endpoint_url(self) -> str:
        return f"https://{self.VULTR_S3_REGION}.vultrobjects.com"

    @property
    def vultr_public_url(self) -> str:
        return f"https://{self.VULTR_S3_BUCKET}.{self.VULTR_S3_REGION}.vultrobjects.com"

    def validate_runtime(self) -> None:
        missing: list[str] = []
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.JWT_SECRET:
            missing.append("JWT_SECRET")
        if self.FEATURE_GOOGLE_AUTH and not self.GOOGLE_CLIENT_IDS:
            missing.append("GOOGLE_CLIENT_IDS")
        if self.FEATURE_AI and not self.CEREBRAS_API_KEY:
            missing.append("CEREBRAS_API_KEY")
        if self.FEATURE_VOICE:
            if not self.ELEVENLABS_API_KEY:
                missing.append("ELEVENLABS_API_KEY")
            if not self.VULTR_S3_ACCESS_KEY:
                missing.append("VULTR_S3_ACCESS_KEY")
            if not self.VULTR_S3_SECRET_KEY:
                missing.append("VULTR_S3_SECRET_KEY")
            if not self.VULTR_S3_BUCKET:
                missing.append("VULTR_S3_BUCKET")
            if not self.VULTR_S3_REGION:
                missing.append("VULTR_S3_REGION")

        if missing:
            raise RuntimeError(f"Missing required configuration: {', '.join(sorted(set(missing)))}")


settings = Settings()
