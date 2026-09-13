'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from '@bookmarket/types';
import { getSafeInitials } from '@/hooks/use-current-user';

export interface DashboardAvatarProps {
  user: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPresence?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

const imageDimensions = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 44,
};

export function DashboardAvatar({
  user,
  size = 'md',
  showPresence = true,
  className = '',
}: DashboardAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getSafeInitials(user?.name, user?.email);
  const avatarUrl = user?.avatarUrl;

  const showImage = Boolean(avatarUrl && !imageFailed);

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`relative overflow-hidden rounded-2xl flex items-center justify-center font-bold font-sans transition-transform ${
          sizeClasses[size]
        } ${
          showImage
            ? 'bg-muted border border-border/80'
            : 'bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground shadow-xs'
        }`}
      >
        {showImage ? (
          <Image
            src={avatarUrl!}
            alt={user?.name ? `${user.name}'s Avatar` : 'User profile'}
            width={imageDimensions[size]}
            height={imageDimensions[size]}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="tracking-tight font-extrabold">{initials}</span>
        )}
      </div>

      {showPresence && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card shadow-2xs"
          title="Account Active"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default DashboardAvatar;
