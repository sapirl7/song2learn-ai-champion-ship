from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import structlog
from structlog.contextvars import merge_contextvars, bind_contextvars, clear_contextvars
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4

from app.api.router import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.services.http_client import init_http_client, close_http_client

# Redaction helpers
SENSITIVE_KEYS = {
    "email",
    "password",
    "authorization",
    "access_token",
    "refresh_token",
    "id_token",
    "token",
    "token_hash",
    "text",
    "line",
    "word",
}


def _is_sensitive_key(key: str) -> bool:
    key_l = key.lower()
    if key_l in SENSITIVE_KEYS:
        return True
    if "password" in key_l:
        return True
    if "token" in key_l and key_l != "token_type":
        return True
    if "email" in key_l:
        return True
    return False


def _redact_event(_, __, event_dict):
    def redact(value):
        if isinstance(value, dict):
            return {k: ("[REDACTED]" if _is_sensitive_key(k) else redact(v)) for k, v in value.items()}
        if isinstance(value, list):
            return [redact(v) for v in value]
        return value

    return redact(event_dict)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid4())
        request.state.request_id = request_id
        bind_contextvars(request_id=request_id, path=request.url.path, method=request.method)
        try:
            response = await call_next(request)
        finally:
            clear_contextvars()
        response.headers["X-Request-ID"] = request_id
        return response

# Configure structured logging
structlog.configure(
    processors=[
        merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        _redact_event,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


async def _cleanup_sessions():
    """
    Best-effort cleanup of expired sessions on startup.
    This avoids unbounded growth without introducing a scheduler dependency.
    """
    from datetime import datetime
    from sqlalchemy import delete
    from app.db.session import AsyncSessionLocal
    from app.models.session import Session

    async with AsyncSessionLocal() as db:
        await db.execute(
            delete(Session).where(Session.expires_at <= datetime.utcnow())
        )
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("application_startup", debug=settings.DEBUG)
    settings.validate_runtime()
    await init_http_client()
    try:
        await _cleanup_sessions()
    except Exception as e:
        logger.warning("session_cleanup_failed", error=str(e))
    try:
        from app.services.tts_cleanup import cleanup_expired_tts
        await cleanup_expired_tts()
    except Exception as e:
        logger.warning("tts_cleanup_failed", error=str(e))
    yield
    # Shutdown
    logger.info("application_shutdown")
    await close_http_client()


app = FastAPI(
    title="Song2Learn API",
    description="Learn languages through song lyrics",
    version="1.0.0",
    lifespan=lifespan,
)

# Request context (request_id, method, path)
app.add_middleware(RequestContextMiddleware)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression for responses > 1KB
from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error("unhandled_exception", error=str(exc), path=request.url.path, exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
    request_id = getattr(request.state, "request_id", None)
    if request_id:
        response.headers["X-Request-ID"] = request_id
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
