# Testing

## Requirements
- A Postgres database dedicated for tests.
- Set `TEST_DATABASE_URL` before running tests.

Example:
```
export TEST_DATABASE_URL=postgresql+asyncpg://song2learn:song2learn_secret@localhost:5432/song2learn_test
```

## Install
```
pip install -r backend/requirements.txt -r backend/requirements-dev.txt
```

## Run
```
pytest backend/tests -v
```

**Safety note**: tests will drop and recreate all tables in the test database.
