import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  direction = 'right',
  size = 'md',
  loading = false,
  closeOnOverlayClick = true,
  className,
}: DrawerProps) {
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

  const widthSizes = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const heightSizes = {
    sm: 'h-1/3',
    md: 'h-1/2',
    lg: 'h-2/3',
    xl: 'h-5/6',
  };

  const directionStyles = {
    left: cn(
      'top-0 left-0 h-full border-r animate-in slide-in-from-left duration-250',
      widthSizes[size] || 'max-w-md'
    ),
    right: cn(
      'top-0 right-0 h-full border-l animate-in slide-in-from-right duration-250',
      widthSizes[size] || 'max-w-md'
    ),
    bottom: cn(
      'bottom-0 left-0 right-0 border-t rounded-t-xl animate-in slide-in-from-bottom duration-250',
      heightSizes[size] || 'h-1/2'
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#060E17]/60 backdrop-blur-3xs transition-opacity duration-300"
        onClick={() => {
          if (closeOnOverlayClick && !loading) {
            onClose();
          }
        }}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'absolute bg-card border-border shadow-2xl flex flex-col overflow-hidden w-full z-10',
          directionStyles[direction],
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
          <div className="font-serif text-base font-bold text-text-primary">
            {title}
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-muted transition-colors focus-ring"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-5 overflow-y-auto text-xs text-text-secondary font-medium leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Drawer;
