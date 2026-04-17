import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/auth.store';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

// Lazy load all page components
const LoginPage = lazy(() => import('./features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/components/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EventsPage = lazy(() => import('./features/events/components/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./features/events/components/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const EventFormPage = lazy(() => import('./features/events/components/EventFormPage').then(m => ({ default: m.EventFormPage })));
const ProfilePage = lazy(() => import('./features/profile/components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('./features/admin/components/AdminPage').then(m => ({ default: m.AdminPage })));

function App() {
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    // Load user data if token exists
    if (token) {
      loadUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col transition-colors duration-200">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                  <ProtectedRoute>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

