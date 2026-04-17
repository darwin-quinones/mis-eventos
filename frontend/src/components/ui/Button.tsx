import { type ReactNode } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-xl px-5 py-2.5 font-medium text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-700',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    ghost: 'bg-transparent text-brand-500 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
