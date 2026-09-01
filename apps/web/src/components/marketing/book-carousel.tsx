'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import { BookCard, SkeletonBookCard } from '@/components/shared/book-card';
import { ChevronLeft, ChevronRight, ArrowRight, Flame } from 'lucide-react';

interface BookCarouselProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  href?: string;
  queryParam?: string;
  endpoint?: string;
  customBooks?: Book[];
  initialBooks?: Book[];
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
  initialBooks,
  filterFn,
  tintBackground = false,
}: BookCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const effectiveInitialData = customBooks || initialBooks;

  const {
    data: fetchedBooks = effectiveInitialData || [],
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
    initialData: effectiveInitialData,
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

  if (!isLoading && !isError && books.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className={`py-12 sm:py-16 lg:py-20 relative group/carousel transition-colors duration-200 overflow-hidden ${
        tintBackground
          ? 'bg-muted/40 border-y border-border'
          : 'bg-background border-b border-border'
      }`}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-80 h-80 rounded-full bg-primary/5 blur-2xl"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-border pb-5">
          <div className="space-y-1.5 max-w-2xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] sm:text-xs font-black uppercase tracking-widest font-sans mb-1 shadow-xs">
                <Flame className="h-3.5 w-3.5 fill-secondary" />
                <span>{eyebrow}</span>
              </span>
            )}
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground font-sans font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pt-1 sm:pt-0 font-sans">
            {/* Desktop Navigation Controls */}
            <div className="hidden sm:flex items-center space-x-2 mr-2">
              <button
                onClick={scrollLeft}
                aria-label={`Scroll ${title} left`}
                className="h-10 w-10 rounded-full bg-card border border-border text-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollRight}
                aria-label={`Scroll ${title} right`}
                className="h-10 w-10 rounded-full bg-card border border-border text-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* See All Button */}
            <Link
              href={href}
              className="px-4 py-2 bg-secondary/15 hover:bg-secondary text-secondary hover:text-secondary-foreground border border-secondary/30 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
            >
              <span>See All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 sm:space-x-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-[250px] shrink-0 snap-start"
                >
                  <SkeletonBookCard />
                </div>
              ))
            ) : (
              books.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-[250px] shrink-0 snap-start"
                >
                  <BookCard book={book} />
                </motion.div>
              ))
            )}
          </div>

          {/* Subtle Edge Overlays */}
          <div className="hidden lg:block pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="hidden lg:block pointer-events-none absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        </div>

      </div>
    </section>
  );
}

export default BookCarousel;
