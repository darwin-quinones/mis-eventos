from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.event import Event


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, event_id: str) -> Event | None:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def get_all(
        self, skip: int = 0, limit: int = 20, search: str | None = None, status: str | None = None, category: str | None = None
    ) -> list[Event]:
        query = self.db.query(Event)
        
        if search:
            query = query.filter(Event.title.ilike(f"%{search}%"))
        
        if status:
            query = query.filter(Event.status == status)
        
        if category:
            query = query.filter(Event.category == category)
        
        return query.offset(skip).limit(limit).all()

    def count(self, search: str | None = None, status: str | None = None, category: str | None = None) -> int:
        query = self.db.query(Event)
        
        if search:
            query = query.filter(Event.title.ilike(f"%{search}%"))
        
        if status:
            query = query.filter(Event.status == status)
        
        if category:
            query = query.filter(Event.category == category)
        
        return query.count()

    def create(self, event: Event) -> Event:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def update(self, event: Event) -> Event:
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: Event) -> None:
        self.db.delete(event)
        self.db.commit()
