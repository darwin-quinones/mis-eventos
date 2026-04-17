import pytest
from fastapi import status
from datetime import datetime, timedelta


@pytest.fixture
def auth_headers(client, db_session):
    """Create an admin user and return auth headers"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    # Create admin user directly in DB
    admin_user = User(
        email="admin@miseventos.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        role="admin"
    )
    db_session.add(admin_user)
    db_session.commit()
    
    # Login
    login_response = client.post(
        "/auth/login",
        data={
            "email": "admin@miseventos.com",
            "password": "admin123",
        },
    )
    token = login_response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


def test_create_event(client, auth_headers):
    """Test creating an event"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Test Event",
            "description": "Test Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 100,
            "status": "published",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Test Event"
    assert data["capacity"] == 100
    assert data["current_attendees"] == 0


def test_create_event_without_auth(client):
    """Test creating event without authentication"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    response = client.post(
        "/events",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 100,
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_events_list(client, auth_headers):
    """Test getting list of events"""
    # Create some events
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    for i in range(3):
        client.post(
            "/events",
            headers=auth_headers,
            json={
                "title": f"Event {i}",
                "description": f"Description {i}",
                "location": "Test Location",
                "start_datetime": start_time.isoformat(),
                "end_datetime": end_time.isoformat(),
                "capacity": 50,
                "status": "published",
            },
        )
    
    # Get events
    response = client.get("/events")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 3
    assert data["total"] == 3


def test_search_events(client, auth_headers):
    """Test searching events by name"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    # Create events
    client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Python Conference",
            "description": "Python event",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    
    client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "JavaScript Meetup",
            "description": "JS event",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    
    # Search for Python
    response = client.get("/events?search=Python")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == 1
    assert "Python" in data["items"][0]["title"]


def test_get_event_detail(client, auth_headers):
    """Test getting event details"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    # Create event
    create_response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Detail Event",
            "description": "Detail Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    event_id = create_response.json()["id"]
    
    # Get detail
    response = client.get(f"/events/{event_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Detail Event"
    assert data["id"] == event_id


def test_update_event(client, auth_headers):
    """Test updating an event"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    # Create event
    create_response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Original Title",
            "description": "Original Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    event_id = create_response.json()["id"]
    
    # Update event
    response = client.put(
        f"/events/{event_id}",
        headers=auth_headers,
        json={
            "title": "Updated Title",
            "description": "Updated Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated Description"


def test_delete_event(client, auth_headers):
    """Test deleting an event"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    # Create event
    create_response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "To Delete",
            "description": "Will be deleted",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    event_id = create_response.json()["id"]
    
    # Delete event
    response = client.delete(f"/events/{event_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify deletion
    response = client.get(f"/events/{event_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_event_with_attendees(client, auth_headers):
    """Test that deleting an event with attendees is prevented"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    # Create event
    create_response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Event with Attendees",
            "description": "Cannot be deleted",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    event_id = create_response.json()["id"]
    
    # Register to the event
    client.post(f"/events/{event_id}/register", headers=auth_headers)
    
    # Try to delete the event
    response = client.delete(f"/events/{event_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "asistente(s) registrado(s)" in response.json()["detail"]
    assert "cancelled" in response.json()["detail"]


def test_event_validation_end_before_start(client, auth_headers):
    """Test validation: end time before start time"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time - timedelta(hours=1)  # End before start
    
    response = client.post(
        "/events",
        headers=auth_headers,
        json={
            "title": "Invalid Event",
            "description": "Invalid times",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 50,
            "status": "published",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
