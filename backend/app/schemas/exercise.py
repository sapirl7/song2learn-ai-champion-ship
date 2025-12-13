from pydantic import BaseModel


class TranslationCheckRequest(BaseModel):
    song_id: int
    line_index: int
    original: str
    user_translation: str


class TranslationCheckResponse(BaseModel):
    is_correct: bool
    feedback: str
    suggested_translation: str
