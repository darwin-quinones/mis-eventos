import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El correo no es válido';
    }
    
    if (!password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) return;

    try {
      await login(email, password);
      // Only navigate if login was successful
      navigate('/');
    } catch (err) {
      // Error is handled by the store and displayed in the UI
      // Don't navigate on error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.password}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
