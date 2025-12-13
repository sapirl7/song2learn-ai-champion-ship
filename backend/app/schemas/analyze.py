from typing import Optional, List
from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    line: str
    native_lang: Optional[str] = "en"
    learning_lang: Optional[str] = "en"
    song_id: int = 0
    line_index: int = 0


class AnalyzeResponse(BaseModel):
    translation: str
    grammar: str
    vocabulary: list[dict]


class SpeakRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    language: Optional[str] = None
    speed: Optional[float] = None


class SpeakResponse(BaseModel):
    audio_url: str


class InterlinearRequest(BaseModel):
    line: str
    native_lang: Optional[str] = "en"
    learning_lang: Optional[str] = "en"
    song_id: int = 0
    line_index: int = 0


class InterlinearToken(BaseModel):
    orig: str
    trans: str


class InterlinearResponse(BaseModel):
    tokens: List[InterlinearToken]
    cached: bool = False
    latency_ms: int = 0
