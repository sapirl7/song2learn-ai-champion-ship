from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VocabularyCreate(BaseModel):
    word: str
    translation: str
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None
    context: Optional[str] = None
    song_id: Optional[int] = None


class VocabularyResponse(BaseModel):
    id: int
    word: str
    translation: str
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None
    context: Optional[str] = None
    song_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VocabularyTranslateRequest(BaseModel):
    word: str
    source_lang: str
    target_lang: str


class VocabularyTranslateResponse(BaseModel):
    translation: str
