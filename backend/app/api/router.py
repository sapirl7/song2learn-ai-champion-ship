from fastapi import APIRouter

from app.api.endpoints import auth, songs, user_songs, analyze, vocabulary, exercises, voice, discover, meta, users

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(songs.router)
api_router.include_router(user_songs.router)
api_router.include_router(analyze.router)
api_router.include_router(vocabulary.router)
api_router.include_router(exercises.router)
api_router.include_router(voice.router)
api_router.include_router(discover.router)
api_router.include_router(meta.router)
api_router.include_router(users.router)
