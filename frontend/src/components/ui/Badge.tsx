import { type ReactNode } from 'react';

interface BadgeProps {
  variant: 'draft' | 'published' | 'cancelled' | 'completed';
  children: ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
  const variantStyles = {
    draft: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span
      className={`
        text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide
        ${variantStyles[variant]}
      `}
    >
      {children}
    </span>
  );
};
