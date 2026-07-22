import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  illustration,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-surface shadow-xs space-y-4 max-w-md mx-auto font-sans',
          className
        )
      )}
    >
      {illustration && (
        <div className="h-20 w-20 flex items-center justify-center text-brand/60 mb-2">
          {illustration}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xs">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
