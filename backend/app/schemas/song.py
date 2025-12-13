from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SongSearchResult(BaseModel):
    """Response from LRCLIB search"""
    id: int
    trackName: str
    artistName: str
    albumName: Optional[str] = None
    duration: Optional[int] = None
    instrumental: bool = False


class SongImportRequest(BaseModel):
    title: str
    artist: str


class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    album: Optional[str] = None
    language: Optional[str] = None
    lyrics: Optional[str] = None
    synced_lyrics: Optional[str] = None
    duration: Optional[int] = None
    lrclib_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SavedSongResponse(BaseModel):
    id: int
    song: SongResponse
    saved_at: datetime

    class Config:
        from_attributes = True
