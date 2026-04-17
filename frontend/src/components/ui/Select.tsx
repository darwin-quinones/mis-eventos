import { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            border rounded-xl px-4 py-2.5 text-sm w-full
            focus:outline-none focus:ring-2 focus:border-transparent
            bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
            transition-colors duration-150
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-300 dark:border-neutral-600 focus:ring-brand-500'
            }
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
