'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface RoleEmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  mascotVariant?: 'reading' | 'pointing' | 'floating' | 'searching';
}

export function RoleEmptyState({
  title,
  description,
  action,
  secondaryAction,
  mascotVariant = 'reading',
}: RoleEmptyStateProps) {
  const mascotMap: Record<string, string> = {
    reading: '/assets/bookfry/bookfry-fox-reading.webp',
    pointing: '/assets/bookfry/bookfry-fox-pointing.webp',
    floating: '/assets/bookfry/bookfry-fox-floating.webp',
    searching: '/assets/bookfry/bookfry-fox-reading.webp',
  };

  const imageSrc = mascotMap[mascotVariant] || mascotMap.reading;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-border/80 bg-card shadow-xs font-sans my-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 drop-shadow-md"
      >
        <Image
          src={imageSrc}
          alt="BookFry Mascot"
          fill
          sizes="144px"
          className="object-contain"
          priority
        />
      </motion.div>

      <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground max-w-md">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-5 leading-relaxed font-medium">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {action && action.href ? (
          <Link
            href={action.href}
            className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
          >
            {action.label}
          </Link>
        ) : action && action.onClick ? (
          <button
            type="button"
            onClick={action.onClick}
            className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {action.label}
          </button>
        ) : null}

        {secondaryAction && secondaryAction.href ? (
          <Link
            href={secondaryAction.href}
            className="px-4 py-2.5 border border-border/80 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
          >
            {secondaryAction.label}
          </Link>
        ) : secondaryAction && secondaryAction.onClick ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="px-4 py-2.5 border border-border/80 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default RoleEmptyState;
