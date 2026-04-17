import pytest
from fastapi import status
from datetime import datetime, timedelta


@pytest.fixture
def admin_headers(client, db_session):
    """Create an admin user and return auth headers"""
    from app.models.user import User
    from app.core.security import get_password_hash
    
    admin_user = User(
        email="admin@miseventos.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        role="admin"
    )
    db_session.add(admin_user)
    db_session.commit()
    
    login_response = client.post(
        "/auth/login",
        data={
            "email": "admin@miseventos.com",
            "password": "admin123",
        },
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def attendee_headers(client):
    """Create an attendee user and return auth headers"""
    client.post(
        "/auth/register",
        json={
            "email": "attendee@example.com",
            "password": "testpass123",
            "full_name": "Attendee User",
        },
    )
    
    login_response = client.post(
        "/auth/login",
        data={
            "email": "attendee@example.com",
            "password": "testpass123",
        },
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_event(client, admin_headers):
    """Create a test event"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    response = client.post(
        "/events",
        headers=admin_headers,
        json={
            "title": "Test Event",
            "description": "Test Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 10,
            "status": "published",
        },
    )
    return response.json()


def test_register_to_event(client, attendee_headers, test_event):
    """Test registering to an event"""
    response = client.post(
        f"/events/{test_event['id']}/register",
        headers=attendee_headers,
    )
    assert response.status_code == status.HTTP_200_OK  # Changed from 201 to 200
    data = response.json()
    assert "message" in data


def test_register_without_auth(client, test_event):
    """Test registering without authentication"""
    response = client.post(f"/events/{test_event['id']}/register")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_register_twice_to_same_event(client, attendee_headers, test_event):
    """Test registering twice to the same event"""
    # First registration
    response = client.post(
        f"/events/{test_event['id']}/register",
        headers=attendee_headers,
    )
    assert response.status_code == status.HTTP_200_OK  # Changed from 201 to 200
    
    # Second registration (should fail)
    response = client.post(
        f"/events/{test_event['id']}/register",
        headers=attendee_headers,
    )
    assert response.status_code == status.HTTP_409_CONFLICT


def test_unregister_from_event(client, attendee_headers, test_event):
    """Test unregistering from an event"""
    # Register first
    client.post(
        f"/events/{test_event['id']}/register",
        headers=attendee_headers,
    )
    
    # Unregister - correct route is DELETE /events/{id}/register
    response = client.delete(
        f"/events/{test_event['id']}/register",
        headers=attendee_headers,
    )
    assert response.status_code == status.HTTP_200_OK  # Returns message, not 204


def test_get_user_registrations(client, attendee_headers, admin_headers):
    """Test getting user's registrations"""
    # Create multiple events
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=2)
    
    event_ids = []
    for i in range(3):
        response = client.post(
            "/events",
            headers=admin_headers,
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
        event_ids.append(response.json()["id"])
    
    # Register to all events
    for event_id in event_ids:
        client.post(
            f"/events/{event_id}/register",
            headers=attendee_headers,
        )
    
    # Get registrations - correct route is /users/me/events
    response = client.get("/users/me/events", headers=attendee_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 3


def test_register_to_full_event(client, admin_headers, test_event):
    """Test registering to a full event"""
    # Create attendees and fill the event (capacity is 10)
    for i in range(10):
        # Register user
        client.post(
            "/auth/register",
            json={
                "email": f"user{i}@example.com",
                "password": "testpass123",
                "full_name": f"User {i}",
            },
        )
        
        # Login
        login_response = client.post(
            "/auth/login",
            data={
                "email": f"user{i}@example.com",
                "password": "testpass123",
            },
        )
        token = login_response.json()["access_token"]
        
        # Register to event
        client.post(
            f"/events/{test_event['id']}/register",
            headers={"Authorization": f"Bearer {token}"},
        )
    
    # Try to register one more user (should fail)
    client.post(
        "/auth/register",
        json={
            "email": "extra@example.com",
            "password": "testpass123",
            "full_name": "Extra User",
        },
    )
    
    login_response = client.post(
        "/auth/login",
        data={
            "email": "extra@example.com",
            "password": "testpass123",
        },
    )
    token = login_response.json()["access_token"]
    
    response = client.post(
        f"/events/{test_event['id']}/register",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_409_CONFLICT
