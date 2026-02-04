import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class TTSAudio(Base):
    __tablename__ = "tts_audio"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    text_hash = Column(String(64), nullable=False, index=True)
    voice_id = Column(String(64), nullable=True)
    language = Column(String(16), nullable=True)
    speed = Column(Float, nullable=True)
    text_len = Column(Integer, nullable=False, default=0)
    is_persistent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
