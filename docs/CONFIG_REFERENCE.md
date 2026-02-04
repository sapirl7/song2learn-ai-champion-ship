# Configuration Reference

> All environment variables and configuration options for Song2Learn

---

## Backend Configuration

### Core Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | - | ✅ |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` | |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `30` | |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `FEATURE_AI` | Enable AI analysis | `false` |
| `FEATURE_VOICE` | Enable TTS | `false` |
| `FEATURE_GOOGLE_AUTH` | Enable Google OAuth | `false` |

### External Services

| Variable | Description | Required If |
|----------|-------------|-------------|
| `CEREBRAS_API_KEY` | Cerebras AI key | `FEATURE_AI=true` |
| `ELEVENLABS_API_KEY` | ElevenLabs key | `FEATURE_VOICE=true` |
| `LRCLIB_BASE_URL` | LRCLIB API endpoint | Always |

### Vultr Object Storage

| Variable | Description | Required If |
|----------|-------------|-------------|
| `VULTR_S3_ACCESS_KEY` | Access key | `FEATURE_VOICE=true` |
| `VULTR_S3_SECRET_KEY` | Secret key | `FEATURE_VOICE=true` |
| `VULTR_S3_BUCKET` | Bucket name | `FEATURE_VOICE=true` |
| `VULTR_S3_REGION` | Region (e.g., `ams1`) | `FEATURE_VOICE=true` |

### Voice Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `VOICE_SIGNED_URLS` | Use signed S3 URLs | `false` |
| `VOICE_SIGNED_URL_TTL_SECONDS` | URL expiry time | `3600` |
| `VOICE_TTL_DAYS` | Audio retention | `30` |
| `TTS_CLEANUP_BATCH` | Cleanup batch size | `100` |

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_ANALYZE` | Analysis rate limit | `60/minute` |
| `RATE_LIMIT_VOICE` | Voice rate limit | `20/minute` |
| `TRUSTED_PROXIES` | Trusted proxy IPs (JSON list) | `[]` |

---

## Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |
| `VITE_ENABLE_GOOGLE_AUTH` | Show Google login | `false` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | - |

---

## Example `.env` Files

### Backend Development

```env
# backend/.env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/song2learn

JWT_SECRET=dev-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

FEATURE_AI=false
FEATURE_VOICE=false
FEATURE_GOOGLE_AUTH=false

LRCLIB_BASE_URL=https://lrclib.net/api
LRCLIB_USER_AGENT=Song2Learn/2.0

# Required if FEATURE_AI=true
# CEREBRAS_API_KEY=

# Required if FEATURE_VOICE=true
# ELEVENLABS_API_KEY=
# VULTR_S3_ACCESS_KEY=
# VULTR_S3_SECRET_KEY=
# VULTR_S3_BUCKET=song2learn-audio
# VULTR_S3_REGION=ams1

RATE_LIMIT_ANALYZE=60/minute
RATE_LIMIT_VOICE=20/minute
```

### Frontend Development

```env
# frontend/.env.local
VITE_API_URL=http://localhost:8000/api
VITE_ENABLE_GOOGLE_AUTH=false
```

### Production (Render)

See [render.yaml](../render.yaml) for production configuration template.
