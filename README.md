# Song2Learn 2.0

Learn languages through song lyrics! Song2Learn is a web application that helps you learn new languages by analyzing song lyrics, providing translations, grammar explanations, and pronunciation practice.

## Features

- 🎵 **Song Search**: Search and import songs from LRCLIB (lyrics database)
- 📖 **Lyric Analysis**: Click on any line for translation, grammar breakdown, and vocabulary
- 🔊 **Pronunciation**: Listen to native pronunciation via ElevenLabs TTS
- 💾 **Save Songs**: Build your personal library of songs to learn from
- 📚 **Vocabulary**: Save and manage words you're learning
- ✏️ **Exercises**: Practice translation with AI-powered feedback

## Tech Stack

### Backend
- **FastAPI** - Modern async Python web framework
- **PostgreSQL** - Database
- **Alembic** - Database migrations
- **JWT** - Authentication
- **LRCLIB** - Lyrics source
- **Cerebras AI** - Language analysis
- **ElevenLabs** - Text-to-speech
- **Vultr Object Storage** - Audio file storage (S3-compatible)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client

## Prerequisites

- **Docker** and **Docker Compose**
- **Python 3.11+**
- **Node.js 18+**
- API keys for:
  - [Cerebras](https://cerebras.ai/) - Language analysis
  - [ElevenLabs](https://elevenlabs.io/) - Text-to-speech
  - [Vultr Object Storage](https://www.vultr.com/products/object-storage/) - Audio storage

## Quick Start (Local Development)

### 1. Clone and setup environment

```bash
# Clone the repository
git clone <your-repo-url>
cd song2learn

# Copy environment files
cp backend/.env.example backend/.env
```

### 2. Configure environment variables

Edit `backend/.env` with your API keys:

```env
# Required API keys
CEREBRAS_API_KEY=your-cerebras-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
VULTR_ACCESS_KEY=your-vultr-access-key
VULTR_SECRET_KEY=your-vultr-secret-key
VULTR_BUCKET_NAME=your-bucket-name
VULTR_REGION=ewr1

# Important: Change this in production!
JWT_SECRET_KEY=generate-a-secure-random-string
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Setup and run Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 5. Setup and run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 6. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Songs
- `GET /api/songs/search?q=query` - Search songs via LRCLIB
- `POST /api/songs/import` - Import song from LRCLIB
- `GET /api/songs/{id}` - Get song by ID

### User Songs
- `POST /api/user-songs/{song_id}/save` - Toggle save song
- `GET /api/user-songs/saved` - Get saved songs
- `GET /api/user-songs/{song_id}/is-saved` - Check if song is saved

### Analysis
- `POST /api/analyze/line` - Analyze a lyric line (translation, grammar, vocabulary)
- `POST /api/analyze/speak` - Generate TTS audio for text

### Vocabulary
- `POST /api/vocabulary` - Add word to vocabulary
- `GET /api/vocabulary` - Get all vocabulary
- `DELETE /api/vocabulary/{id}` - Delete vocabulary entry

### Exercises
- `POST /api/exercises/translation-check` - Check translation attempt

## Deployment to Raindrop

### Prerequisites
1. Install [Raindrop CLI](https://docs.raindrop.cloud/)
2. Have your Raindrop account configured

### Deploy Backend

```bash
cd backend

# Create Raindrop app
raindrop apps create song2learn-api

# Set environment variables
raindrop config set CEREBRAS_API_KEY=xxx
raindrop config set ELEVENLABS_API_KEY=xxx
raindrop config set VULTR_ACCESS_KEY=xxx
raindrop config set VULTR_SECRET_KEY=xxx
raindrop config set VULTR_BUCKET_NAME=xxx
raindrop config set VULTR_REGION=xxx
raindrop config set JWT_SECRET_KEY=xxx
raindrop config set DATABASE_URL=xxx  # Your Raindrop Postgres URL

# Deploy
raindrop deploy
```

### Deploy Frontend

```bash
cd frontend

# Build for production
npm run build

# Create Raindrop static app
raindrop apps create song2learn-web --static

# Set API URL
echo "VITE_API_URL=https://your-api-url.raindrop.cloud/api" > .env.production

# Rebuild and deploy
npm run build
raindrop deploy dist
```

### Vultr Object Storage Setup

1. Create a bucket in Vultr Object Storage
2. Set bucket ACL to allow public read for the `tts/` prefix
3. Note your:
   - Access Key
   - Secret Key
   - Bucket Name
   - Region (e.g., `ewr1`)
   - Endpoint URL (e.g., `https://ewr1.vultrobjects.com`)

Audio files will be stored at URLs like:
```
https://{bucket}.{region}.vultrobjects.com/tts/{hash}.mp3
```

## Architecture Decisions

### Rate Limiting
- Uses `slowapi` with `X-Forwarded-For` header support for proxy environments
- Analyze endpoint: 30 req/min
- Speak endpoint: 20 req/min

### Caching
- Analysis results cached in-memory (TTL: 1 hour)
- Audio files stored permanently in Vultr, checked before regenerating

### Database
- Uses SQLAlchemy async with asyncpg
- Migrations managed with Alembic
- Songs de-duplicated by (lower(title), lower(artist))

### Authentication
- JWT tokens with configurable expiry (default: 24 hours)
- Passwords hashed with bcrypt via passlib

## Project Structure

```
song2learn/
├── backend/
│   ├── alembic/           # Database migrations
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Config, security, rate limiting
│   │   ├── db/            # Database session
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # External services (LRCLIB, Cerebras, etc.)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── stores/        # Zustand stores
│   └── package.json
├── docker-compose.yml
└── README.md
```

## License

MIT
