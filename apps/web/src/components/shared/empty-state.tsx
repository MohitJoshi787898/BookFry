import React from 'react';
import { EmptyState as UiEmptyState } from '@/components/ui/empty-state';

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
  // If custom illustration or custom action element is provided, render custom layout,
  // otherwise leverage the central EmptyState styling.
  if (illustration || action) {
    return (
      <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-card shadow-xs space-y-4 max-w-md mx-auto font-sans ${className || ''}`}>
        {illustration && (
          <div className="h-16 w-16 flex items-center justify-center text-secondary mb-2 shrink-0">
            {illustration}
          </div>
        )}
        <div className="space-y-1.5">
          <h3 className="font-serif text-sm font-bold text-text-primary">{title}</h3>
          <p className="text-[10px] text-text-muted leading-relaxed max-w-xs">{description}</p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </div>
    );
  }

  return (
    <UiEmptyState
      title={title}
      description={description}
      className={className}
    />
  );
}

export default EmptyState;
