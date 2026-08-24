'use client';

import React, { useEffect } from 'react';
import { X, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  loading?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-6xl m-4 h-[calc(100vh-2rem)]',
};

export function AdminDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerActions,
  children,
  footer,
  size = 'lg',
  loading = false,
  closeOnOverlayClick = true,
  className,
}: AdminDialogProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          if (closeOnOverlayClick && !loading) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        className={cn(
          'relative w-full bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[92vh]',
          SIZES[size],
          className
        )}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-3xs flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-secondary animate-spin" />
              <p className="text-xs font-semibold text-text-secondary">Loading details...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-background-subtle/50 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-base sm:text-lg font-bold text-text-primary truncate">
                  {title}
                </h3>
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-text-secondary truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-muted transition-colors focus:ring-2 focus:ring-secondary/40 focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-5 sm:p-6 overflow-y-auto text-sm text-text-secondary font-normal leading-relaxed space-y-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-border bg-background-subtle/40 flex items-center justify-end gap-2.5 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminDetailSection({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
          {icon && <span className="text-secondary">{icon}</span>}
          <span>{title}</span>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function AdminDetailRow({
  label,
  value,
  copyable = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-center justify-between py-1.5 gap-4 text-xs', className)}>
      <span className="font-semibold text-text-muted shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0 text-right font-medium text-text-primary">
        <span className="truncate">{value}</span>
        {copyable && typeof value === 'string' && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-text-muted hover:text-secondary rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminStatBadge({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const variants = {
    default: 'bg-muted border-border text-text-primary',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    danger: 'bg-danger/10 border-danger/30 text-danger',
    info: 'bg-info/10 border-info/30 text-info',
  };

  return (
    <div className={cn('px-3 py-2 rounded-xl border flex flex-col gap-0.5', variants[variant])}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
      <span className="text-sm font-extrabold">{value}</span>
    </div>
  );
}
