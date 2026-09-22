'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, RotateCcw } from 'lucide-react';

export interface BooksConditionTabsProps {
  activeCondition: 'all' | 'new' | 'used';
  onChange: (condition: 'all' | 'new' | 'used') => void;
  className?: string;
}

interface ConditionTabItem {
  id: 'all' | 'new' | 'used';
  label: string;
  mobileLabel: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: ConditionTabItem[] = [
  {
    id: 'all',
    label: 'All Books',
    mobileLabel: 'All',
    badge: 'Verified',
    icon: BookOpen,
  },
  {
    id: 'new',
    label: 'New Books',
    mobileLabel: 'New',
    badge: 'Mint',
    icon: Sparkles,
  },
  {
    id: 'used',
    label: 'Old / Used Books',
    mobileLabel: 'Old / Used',
    badge: 'Pre-Loved',
    icon: RotateCcw,
  },
];

export function BooksConditionTabs({
  activeCondition,
  onChange,
  className = '',
}: BooksConditionTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Book condition tabs"
      className={`w-full p-1.5 bg-muted/60 dark:bg-card border border-border/80 rounded-2xl flex items-center gap-1.5 shadow-xs font-sans ${className}`}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeCondition === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${tab.label} condition`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 relative py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
              isActive
                ? 'text-secondary shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeConditionTab"
                className="absolute inset-0 bg-background dark:bg-secondary/15 rounded-xl border border-secondary/30 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Icon
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 relative z-10 transition-colors ${
                isActive ? 'text-secondary' : 'text-muted-foreground'
              }`}
            />
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            <span className="relative z-10 sm:hidden">{tab.mobileLabel}</span>

            {tab.badge && (
              <span
                className={`relative z-10 hidden md:inline-flex items-center text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-secondary/15 text-secondary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default BooksConditionTabs;
