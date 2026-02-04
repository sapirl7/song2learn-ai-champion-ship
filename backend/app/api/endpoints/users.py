from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserPreferencesUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me/preferences", response_model=UserResponse)
async def update_preferences(
    data: UserPreferencesUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    user.native_lang = data.native_lang
    user.learning_lang = data.learning_lang
    await db.commit()
    await db.refresh(user)
    return user
