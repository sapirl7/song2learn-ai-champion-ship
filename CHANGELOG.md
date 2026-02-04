# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-04

### Added
- **Serious Auth System**: Proper JWT with access/refresh tokens, session management
- **Refresh Sessions**: Database-backed session tracking with revocation
- **TTS Audio Caching**: Store generated audio in Vultr S3 with deduplication
- **Meta Endpoints**: `/api/meta/languages` for supported language list
- **User Preferences**: Language preferences (native/target) per user
- **Rate Limiting**: Configurable limits on analyze and voice endpoints
- **Feature Flags**: `FEATURE_AI`, `FEATURE_VOICE`, `FEATURE_GOOGLE_AUTH`
- **Comprehensive Tests**: Auth flow, preferences, integration tests

### Changed
- Migrated from simple JWT to access/refresh token pattern
- Improved error handling and validation
- Updated documentation with architecture diagrams

### Removed
- Deprecated single-endpoint storage service
- Removed unused railway.json
- Cleaned up root-level test files

### Security
- Added token refresh mechanism
- Session revocation on logout
- Improved password hashing validation

## [1.0.0] - 2026-01

### Added
- Initial release
- Song search via LRCLIB
- Lyric analysis with Cerebras AI
- TTS pronunciation with ElevenLabs
- Vocabulary management
- Translation exercises
