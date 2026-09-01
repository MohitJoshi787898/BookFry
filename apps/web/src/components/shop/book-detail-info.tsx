'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import {
  Star,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Share2,
  Info,
} from 'lucide-react';

export interface BookDetailInfoProps {
  book: Book;
}

const CONDITION_DESCRIPTIONS: Record<string, string> = {
  new: 'Brand new copy untouched from the publisher or authorized distributor.',
  like_new: 'Excellent condition with crisp pages, tight binding, and no markings or highlights.',
  good: 'Gently read with minor shelf wear. Pages are clean and legible with intact cover.',
  fair: 'Notable signs of usage with possible textbook highlighting or marginal notes. Fully complete text.',
  acceptable: 'Heavy study wear or creased spine, but all reading content is 100% complete and legible.',
};

export function BookDetailInfo({ book }: BookDetailInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const conditionDesc = book.condition
    ? CONDITION_DESCRIPTIONS[book.condition] || 'Verified textbook condition.'
    : 'Verified textbook.';

  const ratingAvg = book.ratingAvg || 4.5;
  const ratingCount = book.ratingCount || 12;

  return (
    <div className="space-y-6 font-sans">
      {/* Category & Subject Tag */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/books?category=${typeof book.category === 'object' && book.category !== null ? (book.category as { slug?: string }).slug || '' : book.category || ''}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/12 border border-secondary/25 text-secondary text-xs font-black uppercase tracking-wider hover:bg-secondary/20 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          <span>{typeof book.category === 'object' && book.category !== null ? (book.category as { name?: string }).name || 'General' : book.category || 'Textbook'}</span>
        </Link>

        {book.edition && (
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-bold text-muted-foreground">
            {book.edition} Edition
          </span>
        )}
      </div>

      {/* Book Title & Author */}
      <div className="space-y-2">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
          {book.title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          by <span className="font-bold text-foreground">{book.author}</span>
          {book.publisher ? ` • Published by ${book.publisher}` : ''}
        </p>
      </div>

      {/* Ratings & Social Row */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-y border-border/80">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(ratingAvg)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-border fill-transparent'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-sm font-extrabold text-foreground ml-1">
            {ratingAvg.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground font-semibold">
            ({ratingCount} student reviews)
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && navigator.share) {
                navigator.share({ title: book.title, url: window.location.href }).catch(() => {});
              } else if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 transition-colors cursor-pointer"
            title="Share Book"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quality & Condition Explainer Banner */}
      {book.condition && (
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-start gap-3">
          <Info className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Condition: <span className="text-secondary capitalize">{book.condition.replace('_', ' ')}</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {conditionDesc}
            </p>
          </div>
        </div>
      )}

      {/* Description Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          About this Book
        </h3>
        <p className={`text-sm text-muted-foreground leading-relaxed font-normal ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
          {book.description || 'Comprehensive textbook syllabus resource tailored for academic excellence, reference study, and competitive exam preparation.'}
        </p>
        {book.description && book.description.length > 250 && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-xs font-extrabold text-secondary hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>{isDescriptionExpanded ? 'Show Less' : 'Read Full Description'}</span>
            {isDescriptionExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Book Specifications Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          Book Specifications
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {book.isbn && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                ISBN / Barcode
              </span>
              <span className="font-mono text-xs font-bold text-foreground truncate block">
                {book.isbn}
              </span>
            </div>
          )}

          {book.language && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Language
              </span>
              <span className="text-xs font-bold text-foreground capitalize block">
                {book.language}
              </span>
            </div>
          )}

          {book.edition && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Edition
              </span>
              <span className="text-xs font-bold text-foreground block">
                {book.edition}
              </span>
            </div>
          )}

          {book.publisher && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Publisher
              </span>
              <span className="text-xs font-bold text-foreground truncate block">
                {book.publisher}
              </span>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Format
            </span>
            <span className="text-xs font-bold text-foreground block">
              Paperback / Hardcover
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Escrow Protection
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
              100% Guaranteed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailInfo;
