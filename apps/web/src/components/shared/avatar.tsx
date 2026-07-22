'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
}: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-24 w-24 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={twMerge(
        clsx(
          'relative flex shrink-0 overflow-hidden rounded-full bg-muted border border-border items-center justify-center text-text-secondary font-sans font-bold uppercase select-none',
          sizeClasses[size],
          className
        )
      )}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="h-full w-full object-cover aspect-square"
        />
      ) : alt ? (
        <span>{getInitials(alt)}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-text-muted" />
      )}
    </div>
  );
}

export default Avatar;
