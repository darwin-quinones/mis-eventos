from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate
from app.services.session_service import SessionService

router = APIRouter(tags=["Sessions"])


@router.post("/events/{event_id}/sessions", response_model=SessionResponse, status_code=201)
def create_session(
    event_id: str,
    session_data: SessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    return session_service.create_session(event_id, session_data, current_user)


@router.get("/events/{event_id}/sessions", response_model=list[SessionResponse])
def list_sessions(
    event_id: str,
    db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    return session_service.get_sessions(event_id)


@router.put("/events/{event_id}/sessions/{session_id}", response_model=SessionResponse)
def update_session(
    event_id: str,
    session_id: str,
    session_data: SessionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    return session_service.update_session(event_id, session_id, session_data, current_user)


@router.delete("/events/{event_id}/sessions/{session_id}", status_code=204)
def delete_session(
    event_id: str,
    session_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    session_service = SessionService(db)
    session_service.delete_session(event_id, session_id, current_user)
