from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_organizer_or_admin
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    current_user: Annotated[User, Depends(require_organizer_or_admin)],
    db: Session = Depends(get_db),
):
    """
    Create a new event.
    
    Requires: Organizador or Admin role
    """
    event_service = EventService(db)
    return event_service.create_event(event_data, current_user)


@router.get("", response_model=PaginatedResponse[EventResponse])
def list_events(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status: str | None = Query(None),
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    List all events with optional filters.
    
    Public endpoint - no authentication required
    """
    event_service = EventService(db)
    return event_service.get_events(page=page, size=size, search=search, status=status, category=category)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
):
    """
    Get event details by ID.
    
    Public endpoint - no authentication required
    """
    event_service = EventService(db)
    return event_service.get_event(event_id)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Update an event.
    
    Requires: Event owner (Organizador) or Admin
    """
    event_service = EventService(db)
    return event_service.update_event(event_id, event_data, current_user)


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Delete an event.
    
    Requires: Event owner (Organizador) or Admin
    """
    event_service = EventService(db)
    event_service.delete_event(event_id, current_user)
