from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
import structlog

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user_id
from app.core.limiter import limiter

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])


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
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("user_registered", user_id=user.id, email=user.email)

    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and get access token."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    logger.info("user_logged_in", user_id=user.id)

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.post("/demo-login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def demo_login(request: Request, db: AsyncSession = Depends(get_db)):
    """Demo login for hackathon judges - no password required."""
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

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id = Depends(get_current_user_id),
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
