## Summary

Align the project with **Song2Learn 2.0 — Final Specification (v5)** and make deployments predictable and reproducible:

- Clarify what is deployed where (Vercel frontend, Render backend, Postgres, S3-compatible storage).
- Standardize runtime configuration and API base URL expectations.
- Close SPEC v5 gaps in backend services (CORS, voice endpoint, Cerebras JSON-only responses, voice storage behavior, schema alignment).

## Why

We currently have multiple moving parts (Vercel + Render + DB + object storage) and the repo is a monorepo (backend + frontend + root Node files). Without explicit deployment configuration, it’s easy to deploy the wrong root or end up with mismatched API base URLs.

This PR aims to:

- Make deploy behavior deterministic
- Provide clear verification steps
- Bring code and schema closer to the agreed v5 specification

## Changes in this PR

> Replace this list with the actual changes you made in the PR.

- Backend:
  - [ ] CORS matches v5 (only allow `FRONTEND_URL` origin)
  - [ ] Voice API available at `/api/voice/speak` (keep backward-compatible alias if needed)
  - [ ] Cerebras requests enforce JSON-only response format (v5 requirement)
  - [ ] Voice generation uses a single S3 client context per request, with ACL fallback
  - [ ] Rate limiting and trusted proxy handling verified
  - [ ] Optional: schema/migrations aligned with v5 or documented deviation
- Frontend:
  - [ ] Production env expects `VITE_API_URL` including `/api`
  - [ ] Demo login works end-to-end against the deployed backend (if enabled)
- Docs:
  - [ ] `docs/deploy.md` updated
  - [ ] `docs/spec-v5-gap.md` updated

## How to test

### Local

- Backend:
  - `cd backend && pip install -r requirements.txt`
  - `uvicorn app.main:app --reload --port 8000`
  - `curl -sS http://localhost:8000/health`
- Frontend:
  - `cd frontend && npm ci`
  - `npm run dev`
  - Open `http://localhost:3000`

### Deployed smoke checks

- Backend:
  - `GET https://<BACKEND_HOST>/health` → 200
  - `GET https://<BACKEND_HOST>/docs` loads
  - Ensure OpenAPI contains:
    - `/api/auth/*`
    - `/api/analyze/line`
    - `/api/voice/speak` (and any legacy alias if kept)
- Frontend:
  - `https://song2learn.org/login` loads
  - Auth/demo-login works (if enabled)
  - Song search → open song → hover analysis → voice works

## Deployment notes

- Render backend must be configured with **Root Directory = `backend`**.
- Vercel frontend must have **Root Directory = `frontend`**.
- Vercel must be configured with `VITE_API_URL=https://<BACKEND_HOST>/api` (must include `/api`).

## Rollback plan

- Revert this PR in `master`.
- Redeploy frontend and backend from the previous green commit.

## Follow-ups

- Add CI to validate backend + frontend builds and basic smoke tests.
- Add minimal integration test that asserts frontend calls `/api/*` correctly in production configuration.


