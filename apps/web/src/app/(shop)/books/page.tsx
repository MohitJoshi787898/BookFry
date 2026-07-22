'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { BookCard, SkeletonBookCard } from '@/components/shared/book-card';
import { apiClient } from '@/lib/api-client';
import { Book, Category } from '@bookmarket/types';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

function BooksCatalog() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const discountParam = searchParams.get('discount');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  // Sync URL search parameters dynamically on load or search change
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
    if (discountParam !== null) {
      // If today's deals discount is requested, preset maxPrice or sorting appropriately
      setMinPrice('');
      setMaxPrice('');
    }
  }, [searchParam, categoryParam, discountParam, categories]);

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
          limit: '12',
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

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const totalPages = Math.ceil(booksData.total / 12);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Filter Section */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="flex items-center space-x-2 font-semibold text-text-primary">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </h2>
              <button
                onClick={handleReset}
                className="text-xs text-text-muted hover:text-brand flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCategory('');
                    setPage(1);
                  }}
                  className={`block text-sm text-left w-full rounded px-2 py-1 ${
                    category === ''
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setPage(1);
                    }}
                    className={`block text-sm text-left w-full rounded px-2 py-1 truncate ${
                      category === cat.id
                        ? 'bg-brand/10 text-brand font-medium'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Condition</h3>
              <div className="space-y-2">
                {['new', 'like_new', 'good', 'fair'].map((cond) => {
                  const label = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair' }[
                    cond
                  ];
                  return (
                    <label
                      key={cond}
                      className="flex items-center space-x-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary"
                    >
                      <input
                        type="checkbox"
                        checked={conditions.includes(cond)}
                        onChange={() => toggleCondition(cond)}
                        className="rounded border-border text-brand focus:ring-brand"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded border border-border px-3 py-1 text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                />
                <span className="text-text-muted">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded border border-border px-3 py-1 text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>
            </div>
          </aside>

          {/* Right Product Grid Section */}
          <div className="flex-grow space-y-6">
            {/* Search and Sorting controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by title, author, isbn..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>

              {/* Sorting dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <label htmlFor="sort" className="text-sm text-text-secondary">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                    setPage(1);
                  }}
                  className="border border-border rounded px-3 py-1.5 text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="createdAt-desc">Newest Listings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="ratingAvg-desc">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonBookCard key={idx} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 border border-border rounded-md bg-surface">
                <p className="text-danger font-medium">
                  Failed to load books. Please check your connection and try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : booksData.books.length === 0 ? (
              <div className="text-center py-16 border border-border rounded-md bg-surface">
                <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                  No books found
                </h3>
                <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
                  We couldn&apos;t find any books matching your search criteria. Try modifying your
                  search query or filters.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {booksData.books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1 rounded border border-border hover:bg-background-subtle disabled:opacity-40 text-sm font-medium focus:outline-none"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-text-secondary">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1 rounded border border-border hover:bg-background-subtle disabled:opacity-40 text-sm font-medium focus:outline-none"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background text-text-primary">
        <Navbar />
        <main className="flex-grow flex items-center justify-center font-sans">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
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
