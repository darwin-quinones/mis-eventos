import pytest
from fastapi import status


def test_register_user(client):
    """Test user registration"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert data["role"] == "asistente"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    """Test registration with duplicate email"""
    user_data = {
        "email": "duplicate@example.com",
        "password": "testpass123",
        "full_name": "Test User",
    }
    
    # First registration
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    
    # Duplicate registration
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == status.HTTP_409_CONFLICT  # Changed from 400 to 409


def test_login_success(client):
    """Test successful login"""
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "testpass123",
            "full_name": "Login User",
        },
    )
    
    # Login with form data
    response = client.post(
        "/auth/login",
        data={
            "email": "login@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password"""
    # Register user first
    client.post(
        "/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "correctpass",
            "full_name": "Wrong User",
        },
    )
    
    # Login with wrong password
    response = client.post(
        "/auth/login",
        data={
            "email": "wrong@example.com",
            "password": "wrongpass",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post(
        "/auth/login",
        data={
            "email": "nonexistent@example.com",
            "password": "anypass",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user(client):
    """Test getting current user info"""
    # Register and login
    client.post(
        "/auth/register",
        json={
            "email": "current@example.com",
            "password": "testpass123",
            "full_name": "Current User",
        },
    )
    
    login_response = client.post(
        "/auth/login",
        data={
            "email": "current@example.com",
            "password": "testpass123",
        },
    )
    token = login_response.json()["access_token"]
    
    # Get current user
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "current@example.com"
    assert data["full_name"] == "Current User"


def test_protected_route_without_token(client):
    """Test accessing protected route without token"""
    response = client.get("/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
