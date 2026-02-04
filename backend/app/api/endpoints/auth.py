from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
import structlog
from cachetools import TTLCache
from jose import jwt, jwk, JWTError

from app.db.session import get_db
from app.models.user import User
from app.models.session import Session
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
    GoogleAuthRequest,
    LogoutRequest,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_refresh_token,
    get_current_user_id,
)
from app.core.limiter import limiter, get_real_ip
from app.core.config import settings
from app.services.http_client import get_http_client

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])

_GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
_GOOGLE_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}
_google_jwks_cache: TTLCache = TTLCache(maxsize=1, ttl=3600)
_google_jwks_lock = asyncio.Lock()


def _issue_tokens(user_id: UUID) -> tuple[str, str]:
    access_token = create_access_token(data={"sub": str(user_id)})
    refresh_token = create_refresh_token(data={"sub": str(user_id)})
    return access_token, refresh_token


def _refresh_expiry() -> datetime:
    return datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)


async def _create_refresh_session(db: AsyncSession, user_id: UUID, refresh_token: str, request: Request) -> Session:
    token_hash = hash_refresh_token(refresh_token)
    session = Session(
        user_id=user_id,
        token_hash=token_hash,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_real_ip(request),
        created_at=datetime.utcnow(),
        expires_at=_refresh_expiry(),
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def _fetch_google_jwks() -> list[dict]:
    client = get_http_client()
    resp = await client.get(_GOOGLE_JWKS_URL)
    resp.raise_for_status()
    data = resp.json() or {}
    return data.get("keys", [])


async def _get_google_jwks() -> list[dict]:
    cached = _google_jwks_cache.get("jwks")
    if cached:
        return cached
    async with _google_jwks_lock:
        cached = _google_jwks_cache.get("jwks")
        if cached:
            return cached
        jwks = await _fetch_google_jwks()
        _google_jwks_cache["jwks"] = jwks
        return jwks


async def _verify_google_id_token(id_token: str) -> dict:
    if not settings.GOOGLE_CLIENT_IDS:
        raise HTTPException(status_code=503, detail="Google login not configured")

    try:
        header = jwt.get_unverified_header(id_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    jwks = await _get_google_jwks()
    key_dict = next((k for k in jwks if k.get("kid") == kid), None)
    if key_dict is None:
        # Force refresh once (key rotation)
        _google_jwks_cache.pop("jwks", None)
        jwks = await _get_google_jwks()
        key_dict = next((k for k in jwks if k.get("kid") == kid), None)
        if key_dict is None:
            raise HTTPException(status_code=401, detail="Invalid Google token")

    public_key = jwk.construct(key_dict).to_pem().decode()
    try:
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False, "verify_iss": False},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    issuer = payload.get("iss")
    if issuer not in _GOOGLE_ISSUERS:
        raise HTTPException(status_code=401, detail="Invalid Google token issuer")

    audience = payload.get("aud")
    if audience not in settings.GOOGLE_CLIENT_IDS:
        raise HTTPException(status_code=401, detail="Invalid Google token audience")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")

    return payload


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        native_lang=user_data.native_lang,
        learning_lang=user_data.learning_lang,
        auth_provider="email",
        email_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("user_registered", user_id=user.id)

    # Generate tokens + session
    access_token, refresh_token = _issue_tokens(user.id)
    await _create_refresh_session(db, user.id, refresh_token, request)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get access + refresh tokens."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    logger.info("user_logged_in", user_id=user.id)

    access_token, refresh_token = _issue_tokens(user.id)
    await _create_refresh_session(db, user.id, refresh_token, request)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
async def google_login(request: Request, data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Login or register via Google ID token (auto-link by email)."""
    payload = await _verify_google_id_token(data.id_token)
    email = payload.get("email")
    google_sub = payload.get("sub")
    email_verified = bool(payload.get("email_verified", False))
    full_name = payload.get("name") or None

    # 1) Prefer lookup by google_sub
    result = await db.execute(select(User).where(User.google_sub == google_sub))
    user = result.scalar_one_or_none()

    # 2) Auto-link by email if no google_sub match
    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.google_sub = user.google_sub or google_sub
            if user.full_name is None and full_name:
                user.full_name = full_name
            if email_verified and not user.email_verified:
                user.email_verified = True
            if user.auth_provider is None:
                user.auth_provider = "email"
            await db.commit()
            await db.refresh(user)

    # 3) Create new user if needed
    if not user:
        user = User(
            email=email,
            password_hash=None,
            native_lang=data.native_lang or "en",
            learning_lang=data.learning_lang or "en",
            auth_provider="google",
            google_sub=google_sub,
            email_verified=email_verified,
            full_name=full_name,
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            await db.rollback()
            # Race condition fallback: try to re-select by email
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one()

    logger.info("user_logged_in_google", user_id=user.id)

    access_token, refresh_token = _issue_tokens(user.id)
    await _create_refresh_session(db, user.id, refresh_token, request)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("30/minute")
async def refresh_tokens(request: Request, data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Rotate refresh token and issue new access token."""
    payload = decode_refresh_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_hash = hash_refresh_token(data.refresh_token)
    now = datetime.utcnow()

    result = await db.execute(
        select(Session).where(
            Session.user_id == user_uuid,
            Session.token_hash == token_hash,
            Session.revoked_at.is_(None),
            Session.expires_at > now,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        # Token reuse or stale token: revoke all sessions for safety
        await db.execute(
            update(Session)
            .where(Session.user_id == user_uuid, Session.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    # Rotate refresh token
    session.revoked_at = now
    session.last_used_at = now

    access_token, refresh_token = _issue_tokens(user_uuid)
    new_session = Session(
        user_id=user_uuid,
        token_hash=hash_refresh_token(refresh_token),
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_real_ip(request),
        created_at=now,
        expires_at=_refresh_expiry(),
    )
    db.add(new_session)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def logout(request: Request, data: LogoutRequest, db: AsyncSession = Depends(get_db)):
    """
    Revoke a refresh token (logout).
    """
    payload = decode_refresh_token(data.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_hash = hash_refresh_token(data.refresh_token)
    now = datetime.utcnow()

    result = await db.execute(
        select(Session).where(
            Session.user_id == user_uuid,
            Session.token_hash == token_hash,
            Session.revoked_at.is_(None),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        # Already revoked or unknown token; treat as success to avoid token probing.
        return None

    session.revoked_at = now
    session.last_used_at = now
    await db.commit()
    return None


@router.post("/revoke-all", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def revoke_all_sessions(
    user_id=Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Revoke all active refresh sessions for the current user.
    """
    now = datetime.utcnow()
    await db.execute(
        update(Session)
        .where(Session.user_id == user_id, Session.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    await db.commit()
    return None


@router.post("/demo-login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def demo_login(request: Request, db: AsyncSession = Depends(get_db)):
    """Demo login for hackathon judges - no password required."""
    if not settings.DEBUG:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    demo_email = "demo@song2learn.org"

    # Check if demo user exists
    try:
        result = await db.execute(select(User).where(User.email == demo_email))
        user = result.scalar_one_or_none()
    except Exception as e:
        logger.error("demo_login_db_select_error", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Database error")

    if not user:
        # Create demo user on the fly
        user = User(
            email=demo_email,
            password_hash=get_password_hash("demo-judge-2024"),
            native_lang="en",
            learning_lang="es",
            auth_provider="email",
            email_verified=False,
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
            logger.info("demo_user_created", user_id=user.id)
        except IntegrityError as e:
            # Possible concurrent creation; recover by re-selecting.
            await db.rollback()
            logger.warning("demo_user_race_condition", error=str(e))
            result = await db.execute(select(User).where(User.email == demo_email))
            user = result.scalar_one()
        except Exception as e:
            await db.rollback()
            logger.error("demo_login_db_create_error", error=str(e), exc_info=True)
            raise HTTPException(status_code=500, detail="Database error")

    logger.info("demo_login", user_id=user.id)

    access_token, refresh_token = _issue_tokens(user.id)
    await _create_refresh_session(db, user.id, refresh_token, request)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id=Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current user information."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
