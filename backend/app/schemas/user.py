from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    native_lang: Optional[str] = "en"
    learning_lang: Optional[str] = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    native_lang: Optional[str]
    learning_lang: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    id_token: str
    native_lang: Optional[str] = "en"
    learning_lang: Optional[str] = "en"


class LogoutRequest(BaseModel):
    refresh_token: str


class UserPreferencesUpdate(BaseModel):
    native_lang: str
    learning_lang: str
