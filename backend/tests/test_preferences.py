import pytest


@pytest.mark.asyncio
async def test_update_preferences(async_client):
    res = await async_client.post(
        "/api/auth/register",
        json={
            "email": "prefs@example.com",
            "password": "strongpassword",
            "native_lang": "en",
            "learning_lang": "es",
        },
    )
    assert res.status_code == 201
    tokens = res.json()
    access = tokens["access_token"]

    res = await async_client.patch(
        "/api/users/me/preferences",
        headers={"Authorization": f"Bearer {access}"},
        json={"native_lang": "fr", "learning_lang": "de"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["native_lang"] == "fr"
    assert data["learning_lang"] == "de"

    res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["native_lang"] == "fr"
    assert data["learning_lang"] == "de"
