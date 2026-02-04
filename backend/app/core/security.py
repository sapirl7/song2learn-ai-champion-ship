from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
import hashlib
import hmac

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _create_token(data: Dict[str, Any], token_type: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if token_type == ACCESS_TOKEN_TYPE:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        else:
            expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "token_type": token_type})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    return _create_token(data, ACCESS_TOKEN_TYPE, expires_delta)


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    return _create_token(data, REFRESH_TOKEN_TYPE, expires_delta)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def decode_access_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if not payload or payload.get("token_type") != ACCESS_TOKEN_TYPE:
        return None
    return payload


def decode_refresh_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if not payload or payload.get("token_type") != REFRESH_TOKEN_TYPE:
        return None
    return payload


def hash_refresh_token(token: str) -> str:
    """
    Hash refresh tokens before storing in DB.
    Uses HMAC-SHA256 with JWT_SECRET as the key.
    """
    secret = settings.JWT_SECRET.encode()
    return hmac.new(secret, token.encode(), hashlib.sha256).hexdigest()


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    """Get current user ID from JWT token. Returns UUID."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UUID(user_id)
