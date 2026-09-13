'use client';

import React from 'react';
import Image from 'next/image';
import { LucideIcon, Sparkles } from 'lucide-react';

export interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  mascotVariant?: 'reading' | 'pointing' | 'floating' | 'searching' | 'celebrating';
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const MASCOT_MAP = {
  reading: '/assets/bookfry/bookfry-fox-reading.webp',
  pointing: '/assets/bookfry/bookfry-fox-pointing.webp',
  floating: '/assets/bookfry/bookfry-fox-floating.webp',
  searching: '/assets/bookfry/bookfry-fox-pointing.webp',
  celebrating: '/assets/bookfry/bookfry-fox-floating.webp',
};

export function AdminEmptyState({
  title,
  description,
  icon: Icon,
  mascotVariant = 'reading',
  action,
  secondaryAction,
}: AdminEmptyStateProps) {
  const mascotSrc = MASCOT_MAP[mascotVariant];

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs font-sans space-y-4 my-4 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-secondary/10 blur-2xl"
      />

      {/* Strategic Mascot Container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-1 drop-shadow-md">
        <Image
          src={mascotSrc}
          alt="BookFry Fox Assistant"
          fill
          sizes="128px"
          className="object-contain"
          priority
        />
        {Icon && (
          <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-secondary text-secondary-foreground shadow-xs border-2 border-card">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Content Text */}
      <div className="max-w-md space-y-1.5 z-10">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground flex items-center justify-center gap-1.5">
          <span>{title}</span>
          <Sparkles className="h-4 w-4 text-secondary" />
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Triggers */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 z-10">
          {action && (
            <button
              onClick={action.onClick}
              className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 bg-muted/70 hover:bg-muted text-foreground font-bold text-xs rounded-2xl border border-border transition-all active:scale-95 cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminEmptyState;
