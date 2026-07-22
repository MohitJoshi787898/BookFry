import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  number: string;
  label: string;
  className?: string;
}

export function StatCard({ number, label, className }: StatCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-6 bg-surface border border-border/60 rounded-xl shadow-xs text-center font-sans space-y-1',
          className
        )
      )}
    >
      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
        {number}
      </span>
      <span className="text-xs sm:text-sm text-text-secondary font-medium">
        {label}
      </span>
    </div>
  );
}

export default StatCard;
