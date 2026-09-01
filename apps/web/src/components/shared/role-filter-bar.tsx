'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface RoleFilterChip {
  id: string;
  label: string;
  count?: number;
}

export interface RoleFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterChips?: RoleFilterChip[];
  activeFilter?: string;
  onFilterSelect?: (id: string) => void;
  actions?: React.ReactNode;
}

export function RoleFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterChips = [],
  activeFilter = '',
  onFilterSelect,
  actions,
}: RoleFilterBarProps) {
  return (
    <div className="space-y-3 font-sans mb-5">
      {/* Search Input Bar + Optional Action Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-card border border-border/80 rounded-2xl text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary/40 outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>

      {/* Horizontal Scrollable Filter Chips */}
      {filterChips.length > 0 && onFilterSelect && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterSelect(chip.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center space-x-1.5 shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-white border-secondary shadow-xs font-black'
                    : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{chip.label}</span>
                {typeof chip.count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
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

export default RoleFilterBar;
