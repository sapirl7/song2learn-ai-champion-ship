import ipaddress
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request
from app.core.config import settings


def _is_trusted_proxy(ip: str) -> bool:
    """Check if IP belongs to trusted proxy network."""
    try:
        addr = ipaddress.ip_address(ip)
        for trusted in settings.TRUSTED_PROXIES:
            if "/" in trusted:
                if addr in ipaddress.ip_network(trusted, strict=False):
                    return True
            elif ip == trusted:
                return True
    except ValueError:
        pass
    return False


def get_real_ip(request: Request) -> str:
    """Get real client IP, but only trust XFF from known proxies."""
    client_ip = get_remote_address(request) or "unknown"

    # Only trust X-Forwarded-For if request came from trusted proxy
    if _is_trusted_proxy(client_ip):
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

    return client_ip


limiter = Limiter(key_func=get_real_ip)
