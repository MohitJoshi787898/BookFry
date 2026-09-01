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
    <div ref={containerRef} className="relative font-sans space-y-1">
      <label className="text-xs font-black text-foreground uppercase tracking-wider block">
        Book Category / Genre <span className="text-rose-500">*</span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full px-4 py-3 border rounded-2xl bg-background text-left flex items-center justify-between text-xs transition-all active:scale-[0.99] ${
          error
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : open
            ? 'border-secondary ring-2 ring-secondary/20'
            : 'border-border/80 hover:border-secondary/50'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Layers className="h-4 w-4 text-secondary shrink-0" />
          {selectedCategory ? (
            <span className="font-extrabold text-foreground truncate">{selectedCategory.name}</span>
          ) : (
            <span className="text-muted-foreground font-medium">Select or search book category...</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Searchable Dropdown Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border/80 rounded-3xl p-3 shadow-2xl z-50 space-y-2 backdrop-blur-xl font-sans">
          {/* Search Input inside popover */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Engineering, Medical, Novels..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-border/60 rounded-xl bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-secondary/10 text-secondary font-black'
                        : 'hover:bg-muted text-foreground font-semibold'
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

      {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
    </div>
  );
}

export default CategorySearchSelect;
