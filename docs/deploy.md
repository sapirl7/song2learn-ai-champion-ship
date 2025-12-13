# Deploy Guide (Vercel + Render)

This project deploys as:

- **Frontend**: Vercel (`frontend/`)
- **Backend API**: Render Web Service (`backend/`)
- **Database**: Postgres (Render Postgres or external)
- **Object Storage**: S3-compatible (Vultr Object Storage)

> Goal: make `song2learn.org` serve the Vercel frontend, and make the frontend talk to the Render backend at `/api`.

---

## 1) Repository expectations

Repo: `sapirl7/song2learn-ai-champion-ship`

Monorepo layout:

- `backend/` → FastAPI app (entrypoint `app.main:app`)
- `frontend/` → Vite/React app
- root `package.json` + `src/` also exist, so **do not rely on platform auto-detection** for backend.

---

## 2) Backend (Render) setup

### 2.1 Create/Configure Render Web Service

In Render Dashboard:

- **Service Type**: Web Service
- **Repository**: `sapirl7/song2learn-ai-champion-ship`
- **Branch**: `master` (or your release branch)
- **Root Directory**: `backend`
- **Runtime**: Python
- **Build Command**:
  - `pip install -r requirements.txt`
- **Start Command**:
  - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

> Important: Root Directory must be `backend` to avoid accidental Node app detection from the repo root.
>
> Important: ensure Render uses **Python 3.12.x (or 3.11.x)**. Some dependencies (e.g. `pydantic-core` for older `pydantic` pins)
> may not provide wheels for the newest Python (3.13) and will try to compile from source during deploy.
>
> Render requires `PYTHON_VERSION` as a full **major.minor.patch** value (e.g. `3.12.4`), not just `3.12`.

### 2.2 Environment variables (Render)

Set these in Render (names must match code):

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM` (optional; default `HS256`)
- `JWT_EXPIRE_MINUTES` (optional)
- `FRONTEND_URL` (set to `https://song2learn.org`)
- `CEREBRAS_API_KEY`
- `ELEVENLABS_API_KEY`
- `VULTR_S3_REGION`
- `VULTR_S3_ACCESS_KEY`
- `VULTR_S3_SECRET_KEY`
- `VULTR_S3_BUCKET`
- `RATE_LIMIT_ANALYZE` (optional; e.g. `60/minute`)
- `RATE_LIMIT_VOICE` (optional; e.g. `20/minute`)
- `TRUSTED_PROXIES` (optional; list for XFF validation). For `List[str]` values, Render env should be JSON, e.g. `["127.0.0.1","10.0.0.0/8"]`.

### 2.3 Post-deploy checks (Render)

Run these checks locally after deployment:

```bash
curl -sS https://<YOUR_RENDER_BACKEND_HOST>/health
curl -sS https://<YOUR_RENDER_BACKEND_HOST>/docs | head
curl -sS https://<YOUR_RENDER_BACKEND_HOST>/openapi.json | head
```

Expected:

- `/health` returns HTTP 200 with JSON
- `/docs` loads (Swagger UI)
- `openapi.json` contains `/api/...` routes

---

## 3) Frontend (Vercel) setup

### 3.1 Create/Configure Vercel project

In Vercel:

- **Project**: point to the repo `sapirl7/song2learn-ai-champion-ship`
- **Root Directory**: `frontend`
- **Install Command**: `npm ci` (or default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.2 Environment variables (Vercel)

Set:

- `VITE_API_URL=https://<YOUR_RENDER_BACKEND_HOST>/api`

> Must include the `/api` suffix, because backend routes are under `/api` and frontend calls `/auth/*`, `/songs/*`, etc.

### 3.3 Verify from browser

- Open `https://song2learn.org/login`
- Use the demo login button (if enabled)
- In DevTools → Network confirm requests go to:
  - `https://<YOUR_RENDER_BACKEND_HOST>/api/auth/...`

---

## 4) Domain (song2learn.org)

Recommended: keep domain on Vercel.

Checklist:

- `song2learn.org` and `www.song2learn.org` point to Vercel (either via Vercel-managed DNS or your DNS provider).
- Vercel project has `song2learn.org` added as a domain and verified.

---

## 5) Troubleshooting

### Frontend works but login/demo-login hangs

Most common cause:

- `VITE_API_URL` is missing `/api` (frontend sends requests to `/auth/...` instead of `/api/auth/...`).

### Render deploy builds “wrong thing”

Most common cause:

- Root Directory not set to `backend`, so Render tries to auto-detect from repo root.


Review render.yaml configurations from sapirl7/song2learn-ai-champion-ship.
