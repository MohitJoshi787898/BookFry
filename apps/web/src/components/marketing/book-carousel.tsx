'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import { BookCard, SkeletonBookCard } from '@/components/shared/book-card';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface BookCarouselProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  href?: string;
  queryParam?: string;
  endpoint?: string;
  customBooks?: Book[];
  filterFn?: (data: Record<string, unknown> | Book[]) => Book[];
  tintBackground?: boolean;
}

export function BookCarousel({
  title,
  eyebrow,
  subtitle,
  href = '/books',
  queryParam = '',
  endpoint,
  customBooks,
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
    queryKey: ['carousel-books', title, queryParam, endpoint],
    queryFn: async () => {
      if (customBooks) return customBooks;
      const targetEndpoint = endpoint || (queryParam ? `/books?${queryParam}` : '/books?limit=12');
      const res = await apiClient<Record<string, unknown>>(targetEndpoint);
      if (Array.isArray(res)) return res as unknown as Book[];
      return (res.books || res.popular || res.trending || res.personalized || []) as unknown as Book[];
    },
    enabled: !customBooks,
    staleTime: 5 * 60 * 1000,
  });

  const books = customBooks || (filterFn ? filterFn(fetchedBooks) : fetchedBooks);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // If loaded and no books match, hide section entirely per spec
  if (!isLoading && !isError && books.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className={`py-10 sm:py-14 lg:py-16 relative group/carousel transition-colors duration-200 overflow-hidden ${
        tintBackground
          ? 'bg-gradient-to-r from-secondary/5 via-card to-primary/5 border-y border-border'
          : 'bg-background border-b border-border/60'
      }`}
    >
      {/* Background ambient lighting for large screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/5 blur-3xl opacity-60"
      />

      {/* FULL WIDTH FLUID CONTAINER FOR BIG SCREENS & EDGE-TO-EDGE MOBILE */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all">
        
        {/* Premium Section Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3 border-b border-border/50 pb-4">
          <div className="space-y-1 max-w-3xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest font-sans mb-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>{eyebrow}</span>
              </span>
            )}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary dark:text-foreground tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-text-secondary font-sans font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pt-1 sm:pt-0 font-sans">
            {/* Desktop Quick Navigation Controls */}
            <div className="hidden sm:flex items-center space-x-2 mr-2">
              <button
                onClick={scrollLeft}
                aria-label={`Scroll ${title} left`}
                className="h-10 w-10 rounded-full bg-card border border-border text-text-primary shadow-xs hover:shadow-md hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all flex items-center justify-center active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollRight}
                aria-label={`Scroll ${title} right`}
                className="h-10 w-10 rounded-full bg-card border border-border text-text-primary shadow-xs hover:shadow-md hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all flex items-center justify-center active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* See All View Link */}
            <Link
              href={href}
              className="px-4 py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-secondary-foreground border border-secondary/20 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1.5 active:scale-95 shadow-2xs"
            >
              <span>See All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container - Native Mobile Swipe & Full Width Desktop Grid */}
        <div className="relative">
          
          {/* Snap Scroll Grid Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-3 sm:space-x-5 lg:space-x-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {isLoading ? (
              // Skeleton cards while fetching
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-[170px] sm:w-[220px] md:w-[240px] lg:w-[230px] xl:w-[250px] shrink-0 snap-start"
                >
                  <SkeletonBookCard />
                </div>
              ))
            ) : (
              books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="w-[170px] sm:w-[220px] md:w-[240px] lg:w-[230px] xl:w-[250px] shrink-0 snap-start"
                >
                  <BookCard book={book} />
                </motion.div>
              ))
            )}
          </div>

          {/* Desktop Edge Overlay Gradients for Infinite Carousel Effect */}
          <div className="hidden lg:block pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="hidden lg:block pointer-events-none absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        </div>

      </div>
    </section>
  );
}

export default BookCarousel;
