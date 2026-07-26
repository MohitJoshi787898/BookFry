import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogProps } from './dialog';
import { Button } from './button';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  icon?: React.ReactNode;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  className,
  ...props
}: AlertProps) {
  const configs = {
    success: {
      icon: CheckCircle2,
      style: 'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300',
    },
    warning: {
      icon: AlertTriangle,
      style: 'bg-amber-50/60 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300',
    },
    danger: {
      icon: AlertCircle,
      style: 'bg-rose-50/60 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300',
    },
    info: {
      icon: Info,
      style: 'bg-blue-50/60 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300',
    },
  }[variant];

  const IconComponent = icon || configs.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 border rounded-lg text-xs font-sans leading-normal',
        configs.style,
        className
      )}
      {...props}
    >
      <span className="shrink-0 mt-0.5">
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <configs.icon className="h-4 w-4" />
        )}
      </span>
      <div className="space-y-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="font-medium">{children}</div>}
      </div>
    </div>
  );
}

export interface ConfirmDialogProps extends Omit<DialogProps, 'children' | 'footer'> {
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'primary' | 'danger' | 'success';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'primary',
  loading = false,
  ...props
}: ConfirmDialogProps) {
  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : 'success'} size="sm" onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} footer={footer} loading={loading} {...props}>
      <p>{message}</p>
    </Dialog>
  );
}
export default Alert;
