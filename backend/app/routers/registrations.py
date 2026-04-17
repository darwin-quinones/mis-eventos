from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.event import EventResponse
from app.schemas.registration import RegistrationMessage
from app.services.registration_service import RegistrationService

router = APIRouter(tags=["Registrations"])


@router.post("/events/{event_id}/register", response_model=RegistrationMessage)
def register_to_event(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    registration_service = RegistrationService(db)
    return registration_service.register_to_event(event_id, current_user)


@router.delete("/events/{event_id}/register", response_model=RegistrationMessage)
def unregister_from_event(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    registration_service = RegistrationService(db)
    return registration_service.unregister_from_event(event_id, current_user)


@router.get("/users/me/events", response_model=list[EventResponse])
def get_my_events(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    registration_service = RegistrationService(db)
    return registration_service.get_user_events(current_user)
