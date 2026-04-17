import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            border rounded-xl px-4 py-2.5 text-sm w-full
            focus:outline-none focus:ring-2 focus:border-transparent
            bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            transition-colors duration-150 resize-vertical
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-300 dark:border-neutral-600 focus:ring-brand-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
