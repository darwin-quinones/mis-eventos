import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-full sm:max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {footer && (
          <div className="flex gap-3 p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
