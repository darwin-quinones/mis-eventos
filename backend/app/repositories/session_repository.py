from sqlalchemy.orm import Session as DBSession

from app.models.session import Session


class SessionRepository:
    def __init__(self, db: DBSession):
        self.db = db

    def get_by_id(self, session_id: str) -> Session | None:
        return self.db.query(Session).filter(Session.id == session_id).first()

    def get_by_event(self, event_id: str) -> list[Session]:
        return self.db.query(Session).filter(Session.event_id == event_id).all()

    def create(self, session: Session) -> Session:
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def update(self, session: Session) -> Session:
        self.db.commit()
        self.db.refresh(session)
        return session

    def delete(self, session: Session) -> None:
        self.db.delete(session)
        self.db.commit()
