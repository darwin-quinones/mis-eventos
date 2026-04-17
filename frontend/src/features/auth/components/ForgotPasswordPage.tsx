import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authApi } from '../../../api/auth.api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('El correo es requerido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al enviar el correo de recuperación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Correo Enviado
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Por favor revisa tu bandeja de entrada.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              Enviar Enlace de Recuperación
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
