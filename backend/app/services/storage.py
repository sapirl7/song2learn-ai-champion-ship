import boto3
from botocore.exceptions import ClientError
import structlog

from app.core.config import settings

logger = structlog.get_logger()


class StorageService:
    """Service for Vultr Object Storage (S3-compatible)."""

    def __init__(self):
        # Align with current settings naming (VULTR_S3_*) and derived endpoint/public URLs.
        self.bucket_name = settings.VULTR_S3_BUCKET
        self.region = settings.VULTR_S3_REGION
        self.endpoint_url = settings.vultr_endpoint_url
        self._client = None

    @property
    def client(self):
        """Lazy initialization of S3 client."""
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=settings.VULTR_S3_ACCESS_KEY,
                aws_secret_access_key=settings.VULTR_S3_SECRET_KEY,
                region_name=self.region,
            )
        return self._client

    def get_public_url(self, key: str) -> str | None:
        """
        Check if a file exists and return its public URL.

        Args:
            key: Object key in the bucket

        Returns:
            Public URL if exists, None otherwise
        """
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=key)
            return f"{settings.vultr_public_url}/{key}"
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return None
            logger.error("storage_head_error", key=key, error=str(e))
            return None

    async def upload_audio(self, key: str, data: bytes) -> str:
        """
        Upload audio data to storage.

        Args:
            key: Object key
            data: Audio bytes

        Returns:
            Public URL of the uploaded file
        """
        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=data,
                ContentType="audio/mpeg",
                ACL="public-read",
            )
            public_url = f"{settings.vultr_public_url}/{key}"
            logger.info("storage_upload_success", key=key)
            return public_url
        except Exception as e:
            logger.error("storage_upload_error", key=key, error=str(e))
            raise

    async def delete_audio(self, key: str) -> bool:
        """
        Delete audio file from storage.

        Args:
            key: Object key

        Returns:
            True if deleted, False otherwise
        """
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info("storage_delete_success", key=key)
            return True
        except Exception as e:
            logger.error("storage_delete_error", key=key, error=str(e))
            return False


# Singleton instance
storage_service = StorageService()
