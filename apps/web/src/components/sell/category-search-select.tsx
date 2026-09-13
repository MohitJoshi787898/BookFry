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
    <div ref={containerRef} className="relative font-sans space-y-2">
      <label className="text-sm sm:text-base font-bold text-foreground block">
        Book Category / Genre <span className="text-rose-500">*</span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-12 px-4 border rounded-xl bg-background text-left flex items-center justify-between text-sm sm:text-base transition-all active:scale-[0.99] cursor-pointer ${
          error
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : open
            ? 'border-secondary ring-2 ring-secondary/20'
            : 'border-border hover:border-secondary/50'
        }`}
      >
        <div className="flex items-center space-x-3 truncate">
          <Layers className="h-5 w-5 text-secondary shrink-0" />
          {selectedCategory ? (
            <span className="font-bold text-foreground truncate">{selectedCategory.name}</span>
          ) : (
            <span className="text-muted-foreground font-normal">Select or search book category...</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Searchable Dropdown Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl p-3 shadow-2xl z-50 space-y-2 backdrop-blur-xl font-sans">
          {/* Search Input inside popover */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Engineering, Medical, Novels..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border/80 rounded-xl bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-sm">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">No categories found matching &quot;{search}&quot;</p>
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-secondary/15 text-secondary font-bold'
                        : 'hover:bg-muted text-foreground font-medium'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-secondary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

export default CategorySearchSelect;
