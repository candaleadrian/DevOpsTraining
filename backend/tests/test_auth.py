"""Tests for authentication endpoints and user-scoped data isolation."""

import pytest
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client():
    return TestClient(app)


def _register(client, email="test@example.com", password="secret123"):
    return client.post("/auth/register", json={"email": email, "password": password})


def _login(client, email="test@example.com", password="secret123"):
    return client.post("/auth/login", json={"email": email, "password": password})


def _auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


def test_register_success(client):
    r = _register(client)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_register_duplicate_email(client):
    _register(client)
    r = _register(client)
    assert r.status_code == 409


def test_register_short_password(client):
    r = client.post("/auth/register", json={"email": "a@b.com", "password": "12345"})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


def test_login_success(client):
    _register(client)
    r = _login(client)
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    _register(client)
    r = _login(client, password="wrong")
    assert r.status_code == 401


def test_login_nonexistent_user(client):
    r = _login(client, email="nobody@example.com")
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# /auth/me
# ---------------------------------------------------------------------------


def test_me_authenticated(client):
    token = _register(client).json()["access_token"]
    r = client.get("/auth/me", headers=_auth_header(token))
    assert r.status_code == 200
    assert r.json()["email"] == "test@example.com"


def test_me_no_token(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_bad_token(client):
    r = client.get("/auth/me", headers=_auth_header("invalid.token.here"))
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# Data isolation: logged-in user zones are separate from guest zones
# ---------------------------------------------------------------------------


def test_user_zones_isolated_from_guest(client):
    # Guest creates a zone
    client.post(
        "/api/zones",
        json={"name": "GuestZone", "latitude": 44.0, "longitude": 26.0},
    )

    # User registers and creates a zone
    token = _register(client).json()["access_token"]
    client.post(
        "/api/zones",
        json={"name": "UserZone", "latitude": 45.0, "longitude": 27.0},
        headers=_auth_header(token),
    )

    # Guest only sees guest zone
    guest_zones = client.get("/api/zones").json()
    assert len(guest_zones) == 1
    assert guest_zones[0]["name"] == "GuestZone"

    # User only sees user zone
    user_zones = client.get("/api/zones", headers=_auth_header(token)).json()
    assert len(user_zones) == 1
    assert user_zones[0]["name"] == "UserZone"


def test_user_cannot_modify_other_user_zone(client):
    # User A creates zone
    token_a = _register(client, email="a@test.com").json()["access_token"]
    zone = client.post(
        "/api/zones",
        json={"name": "A's zone", "latitude": 44.0, "longitude": 26.0},
        headers=_auth_header(token_a),
    ).json()

    # User B tries to update it
    token_b = _register(client, email="b@test.com").json()["access_token"]
    r = client.patch(
        f"/api/zones/{zone['id']}",
        json={"name": "Hacked"},
        headers=_auth_header(token_b),
    )
    assert r.status_code == 404


def test_user_cannot_delete_other_user_zone(client):
    token_a = _register(client, email="a@test.com").json()["access_token"]
    zone = client.post(
        "/api/zones",
        json={"name": "A's zone", "latitude": 44.0, "longitude": 26.0},
        headers=_auth_header(token_a),
    ).json()

    token_b = _register(client, email="b@test.com").json()["access_token"]
    r = client.delete(f"/api/zones/{zone['id']}", headers=_auth_header(token_b))
    assert r.status_code == 404
