# SPEC v5 vs Current Code (Gap Matrix)

Source of “current” = repo `sapirl7/song2learn-ai-champion-ship` on branch `master` (same structure also exists on the `claude/...` demo branch except where noted).

Legend:

- **✅ Match**: aligns with v5 as-is
- **🟨 Partial**: similar intent, but differs in behavior/interface/details
- **❌ Gap**: missing or materially different; needs change to claim v5 compliance

---

## High-level scope

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Monorepo layout | `backend/` + `frontend/` | `backend/`, `frontend/`, plus root Node project (`package.json`, `src/`) | 🟨 | This can confuse platform auto-detection; deployment must pin root dir. |
| Backend framework | FastAPI | FastAPI | ✅ | `backend/app/main.py` |
| Frontend framework | React + Vite | React + Vite | ✅ | `frontend/` |

---

## Backend configuration & security

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Settings module path | `app/config.py` in spec | `backend/app/core/config.py` | 🟨 | Path differs; acceptable if env contract matches. |
| JWT env var name | `JWT_SECRET` | `JWT_SECRET` exists | ✅ | `backend/app/core/config.py` |
| CORS policy | `allow_origins=[settings.FRONTEND_URL]` | `allow_origins=["*"]` + `allow_credentials=True` | ❌ | `backend/app/main.py` differs from v5 and can break browser auth behavior. |
| Rate limiting | slowapi | slowapi | ✅ | `backend/app/core/limiter.py` + `backend/app/main.py` |
| XFF spoof protection | trust XFF only from trusted proxies | implemented | ✅ | `backend/app/core/limiter.py` |

---

## Backend HTTP client

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Shared async http client | `httpx.AsyncClient` singleton with stricter timeouts | singleton exists, but timeouts/limits differ | 🟨 | `backend/app/services/http_client.py` uses total timeout 30s; v5 suggests ~10s. |

---

## Caching (analysis)

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Key hash length | sha256 hex `[:16]` | sha256 `[:16]` | ✅ | `backend/app/services/cache_service.py` |
| Cache service wrapper | thread-safe `CacheService` with lock + `get/set` | raw `TTLCache` global | 🟨 | Works, but not the same API/locking as v5. |
| TTL | 1 hour | 1 hour | ✅ | `TTLCache(ttl=3600)` |

---

## Cerebras integration

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Endpoint | `/v1/chat/completions` | uses `https://api.cerebras.ai/v1/chat/completions` | ✅ | `backend/app/services/cerebras.py` |
| Model | `llama-3.3-70b` | `llama-3.3-70b` | ✅ | `backend/app/services/cerebras.py` |
| JSON-only guarantee | `response_format={"type":"json_object"}` | prompt asks JSON, but no `response_format` | ❌ | v5 explicitly requires response_format. |
| Input limits | line max 500, output truncation | no explicit max length/ truncation | 🟨 | Some logging truncates only. |
| “Don’t cache parse errors” | skip cache on parse errors | implemented | ✅ | parse errors return `None` and are not cached. |

---

## Voice + Object Storage (S3-compatible)

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Public URLs | `https://{bucket}.{region}.vultrobjects.com/...` | computed from settings properties | ✅ | `backend/app/core/config.py` |
| Key format | hash-based, `[:16]` | sha256 `[:16]` with `tts/` prefix | ✅ | `backend/app/services/voice_service.py` |
| Single S3 context | one client context for head+put | two separate contexts (`_check_exists`, `_upload_audio`) | ❌ | v5 explicitly wants single context per call. |
| ACL fallback | try `public-read`, fallback without ACL | implemented | ✅ | handles `AccessControlListNotSupported` / `AccessDenied`. |
| Speed clamp + voices map | clamp 0.7–1.2 + voice per language | not implemented | ❌ | current `speak(text, voice_id)` only. |
| Separate `StorageService` | not required in v5 (voice service handles storage) | `backend/app/services/storage.py` exists too | 🟨 | Duplicate approach: sync boto3 storage service alongside async aioboto3 voice service. |

---

## API routing

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| API prefix | `/api` | `/api` | ✅ | `backend/app/api/router.py` |
| Voice endpoint | `/api/voice/speak` | `/api/analyze/speak` | ❌ | Spec and current contract differ. |
| Analyze endpoint | `/api/analyze/line` | `/api/analyze/line` | ✅ | README + `backend/app/api/endpoints/analyze.py` |
| Auth endpoints | `/api/auth/*` | `/api/auth/*` | ✅ | `backend/app/api/endpoints/auth.py` |

---

## Database schema & migrations

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| Users table | UUID PK, email unique, password_hash, created_at | matches concept, extra `updated_at` | 🟨 | `backend/alembic/versions/001_initial_schema.py` |
| Songs table | unique index on lower(title/artist), translation JSONB, cached_at | different columns, no unique lower index, no JSONB translation | ❌ | migration differs materially. |
| User songs | `is_saved`, `last_viewed_at` | uses `saved_at` and uniqueness constraint | ❌ | schema differs. |
| Vocabulary | mostly similar | similar but `context` is `Text` not varchar(500) | 🟨 | acceptable, but differs from spec. |

---

## Frontend behavior

| Area | SPEC v5 expectation | Current implementation | Status | Notes / Evidence |
|---|---|---:|:--:|---|
| API base URL | `VITE_API_URL` should include `/api` | client uses `VITE_API_URL || '/api'` | 🟨 | Works locally with Vite proxy; production requires correct env value. |
| fetchUser on mount | must call on mount | implemented | ✅ | `frontend/src/App.jsx` |
| SongView hover analysis | hover delay ~150ms + abort | implemented | ✅ | `frontend/src/pages/SongView.jsx` |

---

## Summary (what blocks claiming “SPEC v5 FINAL”)

P0/P1 deltas vs the provided v5 spec:

1. **CORS**: current backend uses `allow_origins=["*"]` with credentials (❌).
2. **Voice API path**: spec expects `/api/voice/speak`, current uses `/api/analyze/speak` (❌).
3. **Cerebras `response_format`** missing (❌).
4. **Voice single S3 context** missing (❌).
5. **DB schema** differs materially (❌).


