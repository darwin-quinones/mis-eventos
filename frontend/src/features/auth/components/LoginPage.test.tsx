import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

// Mock useAuthStore
vi.mock('../../../store/auth.store', () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el correo es requerido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const form = emailInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/el correo no es válido/i)).toBeInTheDocument();
    });
  });

  it('has link to register page', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const registerLink = screen.getByText(/regístrate aquí/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
