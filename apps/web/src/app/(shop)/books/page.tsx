'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { BookCard } from '@/components/shared/book-card';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { Pagination } from '@/components/ui/navigation';
import { BookCardSkeleton } from '@/components/ui/loader';
import { apiClient } from '@/lib/api-client';
import { Book, Category } from '@bookmarket/types';
import { useLocationStore } from '@/stores/location.store';

import { BooksCatalogHero } from '@/components/shop/books-catalog-hero';
import { BooksFilterSidebar } from '@/components/shop/books-filter-sidebar';
import { BooksMobileFilterDrawer } from '@/components/shop/books-mobile-filter-drawer';
import { BooksViewControls } from '@/components/shop/books-view-controls';
import { BooksListItem } from '@/components/shop/books-list-item';

function BooksCatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const conditionTypeParam = searchParams.get('conditionType');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [conditionType, setConditionType] = useState<'all' | 'new' | 'used'>('all');
  const [conditions, setConditions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  useEffect(() => {
    if (searchParam !== null) setSearch(searchParam);
    if (conditionTypeParam === 'new' || conditionTypeParam === 'used' || conditionTypeParam === 'all') {
      setConditionType(conditionTypeParam);
    }
    if (categoryParam !== null && categories.length > 0) {
      const matchedCat = categories.find((c) => c.slug === categoryParam || c.id === categoryParam);
      if (matchedCat) setCategory(matchedCat.id);
    }
  }, [searchParam, categoryParam, conditionTypeParam, categories]);

  const { selectedCity, selectedPincode, selectedCampus, coords } = useLocationStore();

  const [sortBy, sortOrder] = sort.split(':') as [string, 'asc' | 'desc'];

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
      conditionType,
      conditions.join(','),
      minPrice,
      maxPrice,
      selectedCity,
      selectedPincode,
      selectedCampus,
      coords?.lat,
      coords?.lng,
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
          ...(conditionType !== 'all' && { conditionType }),
          ...(conditions.length > 0 && { condition: conditions.join(',') }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(selectedCity && { city: selectedCity }),
          ...(selectedPincode && { pincode: selectedPincode }),
          ...(selectedCampus && { campusName: selectedCampus }),
          ...(coords && { lat: String(coords.lat), lng: String(coords.lng), maxDistanceKm: '50' }),
          sortBy,
          sortOrder,
        },
      }),
  });

  const toggleCondition = (cond: string) => {
    setConditions((prev) => (prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]));
    setPage(1);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
    setPage(1);
  };

  const handleReset = () => {
    setCategory('');
    setConditionType('all');
    setConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setLanguages([]);
    setPage(1);
  };

  const selectedCategoryObj = categories.find((c) => c.id === category || c.slug === category);
  const totalPages = Math.ceil((booksData.total || 0) / 18);

  return (
    <>
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 space-y-6">
      {/* Catalog Hero Banner */}
        <BooksCatalogHero
          searchQuery={search}
          categoryName={selectedCategoryObj?.name}
          totalBooks={booksData.total || 0}
          conditionType={conditionType}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <BooksFilterSidebar
              categories={categories}
              category={category}
              setCategory={setCategory}
              conditionType={conditionType}
              setConditionType={setConditionType}
              conditions={conditions}
              toggleCondition={toggleCondition}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              languages={languages}
              toggleLanguage={toggleLanguage}
              handleReset={handleReset}
              setPage={setPage}
            />
          </div>

          {/* Catalog Listing Area */}
          <div className="lg:col-span-4 xl:col-span-5 space-y-6">
            <BooksViewControls
              totalBooks={booksData.total || 0}
              sort={sort}
              setSort={setSort}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
              categoryName={selectedCategoryObj?.name}
              conditionType={conditionType}
              conditions={conditions}
              minPrice={minPrice}
              maxPrice={maxPrice}
              languages={languages}
              onRemoveCategory={() => setCategory('')}
              onRemoveConditionType={() => setConditionType('all')}
              onRemoveCondition={(c) => toggleCondition(c)}
              onRemovePrice={() => {
                setMinPrice('');
                setMaxPrice('');
              }}
              onRemoveLanguage={(l) => toggleLanguage(l)}
              onClearAll={handleReset}
            />

            {/* Content States */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <RoleEmptyState
                title="Failed to Load Catalog"
                description="Unable to reach book inventory. Please retry."
                mascotVariant="pointing"
                action={{ label: 'Retry Fetch', onClick: () => refetch() }}
              />
            ) : booksData.books.length === 0 ? (
              <RoleEmptyState
                title="No Books Matched Your Filters"
                description="Try clearing search filters, price limits, or browsing our full textbook directory."
                mascotVariant="searching"
                action={{ label: 'Reset All Filters', onClick: handleReset }}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {booksData.books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {booksData.books.map((book) => (
                  <BooksListItem key={book.id} book={book} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8 border-t border-border/80">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Drawer */}
      <BooksMobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={categories}
        category={category}
        setCategory={setCategory}
        conditionType={conditionType}
        setConditionType={setConditionType}
        conditions={conditions}
        toggleCondition={toggleCondition}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        languages={languages}
        toggleLanguage={toggleLanguage}
        handleReset={handleReset}
        setPage={setPage}
        totalResults={booksData.total}
      />
    </>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 animate-pulse space-y-6">
          <div className="h-48 rounded-3xl bg-card border border-border" />
        </div>
      }
    >
      <BooksCatalogContent />
    </Suspense>
  );
}
