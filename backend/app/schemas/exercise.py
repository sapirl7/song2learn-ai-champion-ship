from pydantic import BaseModel


class TranslationCheckRequest(BaseModel):
    song_id: int
    line_index: int
    original: str
    user_translation: str
    # optional, to respect UI-selected languages
    native_lang: str | None = None
    learning_lang: str | None = None


class TranslationCheckResponse(BaseModel):
    is_correct: bool
    feedback: str
    suggested_translation: str
