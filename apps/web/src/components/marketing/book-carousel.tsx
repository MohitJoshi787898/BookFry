'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import { BookCard, SkeletonBookCard } from '@/components/shared/book-card';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface BookCarouselProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  href?: string;
  queryParam?: string;
  filterFn?: (books: Book[]) => Book[];
  tintBackground?: boolean;
}

export function BookCarousel({
  title,
  eyebrow,
  subtitle,
  href = '/books',
  queryParam = '',
  filterFn,
  tintBackground = false,
}: BookCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Independent TanStack Query server data fetch
  const {
    data: fetchedBooks = [],
    isLoading,
    isError,
  } = useQuery<Book[]>({
    queryKey: ['carousel-books', title, queryParam],
    queryFn: async () => {
      const endpoint = queryParam ? `/books?${queryParam}` : '/books?limit=12';
      const res = await apiClient<{ books: Book[] }>(endpoint);
      return res.books || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const books = filterFn ? filterFn(fetchedBooks) : fetchedBooks;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // If loaded and no books match, hide section entirely per spec
  if (!isLoading && !isError && books.length === 0) {
    return null;
  }

  return (
    <section
      className={`py-12 relative group/carousel transition-colors ${
        tintBackground ? 'bg-brand/5 border-y border-brand/10' : 'bg-background'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
          <div>
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1 font-sans">
                {eyebrow}
              </span>
            )}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-text-secondary font-sans mt-1">{subtitle}</p>
            )}
          </div>

          <Link
            href={href}
            className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center space-x-1 font-sans shrink-0 hover:underline pt-2 sm:pt-0"
          >
            <span>See All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop Left Navigation Arrow */}
          <button
            onClick={scrollLeft}
            aria-label={`Scroll ${title} left`}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-primary shadow-md opacity-0 group-hover/carousel:opacity-100 hover:bg-background-subtle transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Snap Scroll Grid Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 sm:space-x-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-1 px-0.5"
          >
            {isLoading ? (
              // Skeleton cards while fetching
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] shrink-0 snap-start"
                >
                  <SkeletonBookCard />
                </div>
              ))
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  className="w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] shrink-0 snap-start"
                >
                  <BookCard book={book} />
                </div>
              ))
            )}
          </div>

          {/* Desktop Right Navigation Arrow */}
          <button
            onClick={scrollRight}
            aria-label={`Scroll ${title} right`}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-primary shadow-md opacity-0 group-hover/carousel:opacity-100 hover:bg-background-subtle transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookCarousel;
