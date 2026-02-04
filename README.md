<p align="center">
  <img src="https://img.shields.io/badge/Song2Learn-2.0-blueviolet?style=for-the-badge" alt="Song2Learn 2.0"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
</p>

<h1 align="center">🎵 Song2Learn</h1>

<p align="center">
  <strong>Learn languages through music you love</strong><br/>
  AI-powered lyric analysis • Native pronunciation • Personal vocabulary
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Song Search** | Search millions of songs via LRCLIB lyrics database |
| 📖 **AI Analysis** | Click any line → instant translation, grammar breakdown, vocabulary |
| 🔊 **Native Voice** | Listen to pronunciation via ElevenLabs TTS |
| 💾 **Personal Library** | Save songs and build your learning collection |
| 📚 **Vocabulary Tracker** | Save words, review, track progress |
| ✏️ **Exercises** | Translation practice with AI feedback |

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Frontend (React + Vite)"]
        UI[React Components]
        Store[Zustand State]
        API[API Client]
    end

    subgraph Server["⚡ Backend (FastAPI)"]
        Router[API Router]
        Auth[JWT Auth]
        Services[Service Layer]
    end

    subgraph External["☁️ External Services"]
        LRCLIB[(LRCLIB<br/>Lyrics)]
        Cerebras[Cerebras AI<br/>Analysis]
        Eleven[ElevenLabs<br/>TTS]
        Vultr[(Vultr S3<br/>Audio)]
    end

    subgraph Data["💾 Data Layer"]
        PG[(PostgreSQL)]
        Cache[In-Memory Cache]
    end

    UI --> Store --> API
    API -->|HTTPS| Router
    Router --> Auth
    Auth --> Services
    Services --> LRCLIB
    Services --> Cerebras
    Services --> Eleven
    Services --> Vultr
    Services --> PG
    Services --> Cache
```

---

## 🔄 User Flow

```mermaid
journey
    title Learning a Song with Song2Learn
    section Discovery
      Search for song: 5: User
      Import from LRCLIB: 3: System
      Save to library: 5: User
    section Learning
      View lyrics: 5: User
      Click line for analysis: 5: User
      AI generates breakdown: 4: System
      Listen to pronunciation: 5: User
    section Practice
      Add words to vocabulary: 5: User
      Do translation exercises: 4: User
      Get AI feedback: 4: System
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL

    U->>F: Login (email, password)
    F->>B: POST /api/auth/login
    B->>DB: Verify credentials
    DB-->>B: User record
    B->>B: Generate JWT tokens
    B-->>F: {access_token, refresh_token}
    F->>F: Store tokens
    
    Note over F,B: Subsequent requests
    F->>B: Request + Bearer token
    B->>B: Validate JWT
    B-->>F: Protected resource

    Note over F,B: Token refresh
    F->>B: POST /api/auth/refresh
    B-->>F: New access_token
```

---

## 📊 Data Model

```mermaid
erDiagram
    USER ||--o{ USER_SONG : saves
    USER ||--o{ VOCABULARY : learns
    USER ||--o{ SESSION : has
    SONG ||--o{ USER_SONG : "saved by"
    
    USER {
        uuid id PK
        string email UK
        string hashed_password
        string native_lang
        string target_lang
        boolean is_active
        datetime created_at
    }
    
    SONG {
        int id PK
        string title
        string artist
        text lyrics
        text synced_lyrics
        int lrclib_id UK
        datetime created_at
    }
    
    USER_SONG {
        int id PK
        uuid user_id FK
        int song_id FK
        datetime saved_at
    }
    
    VOCABULARY {
        int id PK
        uuid user_id FK
        string word
        string translation
        string context
        datetime created_at
    }
    
    SESSION {
        uuid id PK
        uuid user_id FK
        string refresh_token
        datetime expires_at
        boolean revoked
    }

    TTS_AUDIO {
        int id PK
        string text_hash UK
        string voice_id
        string s3_key
        string s3_url
        int size_bytes
        datetime created_at
    }
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td width="50%">

### Backend
- **FastAPI** — Async Python framework
- **PostgreSQL** — Primary database
- **SQLAlchemy** — Async ORM
- **Alembic** — Migrations
- **JWT** — Authentication
- **slowapi** — Rate limiting

</td>
<td width="50%">

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **React Router** — Navigation
- **Zustand** — State management
- **Axios** — HTTP client

</td>
</tr>
<tr>
<td>

### External Services
- **LRCLIB** — Lyrics database
- **Cerebras AI** — Language analysis
- **ElevenLabs** — Text-to-speech
- **Vultr S3** — Audio storage

</td>
<td>

### DevOps
- **Docker** — Containerization
- **Render** — Backend hosting
- **Vercel** — Frontend hosting
- **GitHub Actions** — CI/CD

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Clone & Configure

```bash
git clone https://github.com/sapirl7/song2learn-ai-champion-ship.git
cd song2learn-ai-champion-ship

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### 2. Start Services

```bash
# Start PostgreSQL
docker compose up -d

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install && npm run dev
```

### 3. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user info |

### Songs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/songs/search?q=` | Search LRCLIB |
| POST | `/api/songs/import` | Import song |
| GET | `/api/songs/{id}` | Get song by ID |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze/line` | AI analysis of lyric |
| POST | `/api/voice/speak` | Generate TTS audio |
| POST | `/api/vocabulary` | Add vocabulary word |
| GET | `/api/vocabulary` | Get all vocabulary |

---

## 🔧 Configuration

<details>
<summary><strong>Environment Variables</strong></summary>

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/song2learn

# Authentication
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# Feature Flags
FEATURE_AI=true
FEATURE_VOICE=true
FEATURE_GOOGLE_AUTH=false

# External Services
CEREBRAS_API_KEY=...
ELEVENLABS_API_KEY=...
VULTR_S3_ACCESS_KEY=...
VULTR_S3_SECRET_KEY=...
VULTR_S3_BUCKET=song2learn-audio
VULTR_S3_REGION=ams1

# Rate Limiting
RATE_LIMIT_ANALYZE=60/minute
RATE_LIMIT_VOICE=20/minute
```

</details>

---

## 📁 Project Structure

```
song2learn/
├── backend/
│   ├── alembic/           # Database migrations
│   ├── app/
│   │   ├── api/           # FastAPI endpoints
│   │   │   └── endpoints/ # Route handlers
│   │   ├── core/          # Config, security
│   │   ├── db/            # Database session
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── tests/             # Pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page views
│   │   └── stores/        # Zustand stores
│   └── package.json
├── docs/                  # Documentation
├── docker-compose.yml
├── render.yaml            # Render deployment
└── README.md
```

---

## 🌐 Deployment

The app deploys as a split architecture:

```mermaid
flowchart LR
    subgraph Vercel["Vercel"]
        FE[Frontend<br/>React SPA]
    end
    
    subgraph Render["Render"]
        BE[Backend API<br/>FastAPI]
        DB[(PostgreSQL)]
    end
    
    subgraph Vultr["Vultr"]
        S3[(Object Storage<br/>Audio Files)]
    end
    
    User((User)) --> FE
    FE -->|API calls| BE
    BE --> DB
    BE --> S3
```

See [docs/deploy.md](docs/deploy.md) for detailed deployment instructions.

---

## 📄 License

MIT © 2026
