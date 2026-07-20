'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Filter, RotateCcw } from 'lucide-react';

export function QuickFilterBar() {
  const router = useRouter();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const togglePopover = (name: string) => {
    setActivePopover(activePopover === name ? null : name);
  };

  const applyFilters = () => {
    setActivePopover(null);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedPrice) params.set('price', selectedPrice);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (selectedRating) params.set('minRating', selectedRating);
    router.push(`/books?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPrice('');
    setSelectedCondition('');
    setSelectedRating('');
    setActivePopover(null);
    router.push('/books');
  };

  return (
    <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur border-b border-border py-3 px-4 sm:px-6 lg:px-8 transition-colors font-sans">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Desktop Filter Pills */}
        <div className="hidden sm:flex items-center space-x-3 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Quick Filter:
          </span>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => togglePopover('category')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                selectedCategory
                  ? 'border-brand bg-brand/10 text-brand font-semibold'
                  : 'border-border bg-surface text-text-secondary hover:bg-background-subtle'
              }`}
            >
              <span>{selectedCategory ? `Category: ${selectedCategory}` : 'Category'}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {activePopover === 'category' && (
              <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-surface border border-border rounded-md shadow-lg z-50 space-y-2">
                <div className="text-[10px] font-bold uppercase text-text-muted">Select Genre</div>
                {['fiction', 'non-fiction', 'ya', 'kids', 'exams', 'manga'].map((c) => (
                  <label key={c} className="flex items-center space-x-2 text-xs capitalize cursor-pointer hover:text-brand">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === c}
                      onChange={() => setSelectedCategory(c)}
                      className="text-brand focus:ring-brand"
                    />
                    <span>{c}</span>
                  </label>
                ))}
                <button
                  onClick={applyFilters}
                  className="w-full mt-2 py-1 bg-brand text-white text-xs font-bold rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <button
              onClick={() => togglePopover('price')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                selectedPrice
                  ? 'border-brand bg-brand/10 text-brand font-semibold'
                  : 'border-border bg-surface text-text-secondary hover:bg-background-subtle'
              }`}
            >
              <span>{selectedPrice ? `Price: ${selectedPrice}` : 'Price Range'}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {activePopover === 'price' && (
              <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-surface border border-border rounded-md shadow-lg z-50 space-y-2">
                <div className="text-[10px] font-bold uppercase text-text-muted">Select Price</div>
                {[
                  { label: 'Under $10', val: '0-10' },
                  { label: '$10 to $25', val: '10-25' },
                  { label: 'Over $25', val: '25-100' },
                ].map((p) => (
                  <label key={p.val} className="flex items-center space-x-2 text-xs cursor-pointer hover:text-brand">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === p.val}
                      onChange={() => setSelectedPrice(p.val)}
                      className="text-brand focus:ring-brand"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
                <button
                  onClick={applyFilters}
                  className="w-full mt-2 py-1 bg-brand text-white text-xs font-bold rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Condition Filter */}
          <div className="relative">
            <button
              onClick={() => togglePopover('condition')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                selectedCondition
                  ? 'border-brand bg-brand/10 text-brand font-semibold'
                  : 'border-border bg-surface text-text-secondary hover:bg-background-subtle'
              }`}
            >
              <span>{selectedCondition ? `Condition: ${selectedCondition}` : 'Condition'}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {activePopover === 'condition' && (
              <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-surface border border-border rounded-md shadow-lg z-50 space-y-2">
                <div className="text-[10px] font-bold uppercase text-text-muted">Book Condition</div>
                {['new', 'like_new', 'good', 'fair'].map((cond) => (
                  <label key={cond} className="flex items-center space-x-2 text-xs uppercase cursor-pointer hover:text-brand">
                    <input
                      type="radio"
                      name="condition"
                      checked={selectedCondition === cond}
                      onChange={() => setSelectedCondition(cond)}
                      className="text-brand focus:ring-brand"
                    />
                    <span>{cond.replace('_', ' ')}</span>
                  </label>
                ))}
                <button
                  onClick={applyFilters}
                  className="w-full mt-2 py-1 bg-brand text-white text-xs font-bold rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Reset button */}
          {(selectedCategory || selectedPrice || selectedCondition || selectedRating) && (
            <button
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-danger flex items-center space-x-1 underline pl-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Collapsed Button */}
        <div className="sm:hidden w-full flex justify-between items-center">
          <button
            onClick={() => router.push('/books')}
            className="w-full py-2 px-4 border border-border bg-surface rounded-full text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm text-text-primary"
          >
            <Filter className="h-3.5 w-3.5 text-brand" />
            <span>Open All Catalog Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickFilterBar;
