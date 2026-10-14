'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Layers } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface CategorySearchSelectProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { id: 'engineering', name: 'Engineering & Technology' },
  { id: 'medical', name: 'Medical & Healthcare' },
  { id: 'school', name: 'School Textbooks (K-12)' },
  { id: 'college', name: 'College & University Degrees' },
  { id: 'novel', name: 'Novels & Fiction' },
  { id: 'exams', name: 'Competitive Exams & Test Prep' },
  { id: 'programming', name: 'Programming & Computer Science' },
  { id: 'commerce', name: 'Commerce, CA & Business Studies' },
  { id: 'humanities', name: 'Arts, History & Humanities' },
  { id: 'other', name: 'Other Literature & General Reading' },
];

export function CategorySearchSelect({
  categories,
  value,
  onChange,
  error,
}: CategorySearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const optionsList = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const selectedCategory = optionsList.find((c) => c.id === value || c.name.toLowerCase() === value.toLowerCase());

  const filteredOptions = optionsList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative font-sans space-y-1.5">
      <label className="text-xs font-bold text-foreground block">
        Book Category / Genre <span className="text-rose-500">*</span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-10 px-3.5 border rounded-xl bg-background text-left flex items-center justify-between text-xs sm:text-sm transition-all active:scale-[0.99] cursor-pointer ${
          error
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : open
            ? 'border-secondary ring-2 ring-secondary/20'
            : 'border-border hover:border-secondary/50'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Layers className="h-4 w-4 text-secondary shrink-0" />
          {selectedCategory ? (
            <span className="font-semibold text-foreground truncate">{selectedCategory.name}</span>
          ) : (
            <span className="text-muted-foreground font-normal">Select or search book category...</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Searchable Dropdown Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl p-2.5 shadow-xl z-50 space-y-2 backdrop-blur-xl font-sans">
          {/* Search Input inside popover */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Engineering, Medical, Novels..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-border/80 rounded-lg bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-3">No categories found matching &quot;{search}&quot;</p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedCategory?.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-secondary/15 text-secondary font-bold'
                        : 'hover:bg-muted text-foreground font-medium'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-secondary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

export default CategorySearchSelect;
