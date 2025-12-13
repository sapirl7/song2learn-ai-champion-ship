# ТЗ для агента Claude: довести проект до SPEC v5 и стабильно задеплоить (Vercel + Render)

Репозиторий: `sapirl7/song2learn-ai-champion-ship`  
Цель: привести backend/frontend и деплой к состоянию, которое соответствует “Song2Learn 2.0 — Final Specification (v5)”, и добиться стабильной работы `song2learn.org`.

## Ограничения

- Не добавлять в Git никакие `.env`, приватные ключи, токены, дампы и т.п.
- Все изменения делать **в отдельной ветке** и через PR в `master`.
- Изменения проводить итеративно: после каждого крупного шага — локальная проверка + деплой smoke-check.

---

## 1) План работ (высокий уровень)

1. Зафиксировать целевую схему деплоя (Vercel frontend, Render backend, Postgres, S3-compatible storage).
2. Привести backend к SPEC v5 по P0/P1 пунктам (CORS, voice endpoint, Cerebras JSON-only, voice storage behavior, конфиги).
3. Привести фронтенд окружение к корректному `VITE_API_URL` (обязательно с `/api`).
4. Убедиться, что Render билдит именно `backend/`, а не корень репозитория.
5. (Опционально) привести миграции/схему БД к v5 или зафиксировать осознанное отклонение в документации.
6. Прогнать end-to-end smoke checks на прод-окружении.

Deliverable: PR, который делает поведение детерминированным и подтверждено проверками.

---

## 2) Git workflow

1. Создать ветку:
   - `fix/spec-v5-align-and-deploy`
2. Вести работу коммитами небольшого размера, с понятными сообщениями.
3. Перед пушем:
   - `git status` чистый
   - поиск по репо на “секретные паттерны” ничего не возвращает
4. Открыть PR в `master` и вставить описание из `docs/pr_description.md` (адаптировать под реальные изменения).

---

## 3) Backend (FastAPI) — SPEC v5 compliance

### 3.1 Конфиг (env vars)

Проверить `backend/app/core/config.py` и привести к контракту v5 по смыслу:

- env vars должны называться и использоваться так:
  - `DATABASE_URL`
  - `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`
  - `CEREBRAS_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `VULTR_S3_REGION`, `VULTR_S3_ACCESS_KEY`, `VULTR_S3_SECRET_KEY`, `VULTR_S3_BUCKET`
  - `FRONTEND_URL`
  - `RATE_LIMIT_ANALYZE`, `RATE_LIMIT_VOICE`
  - `TRUSTED_PROXIES`

Acceptance:

- backend поднимается без `.env` файла (в prod) — только из env vars.

### 3.2 CORS (P0)

В `backend/app/main.py`:

- `allow_origins=[settings.FRONTEND_URL]` (не `*`)
- `allow_credentials=True`
- `allow_methods=["*"]`
- `allow_headers=["*"]`

Acceptance:

- запросы с `song2learn.org` проходят
- запросы с чужих origin — блокируются браузером

### 3.3 Rate limiting + XFF (P0)

Проверить `backend/app/core/limiter.py`:

- `X-Forwarded-For` учитывается только если source IP относится к `TRUSTED_PROXIES`.

### 3.4 HTTP client (P1)

`backend/app/services/http_client.py`:

- привести таймауты и limits к v5 значениям (10s total, connect 3s; keepalive/max connections как в v5).

### 3.5 Cache service (P1)

`backend/app/services/cache_service.py`:

- реализовать `CacheService` с lock и методами `get/set`
- `make_analysis_key()` должен остаться sha256 `[:16]`

### 3.6 Cerebras (P0/P1)

`backend/app/services/cerebras.py`:

- использовать `response_format={"type":"json_object"}` (как в v5)
- ограничить входную строку до 500 символов
- ограничить поля ответа по длине (translation/grammar и т.п.)
- не кешировать parse errors / invalid content
- (если используете latency/cached флаги в UI) возвращать `cached` и `latency_ms`

Acceptance:

- при повторном запросе по той же строке/парам ответ приходит из кэша
- при JSON parse error ничего не кэшируется

### 3.7 Voice (P0/P1)

`backend/app/services/voice_service.py`:

- сделать **single S3 context**: один `async with s3client as s3` на head+put
- реализовать voices map по языкам и clamp скорости 0.7–1.2
- ACL fallback: try `public-read`, fallback без ACL

Acceptance:

- повторный запрос → head hit → возвращаем существующий URL
- при отключенных ACL → fallback upload работает

### 3.8 API paths (P0)

SPEC v5 ожидает `/api/voice/speak`, а текущий проект использует `/api/analyze/speak`.

Сделать:

- добавить `/api/voice/speak` (новый endpoint)
- оставить `/api/analyze/speak` как alias/backward compatible (пока фронт не переключен)

Acceptance:

- оба эндпоинта возвращают `{ "audio_url": "..." }`

---

## 4) Database schema vs v5

Сравнить `docs/spec-v5-gap.md` раздел “Database schema & migrations”.

Выбрать и зафиксировать один путь:

- Вариант A: привести миграции к v5 (новая alembic миграция)
- Вариант B: оставить текущую схему и обновить spec/документацию, что есть отклонения (тогда нельзя утверждать “строго v5”)

Deliverable: явное решение в PR.

---

## 5) Frontend (Vercel) — production config

### 5.1 `VITE_API_URL` обязателен с `/api` (P0)

В Vercel Env Vars:

- `VITE_API_URL=https://<BACKEND_HOST>/api`

Acceptance:

- Network показывает запросы на `.../api/auth/...`, `.../api/songs/...`, и т.д.

### 5.2 Demo login

Если demo-login включен:

- кнопка на `/login` делает запрос и редиректит на `/search`

---

## 6) Deploy steps (чек-лист)

Ориентироваться на `docs/deploy.md`.

### Backend (Render)

- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

- Root Directory: `frontend`
- Build: `npm run build`
- Env: `VITE_API_URL` (с `/api`)

---

## 7) Smoke checks (обязательные)

После деплоя:

Backend:

- `GET https://<BACKEND_HOST>/health` → 200
- `GET https://<BACKEND_HOST>/docs` → загружается
- OpenAPI содержит нужные роуты `/api/*`

Frontend:

- `https://song2learn.org/login` → загружается
- авторизация (и demo-login если нужно) → редирект на `/search`
- открыть песню → hover analysis → voice playback

---

## 8) Итоговый deliverables (что “готово”)

- PR в `master` с изменениями, соответствующими v5, и заполненным `docs/pr_description.md`
- `docs/deploy.md` актуален и повторяем
- `docs/spec-v5-gap.md` обновлён: все P0/P1 gaps закрыты или явно задокументированы как “не делаем”


