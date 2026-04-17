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
def test_event(client, admin_headers):
    """Create a test event"""
    start_time = datetime.now() + timedelta(days=7)
    end_time = start_time + timedelta(hours=5)
    
    response = client.post(
        "/events",
        headers=admin_headers,
        json={
            "title": "Test Conference",
            "description": "Test Description",
            "location": "Test Location",
            "start_datetime": start_time.isoformat(),
            "end_datetime": end_time.isoformat(),
            "capacity": 100,
            "status": "published",
        },
    )
    return response.json()


def test_create_session(client, admin_headers, test_event):
    """Test creating a session"""
    event_start = datetime.fromisoformat(test_event["start_datetime"])
    session_start = event_start + timedelta(hours=1)
    session_end = session_start + timedelta(hours=1)
    
    response = client.post(
        f"/events/{test_event['id']}/sessions",
        headers=admin_headers,
        json={
            "title": "Opening Keynote",
            "description": "Welcome session",
            "speaker_name": "John Doe",
            "speaker_bio": "Expert speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 50,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Opening Keynote"
    assert data["speaker_name"] == "John Doe"
    assert data["capacity"] == 50


def test_create_session_without_auth(client, test_event):
    """Test creating session without authentication"""
    event_start = datetime.fromisoformat(test_event["start_datetime"])
    session_start = event_start + timedelta(hours=1)
    session_end = session_start + timedelta(hours=1)
    
    response = client.post(
        f"/events/{test_event['id']}/sessions",
        json={
            "title": "Test Session",
            "description": "Test",
            "speaker_name": "Speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 50,
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_event_sessions(client, admin_headers, test_event):
    """Test getting sessions for an event"""
    event_start = datetime.fromisoformat(test_event["start_datetime"])
    
    # Create multiple sessions
    for i in range(3):
        session_start = event_start + timedelta(hours=i+1)
        session_end = session_start + timedelta(hours=1)
        
        client.post(
            f"/events/{test_event['id']}/sessions",
            headers=admin_headers,
            json={
                "title": f"Session {i}",
                "description": f"Description {i}",
                "speaker_name": f"Speaker {i}",
                "start_time": session_start.isoformat(),
                "end_time": session_end.isoformat(),
                "capacity": 30,
            },
        )
    
    # Get sessions
    response = client.get(f"/events/{test_event['id']}/sessions")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 3


def test_update_session(client, admin_headers, test_event):
    """Test updating a session"""
    event_start = datetime.fromisoformat(test_event["start_datetime"])
    session_start = event_start + timedelta(hours=1)
    session_end = session_start + timedelta(hours=1)
    
    # Create session
    create_response = client.post(
        f"/events/{test_event['id']}/sessions",
        headers=admin_headers,
        json={
            "title": "Original Title",
            "description": "Original Description",
            "speaker_name": "Original Speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 30,
        },
    )
    session_id = create_response.json()["id"]
    
    # Update session - needs event_id in path
    response = client.put(
        f"/events/{test_event['id']}/sessions/{session_id}",
        headers=admin_headers,
        json={
            "title": "Updated Title",
            "description": "Updated Description",
            "speaker_name": "Updated Speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 40,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["capacity"] == 40


def test_delete_session(client, admin_headers, test_event):
    """Test deleting a session"""
    event_start = datetime.fromisoformat(test_event["start_datetime"])
    session_start = event_start + timedelta(hours=1)
    session_end = session_start + timedelta(hours=1)
    
    # Create session
    create_response = client.post(
        f"/events/{test_event['id']}/sessions",
        headers=admin_headers,
        json={
            "title": "To Delete",
            "description": "Will be deleted",
            "speaker_name": "Speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 30,
        },
    )
    session_id = create_response.json()["id"]
    
    # Delete session - needs event_id in path
    response = client.delete(
        f"/events/{test_event['id']}/sessions/{session_id}",
        headers=admin_headers
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_session_validation_outside_event_time(client, admin_headers, test_event):
    """Test validation: session outside event time"""
    event_end = datetime.fromisoformat(test_event["end_datetime"])
    session_start = event_end + timedelta(hours=1)  # After event ends
    session_end = session_start + timedelta(hours=1)
    
    response = client.post(
        f"/events/{test_event['id']}/sessions",
        headers=admin_headers,
        json={
            "title": "Invalid Session",
            "description": "Outside event time",
            "speaker_name": "Speaker",
            "start_time": session_start.isoformat(),
            "end_time": session_end.isoformat(),
            "capacity": 30,
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
