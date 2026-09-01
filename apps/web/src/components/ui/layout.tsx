import React from 'react';
import { cn } from '@/lib/utils';

export type LayoutProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Full-Width Page & Section Shell
 * Intelligently expands to 100% available viewport with responsive horizontal padding.
 */
export function Container({ className, ...props }: LayoutProps) {
  return (
    <div
      className={cn('w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16', className)}
      {...props}
    />
  );
}

export function Section({ className, ...props }: LayoutProps) {
  return <section className={cn('py-8 md:py-12 border-b border-border/40 last:border-b-0 w-full', className)} {...props} />;
}

export function Grid({
  cols = 1,
  sm,
  md,
  lg,
  xl,
  className,
  ...props
}: LayoutProps & {
  cols?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) {
  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const smClasses = sm ? `sm:grid-cols-${sm}` : '';
  const mdClasses = md ? `md:grid-cols-${md}` : '';
  const lgClasses = lg ? `lg:grid-cols-${lg}` : '';
  const xlClasses = xl ? `xl:grid-cols-${xl}` : '';

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        colClasses[cols] || 'grid-cols-1',
        smClasses,
        mdClasses,
        lgClasses,
        xlClasses,
        className
      )}
      {...props}
    />
  );
}

export function Stack({ className, ...props }: LayoutProps) {
  return <div className={cn('flex flex-col space-y-4', className)} {...props} />;
}

export function Flex({ className, justify = 'start', align = 'center', wrap = false, ...props }: LayoutProps & {
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
}) {
  const justifies = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
  };

  const aligns = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={cn(
        'flex gap-2.5',
        justifies[justify],
        aligns[align],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    />
  );
}

export function Spacer({ size = 'md', className }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const heights = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  };

  return <div className={cn(heights[size], 'w-full shrink-0', className)} />;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/60 mb-6 font-sans w-full', className)}>
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-text-muted font-medium">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
