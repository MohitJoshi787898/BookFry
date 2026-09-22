'use client';

import React from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  X,
} from 'lucide-react';
import { BooksConditionTabs } from './books-condition-tabs';

export interface BooksViewControlsProps {
  totalBooks: number;
  sort: string;
  setSort: (v: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (v: 'grid' | 'list') => void;
  onOpenMobileFilters: () => void;
  categoryName?: string;
  conditionType: 'all' | 'new' | 'used';
  onConditionTypeChange?: (v: 'all' | 'new' | 'used') => void;
  conditions: string[];
  minPrice: string;
  maxPrice: string;
  languages: string[];
  onRemoveCategory: () => void;
  onRemoveConditionType: () => void;
  onRemoveCondition: (c: string) => void;
  onRemovePrice: () => void;
  onRemoveLanguage: (l: string) => void;
  onClearAll: () => void;
}

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest Arrivals' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Customer Ratings' },
  { value: 'title:asc', label: 'Title: A to Z' },
];

export function BooksViewControls({
  totalBooks,
  sort,
  setSort,
  viewMode,
  setViewMode,
  onOpenMobileFilters,
  categoryName,
  conditionType,
  onConditionTypeChange,
  conditions,
  minPrice,
  maxPrice,
  languages,
  onRemoveCategory,
  onRemoveConditionType,
  onRemoveCondition,
  onRemovePrice,
  onRemoveLanguage,
  onClearAll,
}: BooksViewControlsProps) {
  const hasActiveFilters =
    Boolean(categoryName) ||
    conditionType !== 'all' ||
    conditions.length > 0 ||
    Boolean(minPrice || maxPrice) ||
    languages.length > 0;

  return (
    <div className="space-y-3 font-sans">
      {/* Quick Condition Tabs (All / New / Old & Used) */}
      {onConditionTypeChange && (
        <BooksConditionTabs
          activeCondition={conditionType}
          onChange={onConditionTypeChange}
        />
      )}

      {/* Primary Bar: Mobile Filter Trigger + Result Count + Sort + View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card shadow-xs">
        {/* Mobile Filter Button */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary text-white font-extrabold text-xs uppercase tracking-wider shadow-xs hover:bg-secondary/90 transition-all active:scale-95 cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
        </button>

        {/* Results Counter */}
        <div className="text-xs text-muted-foreground font-semibold">
          Showing <span className="font-mono font-bold text-foreground">{totalBooks}</span> listings
        </div>

        {/* Sort & Grid/List Layout Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-border/80 bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* View Switcher */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-card text-secondary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-card text-secondary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mr-1">
            Active Filters:
          </span>

          {categoryName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/12 border border-secondary/25 text-secondary text-xs font-bold">
              Category: {categoryName}
              <button
                onClick={onRemoveCategory}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {conditionType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/12 border border-secondary/25 text-secondary text-xs font-bold capitalize">
              {conditionType} Books
              <button
                onClick={onRemoveConditionType}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {conditions.map((cond) => (
            <span
              key={cond}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-bold capitalize"
            >
              {cond.replace('_', ' ')}
              <button
                onClick={() => onRemoveCondition(cond)}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-bold">
              ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
              <button
                onClick={onRemovePrice}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-bold capitalize"
            >
              {lang}
              <button
                onClick={() => onRemoveLanguage(lang)}
                className="hover:text-secondary transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <button
            onClick={onClearAll}
            className="text-xs font-bold text-secondary hover:underline ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

export default BooksViewControls;
