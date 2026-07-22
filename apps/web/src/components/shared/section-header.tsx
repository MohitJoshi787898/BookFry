import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'space-y-2',
          align === 'center' ? 'text-center max-w-2xl mx-auto' : 'text-left',
          className
        )
      )}
    >
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-text-secondary font-sans leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
