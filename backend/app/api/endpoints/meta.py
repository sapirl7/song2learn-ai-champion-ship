from fastapi import APIRouter

router = APIRouter(prefix="/meta", tags=["meta"])

LANGUAGES = [
    {"code": "en", "name": "English", "nativeName": "English"},
    {"code": "ru", "name": "Russian", "nativeName": "Русский"},
    {"code": "fr", "name": "French", "nativeName": "Français"},
    {"code": "de", "name": "German", "nativeName": "Deutsch"},
    {"code": "es", "name": "Spanish", "nativeName": "Español"},
    {"code": "pt", "name": "Portuguese", "nativeName": "Português"},
    {"code": "pl", "name": "Polish", "nativeName": "Polski"},
    {"code": "zh", "name": "Chinese", "nativeName": "中文"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी"},
    {"code": "ar", "name": "Arabic", "nativeName": "العربية", "rtl": True},
]


@router.get("/languages")
async def get_languages():
    return {"languages": LANGUAGES}
