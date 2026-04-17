import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName) {
      errors.fullName = 'El nombre completo es requerido';
    }
    
    if (!formData.email) {
      errors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validate()) return;

    try {
      await register(formData.email, formData.password, formData.fullName);
      navigate('/');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Crear Cuenta
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Regístrate para comenzar a gestionar eventos
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={validationErrors.fullName}
            />

            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={validationErrors.email}
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={validationErrors.password}
            />

            <Input
              type="password"
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={validationErrors.confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Registrarse
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
