# Mis Eventos

Plataforma completa de gestión de eventos desarrollada con FastAPI (backend) y React (frontend). Sistema profesional para crear, administrar y registrarse a eventos con sesiones programadas, control de capacidad y autenticación de usuarios.

## Características Principales

### Gestión de Eventos
- CRUD completo de eventos con validaciones de negocio
- Control de capacidad y estados (borrador, publicado, cancelado, completado)
- Búsqueda avanzada por nombre, categoría y estado
- Filtros y ordenamiento (fecha, capacidad)
- Categorías y etiquetas para organización
- Compartir eventos en redes sociales

### Programación de Sesiones
- Creación y gestión de sesiones dentro de eventos
- Asignación de ponentes con biografía y foto
- Validación de horarios y conflictos
- Control de capacidad por sesión

### Sistema de Usuarios
- Registro y autenticación con JWT
- Roles (Admin, Organizador, Asistente)
- Perfil de usuario con eventos registrados
- Recuperación de contraseña
- Protección de rutas por autenticación y rol

### Registro de Asistentes
- Inscripción a eventos con validación de capacidad
- Gestión de registros por usuario
- Cancelación de registros
- Historial de eventos asistidos

### Interfaz de Usuario
- Diseño moderno y responsivo con Tailwind CSS
- Modo oscuro/claro con persistencia
- Componentes reutilizables y accesibles
- Loading states y feedback visual
- Paginación en listados
- Validación de formularios en tiempo real

## Tecnologías

### Backend
- **Python 3.12** - Lenguaje base
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy + SQLModel** - ORM para base de datos
- **PostgreSQL 16** - Base de datos relacional (producción)
- **SQLite** - Base de datos para desarrollo local (opcional)
- **Alembic** - Migraciones de base de datos
- **Poetry** - Gestión de dependencias
- **JWT (python-jose)** - Autenticación
- **bcrypt (passlib)** - Hash de contraseñas
- **pytest** - Testing unitario
- **ruff + mypy** - Linting y type checking

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **React Router v6** - Enrutamiento
- **Zustand** - Gestión de estado
- **Axios** - Cliente HTTP
- **React Hook Form + Zod** - Validación de formularios
- **Vitest** - Testing unitario

### Infraestructura
- **Docker + Docker Compose** - Containerización
- **PostgreSQL 16** - Base de datos en contenedor
- **Nginx** - Servidor web para frontend en producción

## Inicio Rápido

### Opción 1: Docker (Recomendado - PostgreSQL)

Levanta todos los servicios con un solo comando. Incluye PostgreSQL y ejecuta migraciones y seed automáticamente:

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd mis-eventos

# 2. Copiar archivos de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar todos los servicios
docker-compose up --build
```

El seed se ejecuta automáticamente al iniciar el contenedor del backend.

Servicios disponibles:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### Opción 2: Desarrollo Local (SQLite o PostgreSQL)

#### Backend

```bash
cd backend

# Instalar dependencias
python -m poetry install

# Configurar entorno
cp .env.example .env

# Editar .env y elegir base de datos:
# Para SQLite (desarrollo rápido):
#   DATABASE_URL=sqlite:///./miseventos.db
# Para PostgreSQL (recomendado):
#   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/miseventos

# Si usas PostgreSQL, crear la base de datos:
createdb miseventos
# O con Docker:
docker run --name miseventos-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=miseventos -p 5432:5432 -d postgres:16-alpine

# Ejecutar migraciones
python -m poetry run alembic upgrade head

# Crear usuarios de demostración (IMPORTANTE - NO OMITIR)
python -m poetry run python seed_db.py

# Iniciar servidor
python -m poetry run uvicorn app.main:app --reload
```

Backend disponible en: http://localhost:8000

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

Frontend disponible en: http://localhost:5173

### 🔑 Usuarios de Demostración

**IMPORTANTE**: Después de ejecutar las migraciones, debes ejecutar el seed para crear usuarios de prueba:

```bash
# Backend
cd backend
python -m poetry run python seed_db.py
```

Esto creará automáticamente:

```
Admin:       admin@miseventos.com / admin123
Organizador: organizador@miseventos.com / organizador123
Asistente:   asistente@miseventos.com / asistente123
```

También creará 5 eventos de ejemplo con sesiones programadas.

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción!


## Estructura del Proyecto

```
mis-eventos/
├── backend/                    # Backend FastAPI
│   ├── app/
│   │   ├── main.py            # Punto de entrada
│   │   ├── config.py          # Configuración
│   │   ├── database.py        # Conexión DB
│   │   ├── dependencies.py    # Dependencias FastAPI
│   │   ├── models/            # Modelos SQLModel
│   │   ├── schemas/           # DTOs Pydantic
│   │   ├── routers/           # Endpoints API
│   │   ├── services/          # Lógica de negocio
│   │   ├── repositories/      # Queries DB
│   │   ├── core/              # Seguridad, excepciones
│   │   └── middleware/        # Middlewares
│   ├── alembic/               # Migraciones
│   ├── tests/                 # Tests unitarios
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── README.md
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── main.tsx           # Punto de entrada
│   │   ├── App.tsx            # Router principal
│   │   ├── api/               # Cliente HTTP
│   │   ├── store/             # Estado Zustand
│   │   ├── hooks/             # Custom hooks
│   │   ├── features/          # Módulos por feature
│   │   ├── components/        # Componentes compartidos
│   │   ├── types/             # Tipos TypeScript
│   │   └── utils/             # Utilidades
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md
│   └── ARCHITECTURE.md
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/forgot-password` - Solicitar recuperación
- `POST /auth/reset-password` - Restablecer contraseña

### Eventos
- `GET /events` - Listar eventos (con filtros y paginación)
- `GET /events/{id}` - Detalle de evento
- `POST /events` - Crear evento (autenticado)
- `PUT /events/{id}` - Actualizar evento (autenticado)
- `DELETE /events/{id}` - Eliminar evento (autenticado)

### Sesiones
- `GET /events/{event_id}/sessions` - Listar sesiones de un evento
- `POST /events/{event_id}/sessions` - Crear sesión (autenticado)
- `PUT /sessions/{id}` - Actualizar sesión (autenticado)
- `DELETE /sessions/{id}` - Eliminar sesión (autenticado)

### Registros
- `POST /events/{event_id}/register` - Registrarse a evento (autenticado)
- `GET /registrations/my-events` - Mis eventos registrados (autenticado)
- `DELETE /registrations/{id}` - Cancelar registro (autenticado)

### Admin
- `GET /admin/users` - Listar usuarios (admin)
- `PUT /admin/users/{id}/role` - Cambiar rol (admin)

Documentación completa: http://localhost:8000/docs

## Testing

### Backend (pytest)

```bash
cd backend

# Ejecutar todos los tests
python -m poetry run pytest

# Con cobertura
python -m poetry run pytest --cov=app --cov-report=term-missing

# Generar reporte HTML
python -m poetry run pytest --cov=app --cov-report=html

# Test específico
python -m poetry run pytest tests/test_auth.py
```

**Resultados:**
- ✅ 27/27 tests pasando (100%)
- 📊 Cobertura: 74%
- 📄 Reporte HTML: `backend/htmlcov/index.html`

**Tests implementados:**
- `test_auth.py` (7 tests): Registro, login, autenticación
- `test_events.py` (8 tests): CRUD, búsqueda, validaciones
- `test_sessions.py` (6 tests): CRUD, validaciones de horarios
- `test_registrations.py` (6 tests): Registro, control de capacidad

### Frontend (Vitest)

```bash
cd frontend

# Ejecutar todos los tests
npm run test:run

# Con cobertura
npm run test:coverage

# Modo watch
npm run test

# UI interactiva
npm run test:ui
```

**Resultados:**
- ✅ 18/18 tests pasando (100%)
- 📊 Cobertura: 62.85%
- 📄 Reporte HTML: `frontend/coverage/index.html`

**Tests implementados:**
- `Button.test.tsx` (5 tests): Renderizado, eventos, variantes
- `EventCard.test.tsx` (9 tests): Información, capacidad, estados
- `LoginPage.test.tsx` (4 tests): Formulario, validaciones

Ver documentación detallada en:
- [backend/README.md](backend/README.md#tests)
- [frontend/README.md](frontend/README.md#-tests)

## Desarrollo

### Backend

```bash
# Linting
python -m poetry run ruff check app/

# Type checking
python -m poetry run mypy app/

# Crear nueva migración
python -m poetry run alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
python -m poetry run alembic upgrade head

# Revertir migración
python -m poetry run alembic downgrade -1
```

### Frontend

```bash
# Linting
npm run lint

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Variables de Entorno

### Backend (.env)

```env
# Base de datos - Elige una opción:

# Opción 1: PostgreSQL (Recomendado para producción y Docker)
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/miseventos

# Opción 2: SQLite (Solo para desarrollo local rápido)
# DATABASE_URL=sqlite:///./miseventos.db

# Seguridad
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Entorno
ENVIRONMENT=development
```

**Nota**: PostgreSQL es requerido para producción. SQLite solo para desarrollo local.

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Características Bonus Implementadas

- ✅ Roles de usuarios (Admin, Organizador, Asistente)
- ✅ Permisos de acceso por rol
- ✅ Filtros avanzados (estado, categoría, ordenamiento)
- ✅ Modo oscuro con persistencia
- ✅ Botón de compartir en redes sociales
- ✅ Categorías y etiquetas para eventos
- ✅ Recuperación de contraseña
- ✅ UI/UX moderna y responsiva
- ✅ Loading states y feedback visual
- ✅ Componentes reutilizables
- ✅ Testing y linting configurados
- ✅ Lazy Loading de rutas (code splitting)
- ✅ Optimización de imágenes (WebP, responsive, lazy loading)
- ✅ Caching frontend (Zustand + localStorage con TTL)
- ✅ Caching backend (HTTP Cache-Control headers)

## Arquitectura

### Backend - Arquitectura en Capas

```
Router → Service → Repository → Database
  ↓         ↓          ↓
Schema   Business   SQLAlchemy
         Logic      Queries
```

- **Routers**: Manejo de HTTP (request/response)
- **Services**: Lógica de negocio y validaciones
- **Repositories**: Acceso a base de datos
- **Schemas**: DTOs para validación y serialización

### Frontend - Arquitectura por Features

```
Feature/
├── components/     # Componentes del feature
├── hooks/         # Hooks personalizados
└── types/         # Tipos específicos

Shared/
├── api/           # Cliente HTTP
├── store/         # Estado global
├── components/    # Componentes reutilizables
└── utils/         # Utilidades
```

## Licencia

Este proyecto fue desarrollado como prueba técnica para Tusdatos.co

## Contacto

Para consultas sobre este proyecto, contactar a través del proceso de selección de Tusdatos.co
