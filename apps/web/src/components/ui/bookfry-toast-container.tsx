'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/stores/toast.store';
import { BookFryToast } from './bookfry-toast';

export function BookFryToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed z-[100] flex flex-col pointer-events-none p-4 sm:p-6
        /* Desktop: Top-Right */
        top-4 right-0 left-auto bottom-auto
        /* Mobile: Bottom-Center, above bottom nav */
        max-sm:top-auto max-sm:bottom-20 max-sm:right-0 max-sm:left-0 max-sm:items-center
        items-end gap-2.5 max-w-full"
    >
      <div className="flex flex-col gap-2.5 w-full sm:w-auto items-end max-sm:items-center pointer-events-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((toastItem) => (
            <BookFryToast key={toastItem.id} item={toastItem} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

