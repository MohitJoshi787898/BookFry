'use client';

import React from 'react';
import { Check, BookOpen, ShieldAlert, DollarSign, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ListingTab {
  id: string;
  stepNumber: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const LISTING_TABS: ListingTab[] = [
  { id: 'basic', stepNumber: 1, label: 'Basic Information', shortLabel: 'Basic Info', icon: BookOpen },
  { id: 'condition', stepNumber: 2, label: 'Book Condition', shortLabel: 'Condition', icon: ShieldAlert },
  { id: 'pricing', stepNumber: 3, label: 'Pricing & Payout', shortLabel: 'Pricing', icon: DollarSign },
  { id: 'inventory', stepNumber: 4, label: 'Inventory & Pickup', shortLabel: 'Inventory', icon: MapPin },
  { id: 'images', stepNumber: 5, label: 'Book Photos', shortLabel: 'Photos', icon: Camera },
  { id: 'review', stepNumber: 6, label: 'Review & Post', shortLabel: 'Review', icon: CheckCircle2 },
];

interface ListingProgressTabsProps {
  currentTab: string;
  completedStepNumbers: number[];
  onSelectTab: (tabId: string) => void;
  tabErrors?: Record<string, boolean>;
}

export function ListingProgressTabs({
  currentTab,
  completedStepNumbers,
  onSelectTab,
  tabErrors = {},
}: ListingProgressTabsProps) {
  const currentTabObj = LISTING_TABS.find((t) => t.id === currentTab) || LISTING_TABS[0];
  const progressPercent = Math.round((currentTabObj.stepNumber / LISTING_TABS.length) * 100);

  return (
    <div className="w-full space-y-3 font-sans">
      {/* Mobile step status & progress bar */}
      <div className="flex sm:hidden items-center justify-between px-1 text-xs font-bold text-foreground">
        <span>
          Step {currentTabObj.stepNumber} of {LISTING_TABS.length}: {currentTabObj.shortLabel}
        </span>
        <span className="font-mono text-secondary">{progressPercent}%</span>
      </div>
      <div className="sm:hidden w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Responsive Horizontal Scrollable Tabs Bar */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth -mx-4 sm:mx-0 px-4 sm:px-0">
        <nav
          role="tablist"
          aria-label="Listing Progress Steps"
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-muted/60 dark:bg-muted/40 border border-border rounded-2xl min-w-max sm:min-w-0 sm:w-full"
        >
          {LISTING_TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            const isCompleted = completedStepNumbers.includes(tab.stepNumber);
            const hasError = tabErrors[tab.id];
            const IconComp = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-secondary',
                  isActive
                    ? 'bg-background text-foreground shadow-sm font-bold border border-border'
                    : isCompleted
                    ? 'text-foreground hover:bg-background/60 cursor-pointer'
                    : 'text-muted-foreground hover:text-foreground cursor-pointer'
                )}
              >
                {/* Step badge / Checkmark indicator */}
                <span
                  className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-colors',
                    hasError
                      ? 'bg-rose-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : tab.stepNumber}
                </span>

                <IconComp className={cn('h-3.5 w-3.5 hidden md:inline-block', isActive ? 'text-secondary' : 'text-muted-foreground')} />

                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default ListingProgressTabs;
