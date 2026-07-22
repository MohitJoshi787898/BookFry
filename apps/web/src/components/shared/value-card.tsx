import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ValueCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconVariant?: 'primary' | 'secondary' | 'success';
  className?: string;
}

export function ValueCard({
  title,
  description,
  icon: Icon,
  iconVariant = 'secondary',
  className,
}: ValueCardProps) {
  const iconColors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'p-6 bg-surface border border-border/60 rounded-xl shadow-xs space-y-4 hover:shadow-md transition-shadow duration-200 font-sans',
          className
        )
      )}
    >
      <div className={clsx('h-10 w-10 rounded-full flex items-center justify-center shrink-0', iconColors[iconVariant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default ValueCard;
