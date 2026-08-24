import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  loading = false,
  closeOnOverlayClick = true,
  className,
}: DialogProps) {
  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full m-4 h-[calc(100vh-2rem)]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#060E17]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => {
          if (closeOnOverlayClick && !loading) {
            onClose();
          }
        }}
      />

      {/* Modal Box */}
      <div
        className={cn(
          'relative w-full bg-card border border-border rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10',
          sizes[size],
          className
        )}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-card/75 backdrop-blur-3xs flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="font-serif text-lg font-bold text-text-primary">
            {title}
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-muted transition-colors focus-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-5 sm:p-6 overflow-y-auto text-sm text-text-secondary font-normal leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-muted/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dialog;
