# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Active  |
| 1.x     | ❌ EOL     |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email the maintainers or use GitHub's private vulnerability reporting
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

We aim to respond within 48 hours and will work with you to understand and address the issue.

## Security Measures

### Authentication
- Passwords hashed with bcrypt (passlib)
- JWT access tokens (short-lived: 15 min)
- Refresh tokens (30 days, revocable)
- Session management with revocation support

### API Security
- Rate limiting on sensitive endpoints
- CORS restrictions
- Input validation via Pydantic
- SQL injection prevention via SQLAlchemy ORM

### Data Protection
- No sensitive data in logs
- Environment variables for secrets
- HTTPS enforced in production

## Known Limitations

- In-memory cache (not shared across instances)
- No IP-based blocking yet
