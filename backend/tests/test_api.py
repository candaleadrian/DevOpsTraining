import pytest
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client():
    return TestClient(app)


# ---------------------------------------------------------------------------
# Health & root
# ---------------------------------------------------------------------------

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "proximity-alarm-api" in data["service"]


# ---------------------------------------------------------------------------
# Proximity helper
# ---------------------------------------------------------------------------

def test_haversine_same_point():
    from src.main import calculate_distance
    assert calculate_distance(44.4268, 26.1025, 44.4268, 26.1025) == 0.0


def test_haversine_known_distance():
    from src.main import calculate_distance
    # London (51.5074, -0.1278) to Paris (48.8566, 2.3522) ≈ 343 km
    d = calculate_distance(51.5074, -0.1278, 48.8566, 2.3522)
    assert 340_000 < d < 350_000


# ---------------------------------------------------------------------------
# Zone CRUD (uses SQLite in-memory — no Postgres needed)
# ---------------------------------------------------------------------------

def test_create_zone(client):
    r = client.post("/api/zones", json={
        "name": "Office",
        "latitude": 44.4268,
        "longitude": 26.1025,
        "radius_meters": 300,
    })
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Office"
    assert data["radius_meters"] == 300
    assert data["is_active"] is True


def test_list_zones(client):
    r = client.get("/api/zones")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_create_and_get_zone(client):
    create = client.post("/api/zones", json={
        "name": "Park",
        "latitude": 44.43,
        "longitude": 26.10,
        "radius_meters": 500,
    })
    zone_id = create.json()["id"]
    r = client.get(f"/api/zones/{zone_id}")
    assert r.status_code == 200
    assert r.json()["name"] == "Park"


def test_update_zone(client):
    create = client.post("/api/zones", json={
        "name": "Temp",
        "latitude": 44.0,
        "longitude": 26.0,
    })
    zone_id = create.json()["id"]
    r = client.patch(f"/api/zones/{zone_id}", json={"name": "Updated"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated"


def test_delete_zone(client):
    create = client.post("/api/zones", json={
        "name": "ToDelete",
        "latitude": 44.0,
        "longitude": 26.0,
    })
    zone_id = create.json()["id"]
    r = client.delete(f"/api/zones/{zone_id}")
    assert r.status_code == 204
    r2 = client.get(f"/api/zones/{zone_id}")
    assert r2.status_code == 404


def test_zone_not_found(client):
    r = client.get("/api/zones/99999")
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Proximity check
# ---------------------------------------------------------------------------

def test_check_zones_inside(client):
    client.post("/api/zones", json={
        "name": "Check Zone",
        "latitude": 44.4268,
        "longitude": 26.1025,
        "radius_meters": 1000,
    })
    r = client.post("/api/zones/check", json={
        "latitude": 44.4268,
        "longitude": 26.1025,
    })
    assert r.status_code == 200
    results = r.json()
    assert any(item["alarm"] is True for item in results)


def test_check_zones_outside(client):
    client.post("/api/zones", json={
        "name": "Far Zone",
        "latitude": 44.4268,
        "longitude": 26.1025,
        "radius_meters": 100,
    })
    r = client.post("/api/zones/check", json={
        "latitude": 40.0,
        "longitude": 20.0,
    })
    assert r.status_code == 200
    results = r.json()
    assert all(item["alarm"] is False for item in results)


# ---------------------------------------------------------------------------
# Alarm events
# ---------------------------------------------------------------------------

def test_create_alarm_event(client):
    zone = client.post("/api/zones", json={
        "name": "Event Zone",
        "latitude": 44.0,
        "longitude": 26.0,
    }).json()
    r = client.post("/api/alarm-events", json={
        "zone_id": zone["id"],
        "zone_name": "Event Zone",
        "event_type": "entered",
        "distance_meters": 50.0,
        "latitude": 44.001,
        "longitude": 26.001,
    })
    assert r.status_code == 201
    assert r.json()["event_type"] == "entered"


def test_list_alarm_events(client):
    r = client.get("/api/alarm-events")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_clear_alarm_events(client):
    r = client.delete("/api/alarm-events")
    assert r.status_code == 204
    r2 = client.get("/api/alarm-events")
    assert r2.json() == []


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def test_create_zone_invalid_latitude(client):
    r = client.post("/api/zones", json={
        "name": "Bad",
        "latitude": 999,
        "longitude": 26.0,
    })
    assert r.status_code == 422


def test_create_zone_empty_name(client):
    r = client.post("/api/zones", json={
        "name": "",
        "latitude": 44.0,
        "longitude": 26.0,
    })
    assert r.status_code == 422
