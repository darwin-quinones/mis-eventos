# Arquitectura del Frontend - Mis Eventos

## 📐 Visión General

La aplicación frontend está construida siguiendo una arquitectura modular basada en features, con separación clara de responsabilidades y flujo unidireccional de datos.

## 🏗️ Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│           UI Components (React)          │
│  ┌─────────────────────────────────┐   │
│  │  Features (Auth, Events, etc)   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         State Management (Zustand)       │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth Store  │  │ Events Store │   │
│  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          API Layer (Axios)               │
│  ┌──────────────────────────────────┐  │
│  │  API Client + Interceptors       │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          Backend API (FastAPI)           │
└─────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

### Organización por Features

```
src/
├── features/              # Módulos de funcionalidad
│   ├── auth/             # Autenticación
│   │   └── components/   # LoginPage, RegisterPage
│   ├── events/           # Gestión de eventos
│   │   └── components/   # EventsPage, EventDetail, EventForm
│   ├── profile/          # Perfil de usuario
│   │   └── components/   # ProfilePage
│   └── admin/            # Administración
│       └── components/   # AdminPage
```

Cada feature es autocontenida y puede incluir:
- Componentes específicos
- Hooks personalizados (si son exclusivos del feature)
- Utilidades específicas

### Componentes Compartidos

```
src/components/
├── layout/               # Componentes de layout
│   ├── Navbar.tsx       # Navegación principal
│   ├── Footer.tsx       # Pie de página
│   └── ProtectedRoute.tsx  # Guard de rutas
└── ui/                  # Componentes UI reutilizables
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Badge.tsx
    ├── Modal.tsx
    ├── Toast.tsx
    ├── Spinner.tsx
    └── Skeleton.tsx
```

### Capa de API

```
src/api/
├── client.ts            # Configuración de Axios
├── auth.api.ts          # Endpoints de autenticación
├── events.api.ts        # Endpoints de eventos
├── sessions.api.ts      # Endpoints de sesiones
└── registrations.api.ts # Endpoints de registros
```

### Gestión de Estado

```
src/store/
├── auth.store.ts        # Estado de autenticación
└── events.store.ts      # Estado de eventos
```

### Tipos TypeScript

```
src/types/
├── user.ts              # Tipos de usuario
├── event.ts             # Tipos de eventos
├── session.ts           # Tipos de sesiones
└── api.ts               # Tipos de respuestas API
```

## 🔄 Flujo de Datos

### 1. Autenticación

```
LoginPage
    ↓ (submit)
auth.store.login()
    ↓
authApi.login()
    ↓ (HTTP POST)
Backend API
    ↓ (JWT token)
localStorage
    ↓
auth.store (update state)
    ↓
Navigate to home
```

### 2. Listado de Eventos

```
EventsPage (mount)
    ↓
events.store.fetchEvents()
    ↓
eventsApi.getEvents()
    ↓ (HTTP GET)
Backend API
    ↓ (events data)
events.store (update state)
    ↓
EventsPage (re-render)
    ↓
EventCard components
```

### 3. Registro a Evento

```
EventDetailPage
    ↓ (click register)
apiClient.post('/events/:id/register')
    ↓ (interceptor adds JWT)
Backend API
    ↓ (success)
fetchEvent() (refresh data)
    ↓
Update UI
```

## 🎯 Patrones de Diseño

### 1. Container/Presentational Pattern

**Container Components** (Smart):
- Manejan lógica y estado
- Conectan con stores
- Hacen llamadas a API
- Ejemplo: `EventsPage`, `ProfilePage`

**Presentational Components** (Dumb):
- Solo reciben props
- No tienen estado propio
- Puramente visuales
- Ejemplo: `EventCard`, `Button`, `Badge`

### 2. Custom Hooks Pattern

```typescript
// useTheme.tsx
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return { theme, toggleTheme };
};
```

Beneficios:
- Reutilización de lógica
- Separación de concerns
- Testing más fácil

### 3. Composition Pattern

```typescript
// Composición de componentes
<Modal>
  <Modal.Header>Título</Modal.Header>
  <Modal.Body>Contenido</Modal.Body>
  <Modal.Footer>
    <Button>Cerrar</Button>
  </Modal.Footer>
</Modal>
```

### 4. Protected Routes Pattern

```typescript
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

## 🔐 Gestión de Autenticación

### Flujo de Auth

1. **Login**: Usuario ingresa credenciales
2. **Token**: Backend retorna JWT
3. **Storage**: Token se guarda en localStorage
4. **Interceptor**: Axios agrega token a todas las peticiones
5. **Refresh**: Al recargar, se valida token y carga usuario

### Interceptores de Axios

```typescript
// Request Interceptor - Agrega token
apiClient.interceptors.request.use((config) => {
  const token = getTokenFromStorage();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Maneja errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido, logout
      authStore.logout();
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
```

## 📊 Gestión de Estado con Zustand

### Auth Store

```typescript
interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}
```

### Events Store

```typescript
interface EventsState {
  // Estado
  events: Event[];
  currentEvent: Event | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchEvents: (params) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data) => Promise<Event>;
  updateEvent: (id: string, data) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  clearCurrentEvent: () => void;
}
```

### Persistencia

```typescript
// Zustand persist middleware
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
```

## 🎨 Sistema de Diseño

### Tokens de Diseño

```typescript
// Colores
const colors = {
  brand: {
    50: '#f0f4ff',
    500: '#4f6ef7',  // Primary
    600: '#3d5ce8',
  },
  neutral: {
    50: '#f9fafb',
    900: '#111827',
  }
};

// Espaciado (4px base)
const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
};

// Tipografía
const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    heading: ['DM Sans', 'sans-serif'],
  },
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  }
};
```

### Componentes UI

Todos los componentes UI siguen el mismo patrón:

```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export const Component = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}: ComponentProps) => {
  const baseStyles = '...';
  const variantStyles = { ... };
  const sizeStyles = { ... };
  
  return (
    <element
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </element>
  );
};
```

## 🚀 Optimizaciones

### 1. Code Splitting

```typescript
// Lazy loading de rutas
const EventsPage = lazy(() => import('./features/events/components/EventsPage'));
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage'));
```

### 2. Memoization

```typescript
// Evitar re-renders innecesarios
const MemoizedEventCard = memo(EventCard);

// Memoizar valores computados
const sortedEvents = useMemo(() => {
  return events.sort((a, b) => ...);
}, [events, sortBy]);
```

### 3. Debouncing

```typescript
// Búsqueda con debounce
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);
  return () => clearTimeout(timer);
}, [search]);
```

## 🧪 Testing Strategy

### Unit Tests
- Componentes UI aislados
- Funciones de utilidad
- Custom hooks

### Integration Tests
- Flujos de usuario completos
- Interacción entre componentes
- Llamadas a API (mocked)

### E2E Tests
- Flujos críticos de usuario
- Login → Ver eventos → Registrarse

## 📱 Responsive Design

### Mobile First Approach

```typescript
// Empezar con móvil
<div className="w-full">
  
// Agregar breakpoints para pantallas más grandes
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Breakpoints

- **sm (640px)**: Móvil grande
- **md (768px)**: Tablet
- **lg (1024px)**: Desktop
- **xl (1280px)**: Desktop grande

## 🔒 Seguridad

### XSS Prevention
- React escapa automáticamente el contenido
- Evitar `dangerouslySetInnerHTML`
- Sanitizar input de usuario

### CSRF Protection
- JWT en header (no en cookies)
- Validación en backend

### Sensitive Data
- No almacenar datos sensibles en localStorage
- Solo token JWT (que expira)

## 📈 Performance

### Métricas Objetivo
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.5s
- **CLS** (Cumulative Layout Shift): < 0.1

### Técnicas
- Lazy loading de imágenes
- Code splitting por rutas
- Memoization de componentes pesados
- Debouncing de búsquedas
- Skeleton screens para loading

## 🔄 Ciclo de Vida

### Desarrollo
1. Crear feature branch
2. Implementar funcionalidad
3. Escribir tests
4. Code review
5. Merge a main

### Build
1. `npm run build`
2. Vite optimiza y minifica
3. Genera bundle en `dist/`
4. Listo para deploy

### Deploy
1. Build de producción
2. Docker image
3. Deploy a servidor/CDN
4. Verificar funcionamiento

## 📚 Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
