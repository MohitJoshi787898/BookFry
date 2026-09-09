import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return <Loader2 className={cn('animate-spin text-secondary shrink-0', sizes[size], className)} />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs font-sans">
      <div className="flex flex-col items-center space-y-4">
        {/* Brand Logo Loader Representation */}
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white font-serif font-black text-xl select-none">
            B
          </div>
          <span className="font-sans font-black text-2xl tracking-tight text-primary">
            Book<span className="text-secondary">Fry</span>
          </span>
        </div>
        <Spinner size="lg" />
      </div>
    </div>
  );
}

export function SectionLoader({ className }: { className?: string }) {
  return (
    <div className={cn('w-full min-h-[200px] flex items-center justify-center bg-card/40 border border-border rounded-xl backdrop-blur-3xs', className)}>
      <Spinner size="lg" />
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/80 bg-card overflow-hidden animate-pulse shadow-xs">
      <div className="w-full aspect-[4/3.8] bg-muted/60" />
      <div className="p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="h-3 w-14 bg-muted rounded-md" />
            <div className="h-3 w-8 bg-muted rounded-md" />
          </div>
          <div className="h-3.5 w-5/6 bg-muted rounded-md" />
          <div className="h-3 w-1/2 bg-muted rounded-md" />
        </div>
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 w-12 bg-muted rounded-md" />
            <div className="h-3 w-10 bg-muted rounded-md" />
          </div>
          <div className="h-8 w-full bg-muted/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full border border-border rounded-xl overflow-hidden font-sans">
      <div className="bg-muted/40 h-10 border-b border-border flex items-center px-4 space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-grow" style={{ maxWidth: '120px' }} />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-12 flex items-center px-4 space-x-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3 bg-muted rounded flex-grow" style={{ maxWidth: '100px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-border bg-card rounded-xl animate-pulse">
          <div className="h-16 w-12 bg-muted rounded shrink-0" />
          <div className="flex-grow space-y-2">
            <div className="h-3 w-1/2 bg-muted rounded" />
            <div className="h-2.5 w-1/3 bg-muted rounded" />
            <div className="h-2 w-1/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default Spinner;
