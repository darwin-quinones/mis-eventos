from sqlalchemy.orm import Session, joinedload

from app.models.registration import EventRegistration


class RegistrationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_event(self, user_id: str, event_id: str) -> EventRegistration | None:
        return (
            self.db.query(EventRegistration)
            .filter(
                EventRegistration.user_id == user_id,
                EventRegistration.event_id == event_id
            )
            .first()
        )

    def get_by_user(self, user_id: str) -> list[EventRegistration]:
        return (
            self.db.query(EventRegistration)
            .options(joinedload(EventRegistration.event))
            .filter(EventRegistration.user_id == user_id)
            .all()
        )

    def create(self, registration: EventRegistration) -> EventRegistration:
        self.db.add(registration)
        self.db.commit()
        self.db.refresh(registration)
        return registration

    def delete(self, registration: EventRegistration) -> None:
        self.db.delete(registration)
        self.db.commit()
