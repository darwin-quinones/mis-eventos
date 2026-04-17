import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-brand-500">Mis Eventos</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                    : 'text-brand-500 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                }`}
              >
                Eventos
              </button>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <button
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin') 
                          ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                          : 'text-brand-500 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                      }`}
                    >
                      Admin
                    </button>
                  </Link>
                )}
                <Link to="/profile">
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                        : 'text-brand-500 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                    }`}
                  >
                    Mi Perfil
                  </button>
                </Link>
                <Button variant="secondary" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <button
                  className={`w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  Eventos
                </button>
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <button
                        className={`w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/admin') 
                            ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        Admin
                      </button>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      className={`w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/profile') 
                          ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      Mi Perfil
                    </button>
                  </Link>
                  <Button variant="secondary" onClick={handleLogout} className="w-full">
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
