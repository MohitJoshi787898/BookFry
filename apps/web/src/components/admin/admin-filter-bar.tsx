'use client';

import React from 'react';
import { Search, X, LucideIcon } from 'lucide-react';

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

export interface AdminFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filterChips?: FilterChipOption[];
  activeFilter?: string;
  onFilterSelect?: (id: string) => void;
  actions?: React.ReactNode;
}

export function AdminFilterBar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterChips = [],
  activeFilter = '',
  onFilterSelect,
  actions,
}: AdminFilterBarProps) {
  return (
    <div className="space-y-3 font-sans pb-2">
      {/* Search Input & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2.5 bg-card border border-border/80 rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Horizontal Scrollable Filter Chips */}
      {filterChips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            const Icon = chip.icon;

            return (
              <button
                key={chip.id}
                onClick={() => onFilterSelect?.(chip.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-secondary text-white shadow-xs border border-secondary'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminFilterBar;
