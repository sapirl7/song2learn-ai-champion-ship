# Data Retention Policy (Draft)

## Scope
This policy defines how long user data is retained and how it is purged.

## Data Classes
- **Account data**: user email, auth provider, language prefs.
- **Learning data**: saved songs, vocabulary, exercise attempts.
- **Generated assets**: TTS audio files.

## Retention Rules
- **Account data**: retained until user deletion request.
- **Learning data**: retained until user deletion request.
- **TTS audio**: default TTL = `VOICE_TTL_DAYS` (default 30).
  - Non‑persistent audio is deleted after TTL.
  - Persistent audio (future feature) is retained until user deletion.

## Implementation Notes
- TTS metadata stored in `tts_audio`.
- Cleanup runs on app startup and removes expired rows + S3 objects.
- Signed URLs are supported to avoid public exposure.

## Deletion
- User deletion should remove all related records and TTS assets.
