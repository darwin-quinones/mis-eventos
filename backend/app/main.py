from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, auth, events, registrations, sessions
from app.middleware.cache import CacheControlMiddleware

# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.session import Session  # noqa: F401
from app.models.registration import EventRegistration  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Mis Eventos API",
    description="Event management platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add cache control middleware
app.add_middleware(CacheControlMiddleware)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(sessions.router)
app.include_router(registrations.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    return {"message": "Mis Eventos API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
