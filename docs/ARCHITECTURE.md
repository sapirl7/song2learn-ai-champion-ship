# Song2Learn Architecture

> Technical reference for the Song2Learn platform

---

## System Overview

Song2Learn is a language learning platform that transforms song lyrics into interactive learning experiences. The system follows a **clean architecture** pattern with clear separation between layers.

```mermaid
flowchart TB
    subgraph Presentation["Presentation Layer"]
        direction LR
        Web[React SPA]
        Mobile[Future: Mobile App]
    end

    subgraph Application["Application Layer"]
        direction LR
        API[FastAPI Router]
        Auth[Auth Middleware]
        Rate[Rate Limiter]
    end

    subgraph Domain["Domain Layer"]
        direction LR
        SongSvc[Song Service]
        AnalyzeSvc[Analysis Service]
        VoiceSvc[Voice Service]
        VocabSvc[Vocabulary Service]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        direction LR
        DB[(PostgreSQL)]
        Cache[Memory Cache]
        S3[(Vultr S3)]
    end

    subgraph External["External Services"]
        direction LR
        LRCLIB[LRCLIB API]
        Cerebras[Cerebras AI]
        Eleven[ElevenLabs TTS]
    end

    Presentation --> Application
    Application --> Domain
    Domain --> Infrastructure
    Domain --> External
```

---

## Component Architecture

### Backend Services

```mermaid
graph LR
    subgraph API["API Layer"]
        auth["/api/auth"]
        songs["/api/songs"]
        analyze["/api/analyze"]
        voice["/api/voice"]
        vocab["/api/vocabulary"]
    end

    subgraph Services["Service Layer"]
        AuthSvc[AuthService]
        SongSvc[SongService]
        CerebrasSvc[CerebrasService]
        VoiceSvc[VoiceService]
        CacheSvc[CacheService]
    end

    subgraph External["External APIs"]
        LRCLIB[(LRCLIB)]
        Cerebras[Cerebras AI]
        Eleven[ElevenLabs]
        Vultr[(Vultr S3)]
    end

    auth --> AuthSvc
    songs --> SongSvc --> LRCLIB
    analyze --> CerebrasSvc --> Cerebras
    analyze --> CacheSvc
    voice --> VoiceSvc --> Eleven
    voice --> VoiceSvc --> Vultr
    vocab --> AuthSvc
```

### Frontend Architecture

```mermaid
graph TB
    subgraph Pages["Pages"]
        Home[Home]
        Login[Login/Register]
        Search[Search]
        SongView[Song View]
        Saved[Saved Songs]
        Vocab[Vocabulary]
        Exercises[Exercises]
    end

    subgraph Stores["Zustand Stores"]
        UserStore[useUser]
        LangStore[useLang]
    end

    subgraph API["API Client"]
        Client[axios instance]
        Interceptors[Token Interceptors]
    end

    Pages --> Stores
    Pages --> API
    API --> Interceptors
```

---

## Data Flow

### Song Import Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant LRC as LRCLIB
    participant DB as PostgreSQL

    U->>FE: Search "Despacito"
    FE->>BE: GET /api/songs/search?q=Despacito
    BE->>LRC: GET /api/search?q=Despacito
    LRC-->>BE: [{id, title, artist, ...}]
    BE-->>FE: Search results
    
    U->>FE: Click "Import"
    FE->>BE: POST /api/songs/import {lrclib_id}
    BE->>LRC: GET /api/get/{lrclib_id}
    LRC-->>BE: Full lyrics data
    BE->>DB: INSERT song (dedup by title+artist)
    DB-->>BE: song_id
    BE-->>FE: {id, title, artist, lyrics}
```

### Lyric Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant Cache as Memory Cache
    participant AI as Cerebras AI

    U->>FE: Click lyric line
    FE->>BE: POST /api/analyze/line {text, source_lang, target_lang}
    
    BE->>Cache: Check cache (text hash)
    alt Cache hit
        Cache-->>BE: Cached analysis
    else Cache miss
        BE->>AI: Analyze text
        AI-->>BE: {translation, grammar, vocabulary}
        BE->>Cache: Store result
    end
    
    BE-->>FE: Analysis result
    FE->>U: Display translation + grammar + vocab
```

### TTS Audio Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL
    participant S3 as Vultr S3
    participant TTS as ElevenLabs

    U->>FE: Click speaker icon
    FE->>BE: POST /api/voice/speak {text, voice_id}
    
    BE->>DB: Check tts_audio by text_hash
    alt Audio exists
        DB-->>BE: s3_url
    else Audio missing
        BE->>TTS: Generate audio
        TTS-->>BE: MP3 bytes
        BE->>S3: Upload to bucket
        S3-->>BE: Public URL
        BE->>DB: INSERT tts_audio record
    end
    
    BE-->>FE: {audio_url}
    FE->>S3: Fetch audio
    FE->>U: Play audio
```

---

## Security Model

```mermaid
flowchart TB
    subgraph Public["Public Endpoints"]
        health["/health"]
        register["/api/auth/register"]
        login["/api/auth/login"]
        search["/api/songs/search"]
    end

    subgraph Protected["Protected Endpoints"]
        me["/api/auth/me"]
        saved["/api/user-songs/saved"]
        vocab["/api/vocabulary"]
        analyze["/api/analyze/*"]
        voice["/api/voice/*"]
    end

    subgraph Security["Security Layers"]
        JWT[JWT Validation]
        Rate[Rate Limiting]
        CORS[CORS Policy]
    end

    Protected --> JWT
    JWT --> Rate
    Rate --> CORS
```

### Authentication Tokens

| Token | Purpose | Lifetime |
|-------|---------|----------|
| Access Token | API authorization | 15 minutes |
| Refresh Token | Obtain new access token | 30 days |

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/analyze/*` | 60 | 1 minute |
| `/api/voice/*` | 20 | 1 minute |

---

## Database Schema

```mermaid
erDiagram
    users ||--o{ user_songs : "saves"
    users ||--o{ vocabulary : "learns"
    users ||--o{ sessions : "auth"
    songs ||--o{ user_songs : "saved_by"

    users {
        uuid id PK
        varchar email UK
        varchar hashed_password
        varchar native_lang
        varchar target_lang
        boolean is_active
        timestamp created_at
    }

    songs {
        serial id PK
        varchar title
        varchar artist
        text lyrics
        text synced_lyrics
        int lrclib_id UK
        timestamp created_at
    }

    user_songs {
        serial id PK
        uuid user_id FK
        int song_id FK
        timestamp saved_at
    }

    vocabulary {
        serial id PK
        uuid user_id FK
        varchar word
        varchar translation
        text context
        timestamp created_at
    }

    sessions {
        uuid id PK
        uuid user_id FK
        varchar refresh_token UK
        timestamp expires_at
        boolean revoked
    }

    tts_audio {
        serial id PK
        varchar text_hash UK
        varchar voice_id
        varchar s3_key
        varchar s3_url
        int size_bytes
        timestamp created_at
    }
```

---

## Infrastructure

### Deployment Topology

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser[Web Browser]
    end

    subgraph CDN["Vercel Edge"]
        FE[Frontend SPA]
    end

    subgraph Render["Render (Frankfurt)"]
        BE[Backend API]
        PG[(PostgreSQL)]
    end

    subgraph Vultr["Vultr (Amsterdam)"]
        S3[(Object Storage)]
    end

    subgraph External["Third Party"]
        LRCLIB[LRCLIB]
        Cerebras[Cerebras AI]
        Eleven[ElevenLabs]
    end

    Browser --> FE
    FE -->|API| BE
    BE --> PG
    BE --> S3
    BE --> LRCLIB
    BE --> Cerebras
    BE --> Eleven
```

### Docker Services

```mermaid
graph LR
    subgraph Docker["docker-compose"]
        postgres[(postgres:15)]
    end

    subgraph Local["Local Development"]
        backend[uvicorn :8000]
        frontend[vite :3000]
    end

    backend --> postgres
    frontend --> backend
```

---

## Caching Strategy

```mermaid
flowchart LR
    Request[API Request] --> Check{Cache?}
    Check -->|Hit| Return[Return Cached]
    Check -->|Miss| External[Call External API]
    External --> Store[Store in Cache]
    Store --> Return2[Return & Cache]

    subgraph Cache["In-Memory Cache"]
        Analysis[Analysis Results<br/>TTL: 1 hour]
        Songs[Song Lookups<br/>TTL: 24 hours]
    end
```

---

## Error Handling

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 400 | Bad Request | Invalid input, check payload |
| 401 | Unauthorized | Token expired/invalid, refresh |
| 403 | Forbidden | Missing permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited, wait and retry |
| 500 | Internal Error | Server issue, check logs |

---

## Future Considerations

```mermaid
mindmap
  root((Song2Learn))
    Mobile
      React Native
      Offline mode
    AI
      Spaced repetition
      Personalized difficulty
    Social
      Leaderboards
      Shared playlists
    Content
      More languages
      User-submitted lyrics
```
