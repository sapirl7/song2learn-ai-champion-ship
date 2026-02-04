# Logging & Tracing Policy

## Goals
- Zero PII in logs.
- Every request traceable by `request_id`.
- Logs are structured JSON for parsing/alerting.

## PII Definition (for this project)
- Email addresses
- Full names
- Tokens (access/refresh/ID)
- Authorization headers
- User-generated text (lyrics, vocabulary entries, prompts)
- IP addresses (stored in DB for sessions, but **never logged**)

## Mandatory Rules
1. **Never log PII**. If you need to identify a user, log `user_id` only.
2. **Never log tokens**. Any key containing `token` is redacted.
3. **Never log user-provided content** (`text`, `line`, `word`, etc.).
4. All logs must include `request_id` (middleware binds this automatically).

## Implementation Notes
- PII redaction is enforced centrally in `backend/app/main.py` via a structlog processor.
- Request context is injected by `RequestContextMiddleware` and propagated to the logger.

## Operational Guidance
- If new fields are added to logs, ensure they are not PII.
- If you must debug content, log it locally in development only and never in production.
- Review logs periodically for accidental leakage.
