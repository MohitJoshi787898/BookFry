'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerHero?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'sheet' | 'full';
  loading?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  sheet: 'max-w-2xl lg:max-w-3xl ml-auto h-full rounded-none sm:rounded-l-3xl border-l border-border',
  full: 'max-w-6xl m-4 h-[calc(100vh-2rem)]',
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerHero,
  headerActions,
  children,
  footer,
  size = 'lg',
  loading = false,
  closeOnOverlayClick = true,
  className,
}: AdminModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
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
  }, [isOpen, onClose, loading]);

  const isSheet = size === 'sheet';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex font-sans',
            isSheet ? 'justify-end items-stretch p-0' : 'items-end sm:items-center justify-center p-0 sm:p-4'
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              if (closeOnOverlayClick && !loading) {
                onClose();
              }
            }}
            aria-hidden="true"
          />

          {/* Modal / Sheet Container */}
          <motion.div
            initial={isSheet ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
            animate={isSheet ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isSheet ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={cn(
              'relative w-full bg-card border border-border/80 shadow-2xl flex flex-col overflow-hidden z-10',
              isSheet
                ? 'h-full max-h-screen'
                : 'rounded-t-[32px] sm:rounded-3xl max-h-[90vh]',
              MODAL_SIZES[size],
              className
            )}
          >
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-card/85 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-muted border border-border shadow-md">
                  <Loader2 className="h-6 w-6 text-secondary animate-spin" />
                  <p className="text-xs font-bold text-foreground">Processing request...</p>
                </div>
              </div>
            )}

            {/* Custom Entity Hero Header if provided */}
            {headerHero ? (
              <div className="relative border-b border-border/80 bg-muted/40">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
                {headerHero}
              </div>
            ) : (
              /* Standard Identity Header */
              <div className="px-6 py-4 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="h-10 w-10 rounded-2xl bg-secondary/12 text-secondary flex items-center justify-center shrink-0 border border-secondary/20 shadow-xs">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-foreground truncate">
                        {title}
                      </h3>
                      {badge}
                    </div>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {headerActions}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto text-sm text-muted-foreground leading-relaxed space-y-5">
              {children}
            </div>

            {/* Sticky Action Footer */}
            {footer && (
              <div className="px-6 py-3.5 border-t border-border/80 bg-muted/40 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
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
      <span className="font-semibold text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0 text-right font-medium text-foreground">
        <span className="truncate">{value}</span>
        {copyable && typeof value === 'string' && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-muted-foreground hover:text-secondary rounded-lg transition-colors cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
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
    default: 'bg-muted/70 border-border text-foreground',
    success: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/12 border-amber-500/25 text-amber-600 dark:text-amber-400',
    danger: 'bg-rose-500/12 border-rose-500/25 text-rose-600 dark:text-rose-400',
    info: 'bg-sky-500/12 border-sky-500/25 text-sky-600 dark:text-sky-400',
  };

  return (
    <div className={cn('px-3.5 py-2.5 rounded-2xl border flex flex-col gap-0.5 shadow-xs', variants[variant])}>
      <span className="text-[10px] font-black uppercase tracking-wider opacity-75">{label}</span>
      <span className="font-mono text-sm font-extrabold">{value}</span>
    </div>
  );
}

export default AdminModal;
