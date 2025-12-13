from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

def _as_asyncpg_url(url: str) -> str:
    """
    Render Postgres often provides DATABASE_URL like 'postgres://...' or 'postgresql://...'.
    SQLAlchemy will default to psycopg2 for those, but this app uses asyncpg.
    """
    if not url:
        return url
    if "+asyncpg" in url:
        return url
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgresql://")
    return url


engine = create_async_engine(
    _as_asyncpg_url(settings.DATABASE_URL),
    echo=settings.DEBUG,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
