import { type ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'admin' | 'organizer' | 'attendee';
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
