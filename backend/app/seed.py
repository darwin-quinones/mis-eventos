"""
Script para crear datos iniciales (seed data)
Crea usuarios, eventos y sesiones de ejemplo
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models.user import User
from app.models.event import Event
from app.models.session import Session as EventSession
from app.models.registration import EventRegistration  # noqa: F401
from app.repositories.user_repository import UserRepository
from app.repositories.event_repository import EventRepository
from app.repositories.session_repository import SessionRepository


def create_admin_user(db: Session) -> User:
    """Crea un usuario administrador por defecto si no existe"""
    user_repo = UserRepository(db)
    
    # Verificar si ya existe un admin
    admin_email = "admin@miseventos.com"
    existing_admin = user_repo.get_by_email(admin_email)
    
    if existing_admin:
        print(f"✓ Usuario admin ya existe: {admin_email}")
        return existing_admin
    
    # Crear usuario admin
    admin_user = User(
        email=admin_email,
        full_name="Administrador del Sistema",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True
    )
    
    created_admin = user_repo.create(admin_user)
    print(f"✓ Usuario admin creado exitosamente: {admin_email}")
    print(f"  Contraseña: admin123")
    print(f"  ⚠️  IMPORTANTE: Cambia esta contraseña en producción!")
    
    return created_admin


def create_sample_organizer(db: Session) -> User:
    """Crea un usuario organizador de ejemplo si no existe"""
    user_repo = UserRepository(db)
    
    organizer_email = "organizador@miseventos.com"
    existing_organizer = user_repo.get_by_email(organizer_email)
    
    if existing_organizer:
        print(f"✓ Usuario organizador ya existe: {organizer_email}")
        return existing_organizer
    
    organizer_user = User(
        email=organizer_email,
        full_name="Organizador de Eventos",
        hashed_password=get_password_hash("organizador123"),
        role="organizador",
        is_active=True
    )
    
    created_organizer = user_repo.create(organizer_user)
    print(f"✓ Usuario organizador creado exitosamente: {organizer_email}")
    print(f"  Contraseña: organizador123")
    
    return created_organizer


def create_sample_attendee(db: Session) -> User:
    """Crea un usuario asistente de ejemplo si no existe"""
    user_repo = UserRepository(db)
    
    attendee_email = "asistente@miseventos.com"
    existing_attendee = user_repo.get_by_email(attendee_email)
    
    if existing_attendee:
        print(f"✓ Usuario asistente ya existe: {attendee_email}")
        return existing_attendee
    
    attendee_user = User(
        email=attendee_email,
        full_name="Usuario Asistente",
        hashed_password=get_password_hash("asistente123"),
        role="asistente",
        is_active=True
    )
    
    created_attendee = user_repo.create(attendee_user)
    print(f"✓ Usuario asistente creado exitosamente: {attendee_email}")
    print(f"  Contraseña: asistente123")
    
    return created_attendee


def create_sample_events(db: Session, organizer: User) -> list[Event]:
    """Crea eventos de ejemplo si no existen"""
    event_repo = EventRepository(db)
    
    # Verificar si ya existen eventos
    existing_events = event_repo.get_all(skip=0, limit=1)
    if existing_events:
        print(f"✓ Ya existen eventos en la base de datos ({event_repo.count()} eventos)")
        return event_repo.get_all(skip=0, limit=100)  # Retornar todos los eventos existentes
    
    now = datetime.now(timezone.utc)
    
    events_data = [
        {
            "title": "Conferencia Tech 2026",
            "description": "Gran conferencia de tecnología con los mejores expertos del sector. Aprende sobre IA, Cloud Computing, DevOps y las últimas tendencias tecnológicas.",
            "location": "Centro de Convenciones",
            "start_datetime": now + timedelta(days=60),
            "end_datetime": now + timedelta(days=60, hours=9),
            "capacity": 100,
            "status": "published",
            "cover_image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
            "category": "tecnologia",
            "tags": "conferencia,tecnologia,networking,ia",
        },
        {
            "title": "Workshop: React Avanzado",
            "description": "Taller práctico de React con hooks avanzados, optimización de rendimiento, y patrones de diseño modernos. Incluye proyecto final.",
            "location": "Sala de Capacitación TechHub",
            "start_datetime": now + timedelta(days=30),
            "end_datetime": now + timedelta(days=30, hours=4),
            "capacity": 30,
            "status": "published",
            "cover_image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
            "category": "tecnologia",
            "tags": "workshop,react,frontend,javascript",
        },
        {
            "title": "Hackathon Innovación 2026",
            "description": "48 horas de innovación y desarrollo. Forma equipos, crea soluciones innovadoras y compite por premios increíbles. Mentores expertos disponibles.",
            "location": "Campus Universitario - Edificio de Ingeniería",
            "start_datetime": now + timedelta(days=45),
            "end_datetime": now + timedelta(days=47),
            "capacity": 80,
            "status": "published",
            "cover_image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
            "category": "tecnologia",
            "tags": "hackathon,innovacion,competencia,premios",
        },
        {
            "title": "Meetup: Python para Data Science",
            "description": "Encuentro mensual de la comunidad Python. Este mes: análisis de datos con Pandas, visualización con Matplotlib y machine learning con scikit-learn.",
            "location": "Coworking Space Downtown",
            "start_datetime": now + timedelta(days=15),
            "end_datetime": now + timedelta(days=15, hours=3),
            "capacity": 40,
            "status": "published",
            "cover_image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
            "category": "tecnologia",
            "tags": "python,data-science,meetup,comunidad",
        },
        {
            "title": "Seminario: Ciberseguridad Empresarial",
            "description": "Aprende a proteger tu empresa de amenazas cibernéticas. Temas: seguridad en la nube, protección de datos, compliance y mejores prácticas.",
            "location": "Hotel Ejecutivo - Salón Principal",
            "start_datetime": now + timedelta(days=20),
            "end_datetime": now + timedelta(days=20, hours=6),
            "capacity": 60,
            "status": "published",
            "cover_image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200",
            "category": "tecnologia",
            "tags": "ciberseguridad,empresas,seguridad,compliance",
        },
    ]
    
    created_events = []
    for event_data in events_data:
        event = Event(
            **event_data,
            organizer_id=organizer.id,
            current_attendees=0
        )
        created_event = event_repo.create(event)
        created_events.append(created_event)
        print(f"✓ Evento creado: {event_data['title']}")
    
    return created_events


def create_sample_sessions(db: Session, events: list[Event]) -> None:
    """Crea sesiones de ejemplo para los eventos"""
    session_repo = SessionRepository(db)
    
    # Verificar si ya existen sesiones
    if events and events[0].id:
        existing_sessions = session_repo.get_by_event(events[0].id)
        if existing_sessions:
            print(f"✓ Ya existen sesiones en la base de datos")
            return
    
    # Sesiones para "Conferencia Tech 2026"
    if len(events) > 0:
        conf_event = events[0]
        conf_start = conf_event.start_datetime
        
        sessions_conf = [
            {
                "title": "Keynote: El Futuro de la IA",
                "description": "Charla principal sobre inteligencia artificial y su impacto en la sociedad",
                "speaker_name": "Dr. Juan Pérez",
                "speaker_bio": "PhD en Inteligencia Artificial, investigador en MIT",
                "speaker_photo_url": "https://i.pravatar.cc/150?img=12",
                "start_time": conf_start,
                "end_time": conf_start + timedelta(hours=1, minutes=30),
                "capacity": 100,
                "event_id": conf_event.id,
            },
            {
                "title": "Workshop: Cloud Computing con AWS",
                "description": "Taller práctico de servicios cloud y arquitecturas escalables",
                "speaker_name": "María García",
                "speaker_bio": "AWS Solutions Architect, 10 años de experiencia",
                "speaker_photo_url": "https://i.pravatar.cc/150?img=5",
                "start_time": conf_start + timedelta(hours=2),
                "end_time": conf_start + timedelta(hours=4),
                "capacity": 50,
                "event_id": conf_event.id,
            },
            {
                "title": "Panel: DevOps en 2026",
                "description": "Panel de expertos discutiendo el futuro de DevOps y automatización",
                "speaker_name": "Carlos Rodríguez",
                "speaker_bio": "DevOps Lead en empresa Fortune 500",
                "speaker_photo_url": "https://i.pravatar.cc/150?img=8",
                "start_time": conf_start + timedelta(hours=5),
                "end_time": conf_start + timedelta(hours=6, minutes=30),
                "capacity": 100,
                "event_id": conf_event.id,
            },
        ]
        
        for session_data in sessions_conf:
            session = EventSession(**session_data)
            session_repo.create(session)
        
        print(f"✓ Sesiones creadas para: {conf_event.title}")
    
    # Sesiones para "Workshop: React Avanzado"
    if len(events) > 1:
        workshop_event = events[1]
        workshop_start = workshop_event.start_datetime
        
        sessions_workshop = [
            {
                "title": "Hooks Avanzados y Custom Hooks",
                "description": "Profundiza en useCallback, useMemo, useReducer y crea tus propios hooks",
                "speaker_name": "Ana Martínez",
                "speaker_bio": "Senior Frontend Developer, Google Developer Expert",
                "speaker_photo_url": "https://i.pravatar.cc/150?img=9",
                "start_time": workshop_start,
                "end_time": workshop_start + timedelta(hours=2),
                "capacity": 30,
                "event_id": workshop_event.id,
            },
            {
                "title": "Optimización de Rendimiento",
                "description": "Técnicas para mejorar el rendimiento de aplicaciones React",
                "speaker_name": "Ana Martínez",
                "speaker_bio": "Senior Frontend Developer, Google Developer Expert",
                "speaker_photo_url": "https://i.pravatar.cc/150?img=9",
                "start_time": workshop_start + timedelta(hours=2),
                "end_time": workshop_start + timedelta(hours=4),
                "capacity": 30,
                "event_id": workshop_event.id,
            },
        ]
        
        for session_data in sessions_workshop:
            session = EventSession(**session_data)
            session_repo.create(session)
        
        print(f"✓ Sesiones creadas para: {workshop_event.title}")


def seed_database():
    """Ejecuta el seed de la base de datos"""
    print("\n" + "="*60)
    print("INICIANDO SEED DE BASE DE DATOS")
    print("="*60 + "\n")
    
    db = SessionLocal()
    try:
        # Crear usuarios de ejemplo
        admin = create_admin_user(db)
        organizer = create_sample_organizer(db)
        attendee = create_sample_attendee(db)
        
        # Crear eventos de ejemplo
        print("\n--- Creando Eventos ---")
        events = create_sample_events(db, organizer)
        
        # Crear sesiones de ejemplo
        print("\n--- Creando Sesiones ---")
        create_sample_sessions(db, events)
        
        db.commit()
        
        print("\n" + "="*60)
        print("SEED COMPLETADO EXITOSAMENTE")
        print("="*60)
        print("\nUsuarios disponibles:")
        print("  1. Admin:       admin@miseventos.com / admin123")
        print("  2. Organizador: organizador@miseventos.com / organizador123")
        print("  3. Asistente:   asistente@miseventos.com / asistente123")
        print(f"\nEventos creados: {len(events)}")
        print("\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error durante el seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
