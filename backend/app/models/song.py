from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, UniqueConstraint
from app.db.session import Base


class Song(Base):
    __tablename__ = "songs"
    __table_args__ = (
        UniqueConstraint("title", "artist", name="uix_songs_title_artist"),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    artist = Column(String(255), nullable=False)
    album = Column(String(255), nullable=True)
    language = Column(String(10), nullable=True)
    lyrics = Column(Text, nullable=True)  # Plain lyrics
    synced_lyrics = Column(Text, nullable=True)  # LRC format synced lyrics
    lrclib_id = Column(Integer, nullable=True, index=True)  # External LRCLIB ID
    duration = Column(Integer, nullable=True)  # Duration in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
