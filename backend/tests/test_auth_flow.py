import pytest


@pytest.mark.asyncio
async def test_auth_refresh_logout(async_client):
    # Register
    res = await async_client.post(
        "/api/auth/register",
        json={
            "email": "user1@example.com",
            "password": "strongpassword",
            "native_lang": "en",
            "learning_lang": "es",
        },
    )
    assert res.status_code == 201
    data = res.json()
    access = data["access_token"]
    refresh = data["refresh_token"]

    # Access protected endpoint
    me = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert me.status_code == 200

    # Refresh rotates tokens
    res = await async_client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert res.status_code == 200
    new_tokens = res.json()
    new_access = new_tokens["access_token"]
    new_refresh = new_tokens["refresh_token"]
    assert new_access != access

    # Old refresh token should be revoked
    res = await async_client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert res.status_code == 401

    # Logout revokes current refresh
    res = await async_client.post("/api/auth/logout", json={"refresh_token": new_refresh})
    assert res.status_code == 204

    res = await async_client.post("/api/auth/refresh", json={"refresh_token": new_refresh})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_revoke_all(async_client):
    res = await async_client.post(
        "/api/auth/register",
        json={
            "email": "user2@example.com",
            "password": "strongpassword",
            "native_lang": "en",
            "learning_lang": "fr",
        },
    )
    assert res.status_code == 201
    tokens = res.json()
    access = tokens["access_token"]
    refresh = tokens["refresh_token"]

    res = await async_client.post(
        "/api/auth/revoke-all",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert res.status_code == 204

    res = await async_client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert res.status_code == 401
