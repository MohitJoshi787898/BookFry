import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  clickable?: boolean;
  borderAccent?: boolean | 'primary' | 'secondary';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, clickable = false, borderAccent = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all',
          hoverable && 'hover:shadow-md hover:-translate-y-0.5 duration-200',
          clickable && 'cursor-pointer active:scale-[0.99]',
          borderAccent === true && 'border-t-2 border-t-primary',
          borderAccent === 'primary' && 'border-t-2 border-t-primary',
          borderAccent === 'secondary' && 'border-t-2 border-t-secondary',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-serif text-base sm:text-lg font-bold leading-snug tracking-tight text-text-primary', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs sm:text-sm text-text-muted font-medium', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-0 text-sm text-text-secondary font-normal leading-relaxed', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-border/40 mt-4', className)} {...props} />;
}

export interface StatCardProps extends CardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  trend?: {
    value: React.ReactNode;
    type: 'up' | 'down' | 'neutral';
  };
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  borderAccent = 'primary',
  ...props
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)} borderAccent={borderAccent} {...props}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-bold text-text-secondary uppercase tracking-wider font-sans">
          {title}
        </CardTitle>
        {icon && <div className="text-text-muted shrink-0">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-1 pb-4">
        <div className="font-mono text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium font-sans">
            {trend && (
              <span
                className={cn(
                  'font-bold',
                  trend.type === 'up' && 'text-emerald-600 dark:text-emerald-400',
                  trend.type === 'down' && 'text-rose-600 dark:text-rose-400',
                  trend.type === 'neutral' && 'text-text-muted'
                )}
              >
                {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default Card;
