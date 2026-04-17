# Mis Eventos - Frontend

Aplicación web moderna desarrollada con React para la gestión de eventos.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router v6** - Enrutamiento
- **Zustand** - Gestión de estado
- **Axios** - Cliente HTTP
- **Tailwind CSS 3.4** - Estilos y diseño
- **React Hook Form + Zod** - Manejo de formularios

## 📋 Requisitos Previos

- Node.js 20+
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

### 4. Build para producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

### 5. Preview del build

```bash
npm run preview
```

## 🧪 Tests

El proyecto incluye tests unitarios con Vitest y React Testing Library.

### Resultados de Tests

```
✅ 18/18 tests pasando (100%)
📊 Cobertura: 62.85%
```

### Ejecutar Tests

```bash
# Ejecutar tests en modo watch
npm run test

# Ejecutar tests una vez
npm run test:run

# Ejecutar tests con UI interactiva
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage
```

### Ver Reporte de Cobertura

Después de ejecutar `npm run test:coverage`, abre:
```
frontend/coverage/index.html
```

### Tests Implementados

#### ✅ Button.test.tsx (5 tests)
- Renderizado con texto
- Evento onClick
- Estado disabled cuando isLoading
- Variantes de estilos (primary, secondary, danger)

#### ✅ EventCard.test.tsx (9 tests)
- Renderizado de título, descripción y ubicación
- Información de capacidad
- Badge de estado
- Categorías y tags
- Estados de capacidad (normal, casi lleno, lleno)

#### ✅ LoginPage.test.tsx (4 tests)
- Renderizado del formulario
- Validación de campos vacíos
- Validación de email inválido
- Link a página de registro

### Cobertura por Archivo

| Archivo | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| Button.tsx | 100% | 100% | 100% | 100% |
| EventCard.tsx | 100% | 86.66% | 100% | 100% |
| LoginPage.tsx | 88.88% | 70% | 100% | 88.46% |

### Estructura de Tests

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
├── features/
│   ├── auth/
│   │   └── components/
│   │       ├── LoginPage.tsx
│   │       └── LoginPage.test.tsx
│   └── events/
│       └── components/
│           ├── EventCard.tsx
│           └── EventCard.test.tsx
└── test/
    └── setup.ts          # Configuración de tests
```

### Agregar Nuevos Tests

1. Crear archivo `Component.test.tsx` junto al componente
2. Importar utilidades de testing
3. Escribir tests con describe/it

Ejemplo:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Mocking

Para mockear módulos:

```typescript
import { vi } from 'vitest';

vi.mock('../store/auth.store', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));
```

## 🗂️ Estructura del Proyecto

```
frontend/
├── public/                # Archivos estáticos
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/              # Clientes API y endpoints
│   │   ├── client.ts     # Configuración de Axios
│   │   ├── auth.api.ts
│   │   ├── events.api.ts
│   │   ├── sessions.api.ts
│   │   └── registrations.api.ts
│   ├── components/       # Componentes compartidos
│   │   ├── layout/       # Navbar, Footer, ProtectedRoute
│   │   └── ui/           # Button, Input, Modal, etc.
│   ├── features/         # Módulos por funcionalidad
│   │   ├── auth/         # Login, Register, ForgotPassword
│   │   ├── events/       # EventsPage, EventDetail, EventForm
│   │   ├── profile/      # ProfilePage
│   │   └── admin/        # AdminPage
│   ├── hooks/            # Custom hooks
│   │   ├── useTheme.tsx
│   │   └── useToast.tsx
│   ├── store/            # Zustand stores
│   │   ├── auth.store.ts
│   │   └── events.store.ts
│   ├── types/            # TypeScript types
│   │   ├── user.ts
│   │   ├── event.ts
│   │   ├── session.ts
│   │   └── api.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── .env.example          # Ejemplo de variables de entorno
├── Dockerfile            # Dockerfile para producción
├── package.json          # Dependencias
├── tailwind.config.js    # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
├── vite.config.ts        # Configuración de Vite
└── README.md             # Este archivo
```

## 🎨 Características de UI/UX

### Diseño
- **Minimalismo moderno** con tipografía clara
- **Paleta de colores** personalizada (brand blue + neutrals)
- **Responsive design** - Móvil, tablet y desktop
- **Dark mode** - Cambio entre tema claro y oscuro
- **Animaciones suaves** - Transiciones de 150-200ms

### Componentes Reutilizables
- **Button** - 4 variantes (primary, secondary, danger, ghost)
- **Input** - Con validación y estados de error
- **Select** - Dropdown personalizado
- **Badge** - Para estados de eventos
- **Modal** - Diálogos modales
- **Toast** - Notificaciones temporales
- **Spinner** - Indicadores de carga
- **Skeleton** - Placeholders de carga

### Funcionalidades
- ✅ Autenticación con JWT
- ✅ Listado de eventos con paginación
- ✅ Búsqueda y filtros avanzados
- ✅ Detalle de eventos con sesiones
- ✅ Registro a eventos
- ✅ Gestión de perfil
- ✅ Crear/editar eventos (organizadores)
- ✅ Dark mode persistente
- ✅ Compartir eventos en redes sociales

## 🔐 Autenticación

El token JWT se almacena en `localStorage` y se incluye automáticamente en todas las peticiones mediante un interceptor de Axios.

```typescript
// El interceptor agrega el token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = getTokenFromStorage();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🎯 Rutas

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | EventsPage | No | Lista de eventos |
| `/events/:id` | EventDetailPage | No | Detalle de evento |
| `/events/new` | EventFormPage | Sí | Crear evento |
| `/events/:id/edit` | EventFormPage | Sí | Editar evento |
| `/login` | LoginPage | No | Iniciar sesión |
| `/register` | RegisterPage | No | Registrarse |
| `/forgot-password` | ForgotPasswordPage | No | Recuperar contraseña |
| `/profile` | ProfilePage | Sí | Perfil de usuario |

## 📦 Gestión de Estado

### Auth Store (Zustand)
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (email, password) => Promise<void>,
  register: (email, password, fullName) => Promise<void>,
  logout: () => void,
  loadUser: () => Promise<void>
}
```

### Events Store (Zustand)
```typescript
{
  events: Event[],
  currentEvent: Event | null,
  pagination: { page, size, total, pages },
  fetchEvents: (page, size, search, status, category) => Promise<void>,
  fetchEvent: (id) => Promise<void>,
  createEvent: (data) => Promise<Event>,
  updateEvent: (id, data) => Promise<Event>,
  deleteEvent: (id) => Promise<void>
}
```

## 🎨 Tailwind CSS

### Colores Personalizados
```javascript
colors: {
  brand: {
    50: '#f0f4ff',
    500: '#4f6ef7',  // Primary blue
    600: '#3d5ce8',
    900: '#1a2f8f',
  },
  neutral: {
    50: '#f9fafb',
    700: '#374151',
    900: '#111827',
  }
}
```

### Dark Mode
Configurado con estrategia `class`. El tema se guarda en `localStorage`.

```typescript
// Cambiar tema
const { theme, toggleTheme } = useTheme();
toggleTheme(); // Alterna entre 'light' y 'dark'
```

## 🐳 Docker

### Build de producción

```bash
docker build -t miseventos-frontend .
```

### Ejecutar contenedor

```bash
docker run -p 80:80 miseventos-frontend
```

### Con Docker Compose

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

## 🧪 Tests

```bash
# Ejecutar tests
npm run test

# Con cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Formatear código
npm run format

# Type checking
npm run type-check
```

## 📱 Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm: '640px',   // Móvil grande
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Desktop grande
```

## 🎯 Mejores Prácticas

### Componentes
- Un componente = una responsabilidad
- Props tipadas con TypeScript
- Máximo 800 líneas por archivo
- Componentes reutilizables en `components/ui/`
- Componentes específicos en `features/`

### Estado
- Estado local con `useState` para UI
- Estado global con Zustand para datos compartidos
- Persistencia con `persist` middleware

### API
- Todas las llamadas en `api/` folder
- Funciones tipadas con TypeScript
- Manejo de errores centralizado
- Interceptores para auth y errores

### Estilos
- Tailwind CSS para todo
- Clases dark: para dark mode
- Transiciones suaves (150-200ms)
- Mobile-first approach

## 🚨 Troubleshooting

### Puerto 5173 en uso

```bash
# Cambiar puerto en vite.config.ts
server: {
  port: 3000
}
```

### Error de CORS

Verifica que el backend tenga configurado el origen del frontend en `BACKEND_CORS_ORIGINS`.

### Build falla

```bash
# Limpiar caché
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar
npm install
npm run build
```

## 📄 Licencia

Este proyecto es parte de una prueba técnica para Tusdatos.co
