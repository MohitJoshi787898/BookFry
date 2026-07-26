import React from 'react';
import { cn } from '@/lib/utils';

export function FormField({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 w-full', className)} {...props} />;
}

export function FormLabel({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-xs font-bold text-text-secondary select-none flex items-center', className)} {...props}>
      {children}
      {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[10px] text-text-muted px-0.5', className)} {...props} />;
}

export function FormError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn('text-danger text-[10px] font-bold px-0.5 mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4 border-b border-border/60 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="font-serif text-sm font-bold text-text-primary">{title}</h3>}
          {description && <p className="text-[10px] text-text-muted font-medium">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)} {...props} />;
}
