from enum import Enum


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class UserRole(str, Enum):
    ADMIN = "admin"
    ORGANIZADOR = "organizador"
    ASISTENTE = "asistente"
