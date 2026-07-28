'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BookCard } from '@/components/shared/book-card';
import { TrustBarItem } from '@/components/shared/trust-bar-item';
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
  Star
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BooksCatalog() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['english']);
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('2000');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Mobile filters drawer open state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Expanded/Collapsed sections state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    category: false,
    condition: false,
    price: false,
    language: false,
    publisher: true,
    author: true,
    ratings: true,
    availability: true,
    discount: true,
    binding: true,
    year: true,
  });

  const toggleSection = (sec: string) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  // Sync URL params
  React.useEffect(() => {
    if (searchParam !== null) {
      setSearch(searchParam);
    }
    if (categoryParam !== null && categories.length > 0) {
      const matchedCat = categories.find(
        (c) => c.slug === categoryParam || c.id === categoryParam
      );
      if (matchedCat) {
        setCategory(matchedCat.id);
      }
    }
  }, [searchParam, categoryParam, categories]);

  const {
    data: booksData = { books: [], total: 0 },
    isLoading,
    isError,
    refetch,
  } = useQuery<{ books: Book[]; total: number }>({
    queryKey: [
      'books',
      page,
      search,
      category,
      conditions.join(','),
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      apiClient('/books', {
        params: {
          page: String(page),
          limit: '18',
          ...(search && { search }),
          ...(category && { category }),
          ...(conditions.length > 0 && { condition: conditions.join(',') }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          sortBy,
          sortOrder,
        },
      }),
  });

  const toggleCondition = (cond: string) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
    setPage(1);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setConditions([]);
    setLanguages(['english']);
    setMinPrice('0');
    setMaxPrice('2000');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const selectedCategoryName = categories.find((c) => c.id === category)?.name || '';
  const totalPages = Math.ceil(booksData.total / 18);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow w-full px-4 sm:px-8 lg:px-10 py-8 font-sans">
        
        {/* 1. Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-text-secondary mb-6 select-none">
          <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
          <span className="text-text-muted">&gt;</span>
          <span className="text-text-primary font-semibold">Books</span>
        </div>

        {/* Mobile Filter & Sort Button (Hidden on Desktop) */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="w-full py-3 px-4 border border-border bg-card hover:bg-background-subtle rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text-primary shadow-2xs transition-all active:scale-[0.98]"
          >
            <SlidersHorizontal className="h-4 w-4 text-secondary" />
            <span>Filter & Sort Options</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 2. Left Sticky Filter Sidebar Card (Hidden on Mobile, Persistent on Desktop) */}
          <aside className="hidden lg:block lg:w-64 shrink-0 border border-border rounded-2xl bg-card p-5 space-y-5 h-fit lg:sticky lg:top-20 transition-all shadow-xs dark:shadow-none">
            
            {/* Sidebar Title Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="flex items-center space-x-1.5 font-bold text-xs uppercase tracking-wider text-text-primary">
                <SlidersHorizontal className="h-4 w-4 text-secondary" />
                <span>Filters</span>
              </h2>
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-secondary hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            </div>

            {/* Categories Accordion */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider text-left"
              >
                <span>Category</span>
                {collapsed.category ? <ChevronDown className="h-3.5 w-3.5 text-text-muted" /> : <ChevronUp className="h-3.5 w-3.5 text-text-muted" />}
              </button>
              {!collapsed.category && (
                <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer hover:text-text-primary py-0.5">
                    <input
                      type="radio"
                      name="sidebar-category"
                      checked={category === ''}
                      onChange={() => {
                        setCategory('');
                        setPage(1);
                      }}
                      className="accent-[#F26522]"
                    />
                    <span className={category === '' ? 'text-secondary font-bold' : ''}>All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center space-x-2.5 cursor-pointer hover:text-text-primary py-0.5">
                      <input
                        type="radio"
                        name="sidebar-category"
                        checked={category === cat.id}
                        onChange={() => {
                          setCategory(cat.id);
                          setPage(1);
                        }}
                        className="accent-secondary"
                      />
                      <span className={`truncate ${category === cat.id ? 'text-secondary font-bold' : ''}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Condition Accordion */}
            <div className="border-t border-border pt-4 space-y-2">
              <button
                onClick={() => toggleSection('condition')}
                className="w-full flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider text-left"
              >
                <span>Condition</span>
                {collapsed.condition ? <ChevronDown className="h-3.5 w-3.5 text-text-muted" /> : <ChevronUp className="h-3.5 w-3.5 text-text-muted" />}
              </button>
              {!collapsed.condition && (
                <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                  {['like_new', 'good', 'fair', 'acceptable'].map((cond) => {
                    const label = {
                      like_new: 'Like New',
                      good: 'Good',
                      fair: 'Fair',
                      acceptable: 'Acceptable'
                    }[cond] || 'Good';
                    const isChecked = conditions.includes(cond);
                    return (
                      <label key={cond} className="flex items-center space-x-2.5 cursor-pointer hover:text-text-primary py-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCondition(cond)}
                          className="rounded border-border text-brand focus:ring-brand accent-secondary"
                        />
                        <span className={isChecked ? 'text-secondary font-bold' : ''}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Accordion */}
            <div className="border-t border-border pt-4 space-y-2">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider text-left"
              >
                <span>Price Range</span>
                {collapsed.price ? <ChevronDown className="h-3.5 w-3.5 text-text-muted" /> : <ChevronUp className="h-3.5 w-3.5 text-text-muted" />}
              </button>
              {!collapsed.price && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-5 pr-2 py-1.5 border border-border rounded text-text-primary bg-background focus:outline-none focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>
                    <span className="text-text-muted">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-5 pr-2 py-1.5 border border-border rounded text-text-primary bg-background focus:outline-none focus:ring-1 focus:ring-secondary font-medium"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setPage(1)}
                    className="w-full py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>

            {/* Language Accordion */}
            <div className="border-t border-border pt-4 space-y-2">
              <button
                onClick={() => toggleSection('language')}
                className="w-full flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider text-left"
              >
                <span>Language</span>
                {collapsed.language ? <ChevronDown className="h-3.5 w-3.5 text-text-muted" /> : <ChevronUp className="h-3.5 w-3.5 text-text-muted" />}
              </button>
              {!collapsed.language && (
                <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                  {['english', 'hindi'].map((lang) => {
                    const label = { english: 'English', hindi: 'Hindi' }[lang] || 'English';
                    const isChecked = languages.includes(lang);
                    return (
                      <label key={lang} className="flex items-center space-x-2.5 cursor-pointer hover:text-text-primary py-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLanguage(lang)}
                          className="rounded border-border text-brand focus:ring-brand accent-[#F26522]"
                        />
                        <span className={isChecked ? 'text-secondary font-bold' : ''}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional collapsibles (Publisher, Author, Ratings, Availability, Discount, Binding, Year) */}
            <div className="border-t border-border pt-2 space-y-2">
              {/* Publisher */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('publisher')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Publisher</span>
                  {collapsed.publisher ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.publisher && (
                  <div className="space-y-1 text-[11px] text-text-secondary pl-1 pt-1 font-medium">
                    {['Pearson', 'McGraw Hill', 'O\'Reilly', 'Oxford'].map((pub) => (
                      <label key={pub} className="flex items-center space-x-2 py-0.5 cursor-pointer">
                        <input type="checkbox" className="rounded border-border text-brand focus:ring-brand accent-[#F26522]" />
                        <span>{pub}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('author')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Author</span>
                  {collapsed.author ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.author && (
                  <div className="space-y-1 text-[11px] text-text-secondary pl-1 pt-1 font-medium">
                    {['J.K. Rowling', 'George Orwell', 'Munshi Premchand'].map((auth) => (
                      <label key={auth} className="flex items-center space-x-2 py-0.5 cursor-pointer">
                        <input type="checkbox" className="rounded border-border text-brand focus:ring-brand accent-[#F26522]" />
                        <span>{auth}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratings */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('ratings')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Ratings</span>
                  {collapsed.ratings ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.ratings && (
                  <div className="space-y-1.5 pl-1 pt-1.5">
                    {[4, 3, 2].map((stars) => (
                      <button key={stars} className="flex items-center space-x-1.5 text-[11px] text-text-secondary hover:text-secondary font-bold">
                        <span className="flex text-amber-400">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </span>
                        <span>& Up</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Availability</span>
                  {collapsed.availability ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.availability && (
                  <div className="space-y-1 text-[11px] text-text-secondary pl-1 pt-1 font-medium">
                    <label className="flex items-center space-x-2 py-0.5 cursor-pointer">
                      <input type="checkbox" className="rounded border-border text-brand focus:ring-brand accent-[#F26522]" />
                      <span>Include Out of Stock</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('discount')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Discount</span>
                  {collapsed.discount ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.discount && (
                  <div className="space-y-1 text-[11px] text-text-secondary pl-1 pt-1 font-medium">
                    {['10% or more', '30% or more', '50% or more'].map((disc) => (
                      <label key={disc} className="flex items-center space-x-2 py-0.5 cursor-pointer">
                        <input type="radio" name="discount-filter" className="accent-[#F26522]" />
                        <span>{disc}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Binding */}
              <div className="border-b border-border/40 py-1">
                <button
                  onClick={() => toggleSection('binding')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Binding</span>
                  {collapsed.binding ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.binding && (
                  <div className="space-y-1 text-[11px] text-text-secondary pl-1 pt-1 font-medium">
                    {['Paperback', 'Hardcover', 'Spiral Bound'].map((bind) => (
                      <label key={bind} className="flex items-center space-x-2 py-0.5 cursor-pointer">
                        <input type="checkbox" className="rounded border-border text-brand focus:ring-brand accent-[#F26522]" />
                        <span>{bind}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Publication Year */}
              <div className="py-1">
                <button
                  onClick={() => toggleSection('year')}
                  className="w-full flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary py-1"
                >
                  <span>Publication Year</span>
                  {collapsed.year ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
                {!collapsed.year && (
                  <div className="space-y-2 pl-1 pt-1.5 text-[11px] text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <input type="number" placeholder="Min" className="w-full px-2 py-1 border border-border rounded text-text-primary bg-background focus:outline-none" />
                      <span>to</span>
                      <input type="number" placeholder="Max" className="w-full px-2 py-1 border border-border rounded text-text-primary bg-background focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* 3. Right Product Catalog Grid Area */}
          <div className="flex-grow space-y-6">
            
            {/* Header copy */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-baseline justify-between border-b border-border pb-3.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary flex items-baseline gap-2">
                <span>All Books</span>
                <span className="text-xs font-normal text-text-secondary">({booksData.total.toLocaleString()} results)</span>
              </h1>
              
              {/* Sort selector & Grid tools */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-xs text-text-secondary">
                  <span>Sort by:</span>
                  <select
                    id="sort"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                      setPage(1);
                    }}
                    className="border-none font-bold text-text-primary bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="createdAt-desc">Popularity</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="ratingAvg-desc">Top Rated</option>
                  </select>
                </div>
                
                {/* Layout Grid Buttons */}
                <div className="flex items-center space-x-1 border border-border rounded p-0.5 bg-muted">
                  <button className="p-1 rounded bg-white text-secondary shadow-xs"><LayoutGrid className="h-3.5 w-3.5" /></button>
                  <button className="p-1 rounded text-text-muted hover:text-text-primary"><List className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            <div className="flex flex-wrap gap-2 items-center text-xs">
              {selectedCategoryName && (
                <span className="px-2.5 py-1 bg-background-subtle border border-border rounded-full flex items-center gap-1.5 text-text-secondary font-medium shadow-2xs">
                  <span>{selectedCategoryName}</span>
                  <X className="h-3.5 w-3.5 text-[#F26522] hover:text-[#e05310] cursor-pointer" onClick={() => setCategory('')} />
                </span>
              )}
              {conditions.map((cond) => {
                const label = { like_new: 'Like New', good: 'Good', fair: 'Fair', acceptable: 'Acceptable' }[cond] || 'Good';
                return (
                  <span key={cond} className="px-2.5 py-1 bg-background-subtle border border-border rounded-full flex items-center gap-1.5 text-text-secondary font-medium shadow-2xs">
                    <span>{label}</span>
                    <X className="h-3.5 w-3.5 text-[#F26522] hover:text-[#e05310] cursor-pointer" onClick={() => toggleCondition(cond)} />
                  </span>
                );
              })}
              {languages.map((lang) => (
                <span key={lang} className="px-2.5 py-1 bg-background-subtle border border-border rounded-full flex items-center gap-1.5 text-text-secondary font-medium capitalize shadow-2xs">
                  <span>{lang}</span>
                  <X className="h-3.5 w-3.5 text-[#F26522] hover:text-[#e05310] cursor-pointer" onClick={() => toggleLanguage(lang)} />
                </span>
              ))}
              {(conditions.length > 0 || category !== '' || languages.length > 0) && (
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-secondary hover:underline px-2"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Catalog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <BookCardSkeleton key={idx} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 border border-border rounded-xl bg-card">
                <p className="text-danger font-medium">
                  Failed to load books. Please check your connection and try again.
                </p>
                <Button
                  onClick={() => refetch()}
                  className="mt-4"
                  size="sm"
                >
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
                {/* 6-Column Book Grid on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {booksData.books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                {/* 4-Up Bottom Value Trust Cards Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b border-border/60 bg-background-subtle rounded-2xl px-6 my-10 transition-colors">
                  <TrustBarItem icon={Tag} title="50,000+ Books" description="Listed & verified" />
                  <TrustBarItem icon={ShieldCheck} title="100% Secure" description="Secure payments checkout" />
                  <TrustBarItem icon={Truck} title="Free Shipping" description="On orders over ₹499" />
                  <TrustBarItem icon={RotateCcw} title="Easy Returns" description="Hassle-free returns support" />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 mt-8 font-sans">
                    <p className="text-xs text-text-secondary font-medium">
                      Showing {(page - 1) * 18 + 1} - {Math.min(page * 18, booksData.total)} of {booksData.total} results
                    </p>
                    
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Slide-Up Drawer (Bottom Sheet) */}
      {isMobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 lg:hidden flex items-end justify-center"
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] bg-card border-t border-border rounded-t-2xl z-50 p-6 overflow-y-auto space-y-6 animate-slide-up shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-secondary" />
                <span>Filters & Sort</span>
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    handleReset();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-full hover:bg-background-subtle text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Category list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Category</h4>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <label className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                  <input
                    type="radio"
                    name="mobile-category"
                    checked={category === ''}
                    onChange={() => {
                      setCategory('');
                      setPage(1);
                    }}
                    className="accent-[#F26522]"
                  />
                  <span className={category === '' ? 'text-secondary font-bold' : ''}>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                    <input
                      type="radio"
                      name="mobile-category"
                      checked={category === cat.id}
                      onChange={() => {
                        setCategory(cat.id);
                        setPage(1);
                      }}
                      className="accent-[#F26522]"
                    />
                    <span className={`truncate ${category === cat.id ? 'text-secondary font-bold' : ''}`}>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition List */}
            <div className="border-t border-border pt-4 space-y-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Condition</h4>
              <div className="space-y-1.5 text-xs text-text-secondary">
                {['like_new', 'good', 'fair', 'acceptable'].map((cond) => {
                  const label = {
                    like_new: 'Like New',
                    good: 'Good',
                    fair: 'Fair',
                    acceptable: 'Acceptable'
                  }[cond] || 'Good';
                  const isChecked = conditions.includes(cond);
                  return (
                    <label key={cond} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCondition(cond)}
                        className="rounded border-border text-brand focus:ring-brand accent-[#F26522]"
                      />
                      <span className={isChecked ? 'text-secondary font-bold' : ''}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price list */}
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Price Range</h4>
              <div className="flex items-center space-x-2 text-xs">
                <div className="relative flex-grow">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-5 pr-2 py-2 border border-border rounded-lg text-text-primary bg-background focus:outline-none"
                  />
                </div>
                <span className="text-text-muted">to</span>
                <div className="relative flex-grow">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-5 pr-2 py-2 border border-border rounded-lg text-text-primary bg-background focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Language list */}
            <div className="border-t border-border pt-4 space-y-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Language</h4>
              <div className="space-y-1.5 text-xs text-text-secondary">
                {['english', 'hindi'].map((lang) => {
                  const label = { english: 'English', hindi: 'Hindi' }[lang] || 'English';
                  const isChecked = languages.includes(lang);
                  return (
                    <label key={lang} className="flex items-center space-x-2.5 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLanguage(lang)}
                        className="rounded border-border text-brand focus:ring-brand accent-[#F26522]"
                      />
                      <span className={isChecked ? 'text-secondary font-bold' : ''}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Expandables */}
            <div className="border-t border-border pt-4 space-y-2 text-xs font-bold text-text-muted">
              <div>
                <span>Publisher</span>
                <span className="float-right text-[10px] text-text-secondary">Pearson, McGraw, O&apos;Reilly</span>
              </div>
              <div className="pt-2">
                <span>Author</span>
                <span className="float-right text-[10px] text-text-secondary">Rowling, Orwell, Premchand</span>
              </div>
            </div>

            {/* Bottom sticky CTA */}
            <div className="pt-4 border-t border-border sticky bottom-0 bg-card py-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#F26522] hover:bg-[#e05310] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center font-sans">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
            <p className="text-xs text-text-secondary">Loading catalog books...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <BooksCatalog />
    </React.Suspense>
  );
}
