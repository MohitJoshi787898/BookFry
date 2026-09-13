'use client';

import React, { useState } from 'react';
import { Category } from '@bookmarket/types';
import { useLocationStore } from '@/stores/location.store';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Tag,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export interface BooksFilterSidebarProps {
  categories: Category[];
  category: string;
  setCategory: (v: string) => void;
  conditionType: 'all' | 'new' | 'used';
  setConditionType: (v: 'all' | 'new' | 'used') => void;
  conditions: string[];
  toggleCondition: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  languages: string[];
  toggleLanguage: (v: string) => void;
  handleReset: () => void;
  setPage: (p: number) => void;
}

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New (Mint)',
  good: 'Good (Clean Pages)',
  fair: 'Fair (Highlighted)',
  acceptable: 'Acceptable (Readable)',
};

const LANGUAGES_LIST = ['English', 'Hindi', 'Sanskrit', 'Marathi', 'Bengali', 'Tamil'];

export function BooksFilterSidebar({
  categories,
  category,
  setCategory,
  conditionType,
  setConditionType,
  conditions,
  toggleCondition,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  languages,
  toggleLanguage,
  handleReset,
  setPage,
}: BooksFilterSidebarProps) {
  const { locationName, setModalOpen } = useLocationStore();
  const [expanded, setExpanded] = useState({
    location: true,
    category: true,
    conditionType: true,
    condition: true,
    price: true,
    language: false,
  });

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-5 space-y-5 font-sans shadow-xs">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-secondary hover:text-secondary/80 inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Delivery Location Section */}
      <div className="space-y-2">
        <button
          onClick={() => toggle('location')}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span>Delivery Hub</span>
          </div>
          {expanded.location ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded.location && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Deliver to</p>
              <p className="text-xs font-bold text-foreground truncate">{locationName}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-extrabold text-secondary hover:underline shrink-0 cursor-pointer"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Condition Type (All / New / Used) */}
      <div className="space-y-2 pt-2 border-t border-border/70">
        <button
          onClick={() => toggle('conditionType')}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>Listing Type</span>
          </div>
          {expanded.conditionType ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded.conditionType && (
          <div className="grid grid-cols-3 gap-1.5">
            {(['all', 'new', 'used'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setConditionType(type);
                  setPage(1);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                  conditionType === type
                    ? 'bg-secondary text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Used Sub-Condition Checkboxes */}
      {conditionType !== 'new' && (
        <div className="space-y-2 pt-2 border-t border-border/70">
          <button
            onClick={() => toggle('condition')}
            className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
          >
            <span>Book Quality Grade</span>
            {expanded.condition ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {expanded.condition && (
            <div className="space-y-1.5">
              {['like_new', 'good', 'fair', 'acceptable'].map((cond) => (
                <label
                  key={cond}
                  className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-1"
                >
                  <input
                    type="checkbox"
                    checked={conditions.includes(cond)}
                    onChange={() => {
                      toggleCondition(cond);
                      setPage(1);
                    }}
                    className="h-4 w-4 rounded-md border-border text-secondary focus:ring-secondary/20 accent-secondary"
                  />
                  <span className="font-medium">{CONDITION_LABELS[cond]}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Academic Categories */}
      <div className="space-y-2 pt-2 border-t border-border/70">
        <button
          onClick={() => toggle('category')}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-secondary" />
            <span>Category</span>
          </div>
          {expanded.category ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded.category && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => {
                setCategory('');
                setPage(1);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                category === ''
                  ? 'bg-secondary/15 text-secondary font-black'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.slug || cat.id);
                  setPage(1);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors truncate cursor-pointer ${
                  category === cat.slug || category === cat.id
                    ? 'bg-secondary/15 text-secondary font-black'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-2 border-t border-border/70">
        <button
          onClick={() => toggle('price')}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
        >
          <span>Price (₹)</span>
          {expanded.price ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded.price && (
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
            <span className="text-xs text-muted-foreground font-bold">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="space-y-2 pt-2 border-t border-border/70">
        <button
          onClick={() => toggle('language')}
          className="w-full flex items-center justify-between text-xs font-extrabold text-foreground uppercase tracking-wider hover:text-secondary transition-colors cursor-pointer"
        >
          <span>Language</span>
          {expanded.language ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded.language && (
          <div className="space-y-1 pt-1">
            {LANGUAGES_LIST.map((lang) => (
              <label
                key={lang}
                className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-1"
              >
                <input
                  type="checkbox"
                  checked={languages.includes(lang.toLowerCase())}
                  onChange={() => {
                    toggleLanguage(lang.toLowerCase());
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded-md border-border text-secondary focus:ring-secondary/20 accent-secondary"
                />
                <span className="font-medium">{lang}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default BooksFilterSidebar;
