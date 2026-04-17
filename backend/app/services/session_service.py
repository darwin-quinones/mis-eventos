from datetime import timezone
from sqlalchemy.orm import Session as DBSession

from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.models.session import Session
from app.models.user import User
from app.repositories.event_repository import EventRepository
from app.repositories.session_repository import SessionRepository
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate


class SessionService:
    def __init__(self, db: DBSession):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.event_repo = EventRepository(db)

    def create_session(
        self, event_id: str, session_data: SessionCreate, user: User
    ) -> SessionResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.organizer_id != user.id and user.role != "admin":
            raise ForbiddenException(detail="No tienes autorización para crear sesiones en este evento")

        self._validate_session_times(event_id, session_data.start_time, session_data.end_time, event)
        
        if session_data.capacity > event.capacity:
            raise BadRequestException(detail="La capacidad de la sesión no puede exceder la capacidad del evento")

        new_session = Session(
            event_id=event_id,
            title=session_data.title,
            description=session_data.description,
            speaker_name=session_data.speaker_name,
            start_time=session_data.start_time,
            end_time=session_data.end_time,
            capacity=session_data.capacity,
        )

        created_session = self.session_repo.create(new_session)
        return SessionResponse.model_validate(created_session)

    def get_sessions(self, event_id: str) -> list[SessionResponse]:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        sessions = self.session_repo.get_by_event(event_id)
        return [SessionResponse.model_validate(session) for session in sessions]

    def update_session(
        self, event_id: str, session_id: str, session_data: SessionUpdate, user: User
    ) -> SessionResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.organizer_id != user.id and user.role != "admin":
            raise ForbiddenException(detail="No tienes autorización para actualizar sesiones en este evento")

        session = self.session_repo.get_by_id(session_id)
        if not session or session.event_id != event_id:
            raise NotFoundException(detail="Sesión no encontrada")

        if session_data.start_time or session_data.end_time:
            start = session_data.start_time or session.start_time
            end = session_data.end_time or session.end_time
            self._validate_session_times(event_id, start, end, event, session_id)

        if session_data.capacity is not None and session_data.capacity > event.capacity:
            raise BadRequestException(detail="La capacidad de la sesión no puede exceder la capacidad del evento")

        update_data = session_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(session, field, value)

        updated_session = self.session_repo.update(session)
        return SessionResponse.model_validate(updated_session)

    def delete_session(self, event_id: str, session_id: str, user: User) -> None:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.organizer_id != user.id and user.role != "admin":
            raise ForbiddenException(detail="No tienes autorización para eliminar sesiones en este evento")

        session = self.session_repo.get_by_id(session_id)
        if not session or session.event_id != event_id:
            raise NotFoundException(detail="Sesión no encontrada")

        self.session_repo.delete(session)

    def _validate_session_times(self, event_id: str, start, end, event, exclude_session_id: str | None = None):
        # Treat all naive datetimes as UTC for consistency
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        
        event_start = event.start_datetime
        if event_start.tzinfo is None:
            event_start = event_start.replace(tzinfo=timezone.utc)
        
        event_end = event.end_datetime
        if event_end.tzinfo is None:
            event_end = event_end.replace(tzinfo=timezone.utc)
        
        if start >= end:
            raise BadRequestException(detail="La hora de inicio debe ser anterior a la hora de fin")

        if start < event_start or end > event_end:
            raise BadRequestException(
                detail=f"La sesión debe estar dentro del rango de fechas del evento"
            )

        existing_sessions = self.session_repo.get_by_event(event_id)
        for existing in existing_sessions:
            if exclude_session_id and existing.id == exclude_session_id:
                continue
            
            existing_start = existing.start_time
            if existing_start.tzinfo is None:
                existing_start = existing_start.replace(tzinfo=timezone.utc)
            
            existing_end = existing.end_time
            if existing_end.tzinfo is None:
                existing_end = existing_end.replace(tzinfo=timezone.utc)
            
            if (start < existing_end and end > existing_start):
                raise BadRequestException(detail="La sesión se superpone con otra sesión existente")
