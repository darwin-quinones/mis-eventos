# Mis Eventos - Backend API

API REST desarrollada con FastAPI para la gestión de eventos, sesiones y asistentes.

## 🚀 Tecnologías

- **Python 3.12**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy + SQLModel** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Alembic** - Migraciones de base de datos
- **Poetry** - Gestión de dependencias
- **JWT** - Autenticación con tokens
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

## 📋 Requisitos Previos

- Python 3.12+
- Poetry
- PostgreSQL 16+ (o Docker)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd mis-eventos/backend
```

### 2. Instalar dependencias con Poetry

```bash
# Instalar Poetry si no lo tienes
curl -sSL https://install.python-poetry.org | python3 -

# Instalar dependencias del proyecto
python -m poetry install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Edita `.env`:

```env
# Database
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/miseventos

# Security
SECRET_KEY=tu-clave-secreta-super-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Environment
ENVIRONMENT=development
```

### 4. Configurar la base de datos

#### Opción A: PostgreSQL local

```bash
# Crear la base de datos
createdb miseventos

# O con psql
psql -U postgres
CREATE DATABASE miseventos;
\q
```

#### Opción B: PostgreSQL con Docker

```bash
docker run --name miseventos-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=miseventos \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 5. Ejecutar migraciones

```bash
python -m poetry run alembic upgrade head
```

### 6. Poblar la base de datos (Seed)

**IMPORTANTE**: Ejecuta el seed para crear usuarios de prueba y datos iniciales:

```bash
python -m poetry run python seed_db.py
```

Esto creará:
- **Usuario Admin**: `admin@miseventos.com` / `admin123`
- **Usuario Organizador**: `organizador@miseventos.com` / `organizador123`
- **Usuario Asistente**: `asistente@miseventos.com` / `asistente123`
- 5 eventos de ejemplo con sesiones

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción!

### 7. Ejecutar el servidor

```bash
# Modo desarrollo con hot-reload
python -m poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# O simplemente
python -m poetry run python -m uvicorn app.main:app --reload
```

El servidor estará disponible en: http://localhost:8000

## 📚 Documentación API

Una vez que el servidor esté corriendo, puedes acceder a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🗂️ Estructura del Proyecto

```
backend/
├── alembic/                 # Migraciones de base de datos
│   ├── versions/           # Archivos de migración
│   └── env.py             # Configuración de Alembic
├── app/
│   ├── core/              # Funcionalidades core
│   │   ├── security.py    # JWT, hashing de contraseñas
│   │   ├── exceptions.py  # Excepciones personalizadas
│   │   └── enums.py       # Enumeraciones (roles, estados)
│   ├── models/            # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── session.py
│   │   └── registration.py
│   ├── schemas/           # Schemas Pydantic (DTOs)
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── session.py
│   │   ├── registration.py
│   │   └── common.py
│   ├── repositories/      # Capa de acceso a datos
│   │   ├── user_repository.py
│   │   ├── event_repository.py
│   │   ├── session_repository.py
│   │   └── registration_repository.py
│   ├── services/          # Lógica de negocio
│   │   ├── auth_service.py
│   │   ├── event_service.py
│   │   ├── session_service.py
│   │   ├── registration_service.py
│   │   └── admin_service.py
│   ├── routers/           # Endpoints de la API
│   │   ├── auth.py
│   │   ├── events.py
│   │   ├── sessions.py
│   │   ├── registrations.py
│   │   └── admin.py
│   ├── config.py          # Configuración de la aplicación
│   ├── database.py        # Configuración de la base de datos
│   ├── dependencies.py    # Dependencias de FastAPI
│   └── main.py           # Punto de entrada de la aplicación
├── tests/                 # Tests unitarios
├── .env.example          # Ejemplo de variables de entorno
├── alembic.ini           # Configuración de Alembic
├── Dockerfile            # Dockerfile para producción
├── pyproject.toml        # Dependencias y configuración de Poetry
└── README.md             # Este archivo
```

## 🔑 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (retorna JWT)
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /auth/reset-password` - Restablecer contraseña

### Eventos
- `GET /events` - Listar eventos (con paginación, búsqueda y filtros)
- `POST /events` - Crear evento (requiere autenticación)
- `GET /events/{id}` - Obtener detalle de evento
- `PUT /events/{id}` - Actualizar evento (requiere ser owner o admin)
- `DELETE /events/{id}` - Eliminar evento (requiere ser owner o admin)

### Sesiones
- `GET /events/{id}/sessions` - Listar sesiones de un evento
- `POST /events/{id}/sessions` - Crear sesión (requiere ser owner o admin)
- `PUT /events/{id}/sessions/{sid}` - Actualizar sesión
- `DELETE /events/{id}/sessions/{sid}` - Eliminar sesión

### Registro a Eventos
- `POST /events/{id}/register` - Registrarse a un evento
- `DELETE /events/{id}/register` - Cancelar registro
- `GET /users/me/events` - Ver mis eventos registrados

### Admin
- `GET /admin/users` - Listar todos los usuarios (solo admin)
- `PUT /admin/users/{id}` - Actualizar usuario (solo admin)
- `DELETE /admin/users/{id}` - Eliminar usuario (solo admin)

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Para acceder a endpoints protegidos:

1. Registra un usuario o inicia sesión
2. Obtén el token JWT del response
3. Incluye el token en el header de las peticiones:

```
Authorization: Bearer <tu-token-jwt>
```

### Roles de Usuario

- **asistente** (por defecto): Puede ver eventos y registrarse. No puede ser promovido.
- **organizador**: Puede crear y gestionar sus propios eventos. Puede ser promovido a admin.
- **admin**: Acceso completo a todas las funcionalidades. No puede ser degradado.

## 🗄️ Base de Datos

### PostgreSQL vs SQLite

Este proyecto está configurado para usar **PostgreSQL** en producción y desarrollo con Docker. Sin embargo, también puedes usar **SQLite** para desarrollo local rápido.

#### Usar PostgreSQL (Recomendado)

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/miseventos
```

#### Usar SQLite (Solo desarrollo local)

```env
DATABASE_URL=sqlite:///./miseventos.db
```

**Nota**: SQLite no soporta todas las características de PostgreSQL. Usa PostgreSQL para producción.

### Seed de Datos

El proyecto incluye un script de seed que crea usuarios y eventos de ejemplo:

```bash
python -m poetry run python seed_db.py
```

**Usuarios creados**:
- Admin: `admin@miseventos.com` / `admin123`
- Organizador: `organizador@miseventos.com` / `organizador123`  
- Asistente: `asistente@miseventos.com` / `asistente123`

El seed es **idempotente**: puedes ejecutarlo múltiples veces sin duplicar datos.

## 🗄️ Migraciones de Base de Datos

### Crear una nueva migración

```bash
python -m poetry run alembic revision -m "descripcion_de_la_migracion"
```

### Aplicar migraciones

```bash
# Aplicar todas las migraciones pendientes
python -m poetry run alembic upgrade head

# Aplicar una migración específica
python -m poetry run alembic upgrade <revision_id>
```

### Revertir migraciones

```bash
# Revertir la última migración
python -m poetry run alembic downgrade -1

# Revertir a una revisión específica
python -m poetry run alembic downgrade <revision_id>
```

### Ver historial de migraciones

```bash
python -m poetry run alembic history
```

## 🐳 Docker

### Construir la imagen

```bash
docker build -t miseventos-backend .
```

### Ejecutar con Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto levantará:
- PostgreSQL en el puerto 5432
- Backend en el puerto 8000
- Frontend en el puerto 80

## 🧪 Tests

El proyecto incluye tests unitarios con pytest y una cobertura del 74%.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
python -m poetry run pytest

# Ejecutar tests con salida detallada
python -m poetry run pytest -v

# Ejecutar tests de un archivo específico
python -m poetry run pytest tests/test_auth.py

# Ejecutar un test específico
python -m poetry run pytest tests/test_auth.py::test_login_success
```

### Cobertura de Código

```bash
# Generar reporte de cobertura en terminal
python -m poetry run pytest --cov=app --cov-report=term-missing

# Generar reporte HTML (recomendado)
python -m poetry run pytest --cov=app --cov-report=html

# Ver el reporte HTML
# Abre: backend/htmlcov/index.html en tu navegador
```

### Tests Implementados

#### ✅ test_auth.py (7 tests)
- Registro de usuario
- Registro con email duplicado
- Login exitoso
- Login con contraseña incorrecta
- Login con usuario inexistente
- Obtener usuario actual
- Ruta protegida sin token

#### ✅ test_events.py (8 tests)
- Crear evento
- Crear evento sin autenticación
- Listar eventos con paginación
- Buscar eventos por nombre
- Obtener detalle de evento
- Actualizar evento
- Eliminar evento
- Validación: fecha fin antes de inicio

#### ✅ test_sessions.py (6 tests)
- Crear sesión
- Crear sesión sin autenticación
- Listar sesiones de un evento
- Actualizar sesión
- Eliminar sesión
- Validación: sesión fuera del horario del evento

#### ✅ test_registrations.py (6 tests)
- Registrarse a un evento
- Registrarse sin autenticación
- Registrarse dos veces al mismo evento
- Cancelar registro
- Ver mis eventos registrados
- Registrarse a evento lleno

### Estructura de Tests

```
tests/
├── conftest.py              # Fixtures compartidos
├── test_auth.py            # Tests de autenticación
├── test_events.py          # Tests de eventos
├── test_sessions.py        # Tests de sesiones
└── test_registrations.py   # Tests de registros
```

### Fixtures Disponibles

- `client`: Cliente de prueba de FastAPI
- `db_session`: Sesión de base de datos en memoria (SQLite)
- `admin_headers`: Headers con token JWT de admin
- `attendee_headers`: Headers con token JWT de asistente
- `test_event`: Evento de prueba creado

### Agregar Nuevos Tests

1. Crear archivo `test_<modulo>.py` en `tests/`
2. Importar fixtures necesarios
3. Escribir funciones de test con prefijo `test_`
4. Usar asserts para validaciones

Ejemplo:

```python
def test_mi_funcionalidad(client, admin_headers):
    response = client.get("/mi-endpoint", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

### Cobertura Actual

- **Total**: 74%
- **Modelos**: 100%
- **Schemas**: 100%
- **Routers**: 73-100%
- **Services**: 60-89%
- **Repositories**: 71-89%

### CI/CD

Los tests se ejecutan automáticamente en cada push/PR. Asegúrate de que todos los tests pasen antes de hacer merge.

```bash
# Verificar que todos los tests pasen
python -m poetry run pytest --maxfail=1 --disable-warnings -q
```

## 🔧 Comandos Útiles

```bash
# Verificar código con ruff
python -m poetry run ruff check .

# Formatear código con ruff
python -m poetry run ruff format .

# Verificar tipos con mypy
python -m poetry run mypy app

# Ver dependencias instaladas
python -m poetry show

# Actualizar dependencias
python -m poetry update
```

## 📝 Notas de Desarrollo

### Agregar una nueva dependencia

```bash
python -m poetry add <paquete>

# Dependencia de desarrollo
python -m poetry add --group dev <paquete>
```

### Crear un nuevo endpoint

1. Definir el schema en `app/schemas/`
2. Crear/actualizar el modelo en `app/models/`
3. Implementar la lógica en `app/services/`
4. Crear el endpoint en `app/routers/`
5. Registrar el router en `app/main.py`

### Validaciones de Negocio

Las validaciones se implementan en la capa de servicios (`app/services/`):
- Validación de fechas
- Control de capacidad
- Permisos de usuario
- Reglas de negocio específicas

## 🚨 Troubleshooting

### Error de conexión a la base de datos

Verifica que PostgreSQL esté corriendo y que las credenciales en `.env` sean correctas.

```bash
# Verificar si PostgreSQL está corriendo
pg_isready -h localhost -p 5432

# O con Docker
docker ps | grep postgres
```

### Error en migraciones

```bash
# Ver el estado actual
python -m poetry run alembic current

# Forzar a una revisión específica (cuidado!)
python -m poetry run alembic stamp head
```

### Puerto 8000 ya en uso

```bash
# Encontrar el proceso
lsof -i :8000

# Matar el proceso
kill -9 <PID>
```

## 📄 Licencia

Este proyecto es parte de una prueba técnica para Tusdatos.co

## 👥 Contacto

Para preguntas o soporte, contacta a: talento@tusdatos.co
