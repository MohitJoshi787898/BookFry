'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { ToastItem } from '@/types/toast';
import { toast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

interface BookFryToastProps {
  item: ToastItem;
}

const VARIANT_STYLES = {
  success: {
    container: 'border-success/30 bg-card shadow-lg shadow-success/5',
    accentBar: 'bg-success',
    badge: 'bg-success/10 text-success border-success/20',
    title: 'text-foreground',
    glow: 'from-success/15 to-transparent',
  },
  error: {
    container: 'border-danger/30 bg-card shadow-lg shadow-danger/5',
    accentBar: 'bg-danger',
    badge: 'bg-danger/10 text-danger border-danger/20',
    title: 'text-foreground',
    glow: 'from-danger/15 to-transparent',
  },
  warning: {
    container: 'border-warning/30 bg-card shadow-lg shadow-warning/5',
    accentBar: 'bg-warning',
    badge: 'bg-warning/10 text-warning border-warning/20',
    title: 'text-foreground',
    glow: 'from-warning/15 to-transparent',
  },
  info: {
    container: 'border-info/30 bg-card shadow-lg shadow-info/5',
    accentBar: 'bg-info',
    badge: 'bg-info/10 text-info border-info/20',
    title: 'text-foreground',
    glow: 'from-info/15 to-transparent',
  },
  loading: {
    container: 'border-secondary/30 bg-card shadow-lg shadow-secondary/5',
    accentBar: 'bg-secondary',
    badge: 'bg-secondary/10 text-secondary border-secondary/20',
    title: 'text-foreground',
    glow: 'from-secondary/15 to-transparent',
  },
};

export function BookFryToast({ item }: BookFryToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(item.duration);
  const startTimeRef = useRef<number>(Date.now());

  const style = VARIANT_STYLES[item.variant];

  // Auto-dismissal timer with hover/focus pause
  useEffect(() => {
    if (item.persistent || isPaused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      toast.dismiss(item.id);
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [item.id, item.persistent, isPaused]);

  const handleMouseEnter = () => {
    if (item.persistent) return;
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(1000, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    if (item.persistent) return;
    setIsPaused(false);
  };

  const isAssertive = item.variant === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90) {
          toast.dismiss(item.id);
        }
      }}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      className={cn(
        'group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border',
        'backdrop-blur-md transition-shadow font-sans max-w-sm sm:max-w-md w-full',
        'select-none touch-manipulation',
        style.container
      )}
    >
      {/* Left subtle colored accent edge */}
      <div className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-r-full', style.accentBar)} />

      {/* Mascot Icon Container */}
      <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-sunken/60 border border-border/60 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 bg-radial',
            style.glow
          )}
        />
        <Image
          src={item.mascot}
          alt={`BookFry ${item.variant} mascot`}
          width={44}
          height={44}
          className={cn(
            'object-contain relative z-10 drop-shadow-xs transition-transform duration-300',
            item.variant === 'loading' ? 'animate-pulse' : 'group-hover:scale-105'
          )}
          unoptimized
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-4">
        {item.title && (
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={cn('font-bold text-xs sm:text-sm tracking-tight', style.title)}>
              {item.title}
            </h4>
            {item.variant === 'loading' && (
              <Loader2 className="h-3 w-3 animate-spin text-secondary" />
            )}
          </div>
        )}
        <p className="text-xs text-text-secondary leading-relaxed font-medium line-clamp-3">
          {item.message}
        </p>

        {/* Optional Action Button */}
        {item.action && (
          <div className="mt-2.5 flex items-center gap-2">
            {item.action.href ? (
              <Link
                href={item.action.href}
                onClick={() => toast.dismiss(item.id)}
                className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all active:scale-95 shadow-xs"
              >
                {item.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick?.();
                  toast.dismiss(item.id);
                }}
                className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand/90 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                {item.action.label}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

