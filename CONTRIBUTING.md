# Contributing to Song2Learn

Thank you for your interest in contributing! 🎵

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/song2learn-ai-champion-ship.git
   ```
3. Follow the [Quick Start](README.md#-quick-start) guide

## Development Workflow

### Branch Naming

- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `docs/<description>` — Documentation
- `chore/<description>` — Maintenance

### Making Changes

1. Create a branch from `master`
2. Make your changes
3. Write/update tests if applicable
4. Ensure linting passes:
   ```bash
   cd backend && ruff check .
   cd frontend && npm run lint
   ```
5. Run tests:
   ```bash
   cd backend && pytest
   ```

### Commit Messages

Use conventional commits:
- `feat: add vocabulary export`
- `fix: correct token refresh logic`
- `docs: update API reference`
- `chore: update dependencies`

## Pull Request Process

1. Update documentation if needed
2. Ensure CI passes
3. Request review from maintainers
4. Squash and merge after approval

## Code Style

### Python (Backend)
- Formatter: `ruff format`
- Linter: `ruff check`
- Type hints encouraged

### JavaScript (Frontend)
- ESLint + Prettier
- Functional components
- Zustand for state

## Questions?

Open a [Discussion](https://github.com/sapirl7/song2learn-ai-champion-ship/discussions) for questions or ideas.
