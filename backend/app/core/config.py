from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://song2learn:song2learn_secret@localhost:5432/song2learn"

    # JWT
    JWT_SECRET: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # LRCLIB
    LRCLIB_BASE_URL: str = "https://lrclib.net/api"
    LRCLIB_USER_AGENT: str = "Song2Learn/2.0"

    # Cerebras API
    CEREBRAS_API_KEY: str = ""

    # ElevenLabs API
    ELEVENLABS_API_KEY: str = ""

    # Vultr S3 Object Storage
    VULTR_S3_REGION: str = "ewr1"
    VULTR_S3_ACCESS_KEY: str = ""
    VULTR_S3_SECRET_KEY: str = ""
    VULTR_S3_BUCKET: str = "song2learn-audio"

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

    @property
    def vultr_endpoint_url(self) -> str:
        return f"https://{self.VULTR_S3_REGION}.vultrobjects.com"

    @property
    def vultr_public_url(self) -> str:
        return f"https://{self.VULTR_S3_BUCKET}.{self.VULTR_S3_REGION}.vultrobjects.com"


settings = Settings()
