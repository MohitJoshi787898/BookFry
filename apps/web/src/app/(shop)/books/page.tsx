'use client';

import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BookCard } from '@/components/shared/book-card';
import { apiClient } from '@/lib/api-client';
import { Book, Category } from '@bookmarket/types';
import { Button } from '@/components/ui/button';
import { BookCardSkeleton } from '@/components/ui/loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/navigation';
import {
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Truck,
  ShieldCheck,
  Search,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────────────────────────
// Filter Section component — shared between sidebar and bottom sheet
// ──────────────────────────────────────────────────────────────────────────────
interface FilterPanelProps {
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
  onApply?: () => void;
  setPage: (p: number) => void;
}

function FilterPanel({
  categories, category, setCategory, conditionType, setConditionType, conditions, toggleCondition,
  minPrice, setMinPrice, maxPrice, setMaxPrice, languages, toggleLanguage,
  handleReset, onApply, setPage,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState({
    category: true, conditionType: true, condition: true, price: true, language: false,
  });
  const toggle = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const conditionLabels: Record<string, string> = {
    like_new: 'Like New', good: 'Good', fair: 'Fair', acceptable: 'Acceptable',
  };

  const conditionColors: Record<string, string> = {
    like_new: 'bg-success/10 text-success border-success/30',
    good: 'bg-info/10 text-info border-info/30',
    fair: 'bg-warning/10 text-warning border-warning/30',
    acceptable: 'bg-secondary/10 text-secondary border-secondary/30',
  };

  return (
    <div className="space-y-1 font-sans">
      {/* Book Type (New vs Used) */}
      <div className="rounded-2xl overflow-hidden border border-border/80 bg-card">
        <button
          onClick={() => toggle('conditionType')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-extrabold text-text-primary uppercase tracking-wider hover:bg-background-subtle transition-colors"
        >
          <span>Book Type</span>
          {expanded.conditionType ? <ChevronUp className="h-3.5 w-3.5 text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>
        {expanded.conditionType && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 flex flex-col gap-1.5">
            {[
              { id: 'all', label: 'All Books (New & Used)' },
              { id: 'new', label: 'New Books Only (Online Payment)' },
              { id: 'used', label: 'Used Books Only (Direct Contact)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setConditionType(t.id as 'all' | 'new' | 'used'); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between ${
                  conditionType === t.id
                    ? 'bg-secondary text-secondary-foreground shadow-xs'
                    : 'text-text-secondary hover:bg-background-subtle'
                }`}
              >
                <span>{t.label}</span>
                {conditionType === t.id && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="rounded-2xl overflow-hidden border border-border/80 bg-card mt-2">
        <button
          onClick={() => toggle('category')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-extrabold text-text-primary uppercase tracking-wider hover:bg-background-subtle transition-colors"
        >
          <span>Category</span>
          {expanded.category ? <ChevronUp className="h-3.5 w-3.5 text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>
        {expanded.category && (
          <div className="px-3 pb-3 space-y-1 border-t border-border/50">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all mt-1 ${
                category === '' ? 'bg-primary text-primary-foreground' : 'text-text-secondary hover:bg-background-subtle'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  category === cat.id ? 'bg-secondary text-secondary-foreground' : 'text-text-secondary hover:bg-background-subtle'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {category === cat.id && <ChevronRight className="h-3 w-3 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Condition */}
      <div className="rounded-2xl overflow-hidden border border-border/80 bg-card mt-2">
        <button
          onClick={() => toggle('condition')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-extrabold text-text-primary uppercase tracking-wider hover:bg-background-subtle transition-colors"
        >
          <span>Condition</span>
          {expanded.condition ? <ChevronUp className="h-3.5 w-3.5 text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>
        {expanded.condition && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 flex flex-wrap gap-2">
            {['like_new', 'good', 'fair', 'acceptable'].map((cond) => {
              const isChecked = conditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-extrabold transition-all active:scale-95 ${
                    isChecked
                      ? conditionColors[cond]
                      : 'border-border text-text-muted bg-background-subtle hover:border-border'
                  }`}
                >
                  {conditionLabels[cond]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="rounded-2xl overflow-hidden border border-border/80 bg-card mt-2">
        <button
          onClick={() => toggle('price')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-extrabold text-text-primary uppercase tracking-wider hover:bg-background-subtle transition-colors"
        >
          <span>Price Range</span>
          {expanded.price ? <ChevronUp className="h-3.5 w-3.5 text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>
        {expanded.price && (
          <div className="px-3 pb-3 pt-2 border-t border-border/50 space-y-3">
            {/* Quick Ranges */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Under ₹200', min: '0', max: '200' },
                { label: '₹200–₹500', min: '200', max: '500' },
                { label: '₹500–₹1000', min: '500', max: '1000' },
                { label: 'Over ₹1000', min: '1000', max: '5000' },
              ].map((r) => {
                const isActive = minPrice === r.min && maxPrice === r.max;
                return (
                  <button
                    key={r.label}
                    onClick={() => { setMinPrice(r.min); setMaxPrice(r.max); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all active:scale-95 ${
                      isActive ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border text-text-muted bg-background-subtle hover:border-border'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            {/* Custom Range */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">₹</span>
                <input
                  type="number" value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 border border-border rounded-xl text-xs text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  placeholder="Min"
                />
              </div>
              <span className="text-text-muted text-xs font-bold">–</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">₹</span>
                <input
                  type="number" value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-6 pr-2 py-2 border border-border rounded-xl text-xs text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  placeholder="Max"
                />
              </div>
            </div>
            <button
              onClick={() => setPage(1)}
              className="w-full py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-xl text-[11px] uppercase tracking-wider transition-all active:scale-95"
            >
              Apply Price Filter
            </button>
          </div>
        )}
      </div>

      {/* Language */}
      <div className="rounded-2xl overflow-hidden border border-border/80 bg-card mt-2">
        <button
          onClick={() => toggle('language')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-extrabold text-text-primary uppercase tracking-wider hover:bg-background-subtle transition-colors"
        >
          <span>Language</span>
          {expanded.language ? <ChevronUp className="h-3.5 w-3.5 text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>
        {expanded.language && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 flex gap-2">
            {['english', 'hindi'].map((lang) => {
              const isChecked = languages.includes(lang);
              return (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-extrabold capitalize transition-all active:scale-95 ${
                    isChecked ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-text-muted bg-background-subtle'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA / Reset */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleReset}
          className="flex-1 h-10 border border-border rounded-xl text-xs font-extrabold text-text-secondary hover:bg-background-subtle transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear All
        </button>
        {onApply && (
          <button
            onClick={onApply}
            className="flex-1 h-10 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95"
          >
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Catalog Component
// ──────────────────────────────────────────────────────────────────────────────
function BooksCatalog() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const conditionTypeParam = searchParams.get('conditionType');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [conditionType, setConditionType] = useState<'all' | 'new' | 'used'>('all');
  const [conditions, setConditions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('2000');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  React.useEffect(() => {
    if (searchParam !== null) setSearch(searchParam);
    if (conditionTypeParam === 'new' || conditionTypeParam === 'used' || conditionTypeParam === 'all') {
      setConditionType(conditionTypeParam);
    }
    if (categoryParam !== null && categories.length > 0) {
      const matchedCat = categories.find(
        (c) => c.slug === categoryParam || c.id === categoryParam
      );
      if (matchedCat) setCategory(matchedCat.id);
    }
  }, [searchParam, categoryParam, conditionTypeParam, categories]);

  const {
    data: booksData = { books: [], total: 0 },
    isLoading, isError, refetch,
  } = useQuery<{ books: Book[]; total: number }>({
    queryKey: ['books', page, search, category, conditionType, conditions.join(','), minPrice, maxPrice, sortBy, sortOrder],
    queryFn: () =>
      apiClient('/books', {
        params: {
          page: String(page), limit: '18',
          ...(search && { search }),
          ...(category && { category }),
          ...(conditionType !== 'all' && { conditionType }),
          ...(conditions.length > 0 && { condition: conditions.join(',') }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          sortBy, sortOrder,
        },
      }),
  });

  const toggleCondition = (cond: string) => {
    setConditions((prev) => prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]);
    setPage(1);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);
  };

  const handleReset = () => {
    setSearch(''); setCategory(''); setConditions([]); setLanguages([]);
    setMinPrice('0'); setMaxPrice('2000'); setSortBy('createdAt'); setSortOrder('desc'); setPage(1);
  };

  const selectedCategoryName = categories.find((c) => c.id === category)?.name || '';
  const totalPages = Math.ceil(booksData.total / 18);
  const activeFilterCount = (category ? 1 : 0) + conditions.length + (minPrice !== '0' || maxPrice !== '2000' ? 1 : 0) + languages.length;

  const conditionLabels: Record<string, string> = {
    like_new: 'Like New', good: 'Good', fair: 'Fair', acceptable: 'Acceptable',
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow w-full font-sans pb-mobile-nav md:pb-0">

        {/* ── Catalog Hero Header ─────────────────────────────────────────── */}
        <div className="w-full bg-gradient-to-br from-primary via-primary to-card border-b border-border/80 px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 20%, hsl(20 89% 54% / 0.2) 0%, transparent 55%)' }}
          />
          <div className="relative z-10 max-w-4xl space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11px] font-bold text-primary-foreground/50">
              <Link href="/" className="hover:text-primary-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary-foreground/90">Browse All Books</span>
            </nav>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-[11px] font-extrabold uppercase tracking-wider text-secondary">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Student Marketplace</span>
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground tracking-tight">
                {selectedCategoryName ? selectedCategoryName : 'All Books'}
                {!isLoading && (
                  <span className="text-base sm:text-xl font-normal text-primary-foreground/50 ml-3">
                    {booksData.total.toLocaleString()} results
                  </span>
                )}
              </h1>
            </div>

            {/* Premium Search Bar */}
            <div className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/40 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search books, authors, ISBN..."
                  aria-label="Search books"
                  className="w-full h-12 pl-10 pr-4 bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden h-12 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-2xl flex items-center gap-2 text-xs transition-all active:scale-95 relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-secondary text-secondary-foreground border-2 border-background text-[10px] font-black rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Layout ────────────────────────────────────────── */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 flex flex-col lg:flex-row gap-6">

          {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-20 space-y-2">
            <FilterPanel
              categories={categories} category={category} setCategory={setCategory}
              conditionType={conditionType} setConditionType={setConditionType}
              conditions={conditions} toggleCondition={toggleCondition}
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              languages={languages} toggleLanguage={toggleLanguage}
              handleReset={handleReset} setPage={setPage}
            />
          </aside>

          {/* ── Catalog Right Pane ──────────────────────────────────────────── */}
          <div className="flex-grow min-w-0 space-y-5">

            {/* Toolbar: Sort + View Mode */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Active Filter Pills */}
                {selectedCategoryName && (
                  <button
                    onClick={() => setCategory('')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary dark:text-primary rounded-full text-[11px] font-extrabold hover:bg-danger/10 hover:border-danger/20 hover:text-danger transition-all group"
                  >
                    <span>{selectedCategoryName}</span>
                    <X className="h-3 w-3 group-hover:rotate-90 transition-transform" />
                  </button>
                )}
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-success/10 border border-success/20 text-success rounded-full text-[11px] font-extrabold hover:bg-danger/10 hover:border-danger/20 hover:text-danger transition-all group"
                  >
                    <span>{conditionLabels[cond]}</span>
                    <X className="h-3 w-3 group-hover:rotate-90 transition-transform" />
                  </button>
                ))}
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-[11px] font-extrabold text-danger hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>

              {/* Right side: Sort + View Mode */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-[11px] font-bold text-text-muted hidden sm:block">Sort:</label>
                  <select
                    id="sort"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field); setSortOrder(order as 'asc' | 'desc'); setPage(1);
                    }}
                    className="h-9 px-3 pr-7 bg-card border border-border rounded-xl text-xs font-extrabold text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer appearance-none"
                  >
                    <option value="createdAt-desc">Most Popular</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="ratingAvg-desc">Top Rated</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-card p-0.5 gap-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground shadow-xs' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-secondary text-secondary-foreground shadow-xs' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Book Grid / Skeleton / Error / Empty ─────────────────────── */}
            {isLoading ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4'
                : 'space-y-3'
              }>
                {Array.from({ length: 12 }).map((_, idx) => (
                  <BookCardSkeleton key={idx} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16 rounded-3xl border border-border bg-card space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-danger" />
                </div>
                <div>
                  <p className="font-serif text-base font-bold text-text-primary">Failed to load books</p>
                  <p className="text-xs text-text-secondary mt-1">Check your connection and try again.</p>
                </div>
                <Button onClick={() => refetch()} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Try Again
                </Button>
              </div>
            ) : booksData.books.length === 0 ? (
              <EmptyState
                type="search"
                title="No books found"
                description="We couldn't find any books matching your search criteria. Try modifying your search query or filters."
                actionText="Clear All Filters"
                onActionClick={handleReset}
              />
            ) : (
              <>
                <motion.div
                  layout
                  className={viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4'
                    : 'space-y-3'
                  }
                >
                  {booksData.books.map((book, idx) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Trust Signals Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8 p-4 sm:p-6 rounded-3xl border border-border/80 bg-card">
                  {[
                    { icon: Tag, title: '50,000+ Books', desc: 'Verified listings' },
                    { icon: ShieldCheck, title: '100% Secure', desc: 'Escrow protected' },
                    { icon: Truck, title: 'Free Shipping', desc: 'Orders over ₹499' },
                    { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free policy' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-text-primary">{title}</p>
                        <p className="text-[11px] text-text-muted font-medium">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                    <p className="text-xs text-text-muted font-medium">
                      Showing {(page - 1) * 18 + 1}–{Math.min(page * 18, booksData.total)} of {booksData.total.toLocaleString()} results
                    </p>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Mobile Filter Bottom Sheet ──────────────────────────────────── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 380 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border rounded-t-3xl shadow-2xl overflow-y-auto"
              style={{ maxHeight: '88vh', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle + Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/60 px-5 pt-3 pb-4 z-10">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-extrabold text-text-primary flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-secondary" />
                    <span>Filters & Sort</span>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-extrabold">
                        {activeFilterCount} active
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="h-8 w-8 rounded-full bg-background-subtle border border-border flex items-center justify-center text-text-primary hover:bg-card transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              <div className="px-5 py-4">
                <FilterPanel
                  categories={categories} category={category} setCategory={setCategory}
                  conditionType={conditionType} setConditionType={setConditionType}
                  conditions={conditions} toggleCondition={toggleCondition}
                  minPrice={minPrice} setMinPrice={setMinPrice}
                  maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                  languages={languages} toggleLanguage={toggleLanguage}
                  handleReset={handleReset} setPage={setPage}
                  onApply={() => setIsMobileFiltersOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-grow">
            {/* Skeleton Hero */}
            <div className="w-full bg-primary h-48 animate-pulse" />
            <div className="w-full px-4 sm:px-8 lg:px-12 py-6">
              <div className="flex gap-6">
                <div className="hidden lg:block w-64 h-screen bg-card border border-border rounded-2xl animate-pulse shrink-0" />
                <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-card border border-border rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <BooksCatalog />
    </React.Suspense>
  );
}
