'use client';

import React from 'react';
import { BookOpen, Store, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export type RegistrationRole = 'buyer' | 'seller';

interface RoleSelectorTabProps {
  activeRole: RegistrationRole;
  onChange: (role: RegistrationRole) => void;
}

export function RoleSelectorTab({ activeRole, onChange }: RoleSelectorTabProps) {
  return (
    <div className="w-full max-w-md mx-auto mb-6 p-1.5 bg-muted/60 dark:bg-card border border-border/80 rounded-2xl flex items-center gap-1.5 shadow-xs font-sans">
      <button
        type="button"
        onClick={() => onChange('buyer')}
        className={`flex-1 relative py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeRole === 'buyer'
            ? 'text-brand dark:text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {activeRole === 'buyer' && (
          <motion.div
            layoutId="activeRoleIndicator"
            className="absolute inset-0 bg-background dark:bg-secondary/15 rounded-xl border border-border/60 shadow-xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <BookOpen className="h-4 w-4 shrink-0 relative z-10 text-secondary" />
        <span className="relative z-10">Buy Books</span>
        <span className="relative z-10 hidden sm:inline text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
          Student
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange('seller')}
        className={`flex-1 relative py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeRole === 'seller'
            ? 'text-secondary dark:text-secondary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {activeRole === 'seller' && (
          <motion.div
            layoutId="activeRoleIndicator"
            className="absolute inset-0 bg-background dark:bg-secondary/15 rounded-xl border border-secondary/30 shadow-xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Store className="h-4 w-4 shrink-0 relative z-10 text-secondary" />
        <span className="relative z-10">Sell Books</span>
        <span className="relative z-10 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">
          <Sparkles className="h-2.5 w-2.5" />
          <span>Earn UPI</span>
        </span>
      </button>
    </div>
  );
}

export default RoleSelectorTab;
