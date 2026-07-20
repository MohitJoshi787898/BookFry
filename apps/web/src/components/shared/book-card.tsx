'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export function BookCard({ book, compact = false }: BookCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const displayCondition = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }[book.condition];

  const conditionColors = {
    new: 'bg-success/10 text-success border-success/20',
    like_new: 'bg-brand/10 text-brand border-brand/20',
    good: 'bg-warning/10 text-warning border-warning/20',
    fair: 'bg-accent/10 text-accent border-accent/20',
  }[book.condition];

  const imageUrl = book.images?.[0]?.url || '';

  // Calculate discount percentage if discountPrice exists or price < original
  let discountPercentage = 0;
  if (book.discountPrice && book.discountPrice > book.price) {
    discountPercentage = Math.round(((book.discountPrice - book.price) / book.discountPrice) * 100);
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || book.stock === 0) return;
    setIsAdding(true);
    try {
      await addItem(isAuthenticated, book, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add book to cart', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col h-full rounded-md border border-border bg-surface overflow-hidden transition-all duration-200 hover:scale-[1.015] hover:shadow-md hover:border-border/80">
      {/* 2:3 Cover Image Container */}
      <Link href={`/books/${book.slug}`} className="relative w-full aspect-[2/3] bg-background-subtle overflow-hidden block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x600/16523d/ffffff?text=' + encodeURIComponent(book.title);
          }}
        />

        {/* Quick Add to Cart Button Overlay */}
        {book.stock > 0 && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label={`Add ${book.title} to cart`}
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-brand text-white shadow-md hover:bg-brand-hover active:scale-95 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {added ? <Check className="h-4 w-4 text-white" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        )}
      </Link>

      {/* Content */}
      <div className={`flex flex-col flex-grow ${compact ? 'p-3' : 'p-4'}`}>
        {/* Condition & Discount Row */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${conditionColors}`}
          >
            {displayCondition}
          </span>

          {discountPercentage > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
              {discountPercentage}% off
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-sans text-sm font-semibold text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-0.5">
          <Link href={`/books/${book.slug}`}>{book.title}</Link>
        </h3>

        {/* Author */}
        <p className="text-xs text-text-secondary font-medium line-clamp-1 mb-3">by {book.author}</p>

        {/* Bottom Details Row */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
          {/* Price */}
          <div className="flex items-baseline space-x-1.5 font-sans">
            <span className="text-sm font-bold text-text-primary">${book.price.toFixed(2)}</span>
            {book.discountPrice && book.discountPrice > book.price && (
              <span className="text-xs text-text-muted line-through">
                ${book.discountPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Star Rating — only show if ratingAvg > 0 */}
          {book.ratingAvg > 0 ? (
            <div className="flex items-center space-x-1 text-xs text-text-secondary font-sans font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{book.ratingAvg.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-text-muted font-sans font-medium">New Listing</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkeletonBookCard() {
  return (
    <div className="flex flex-col h-full rounded-md border border-border bg-surface overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-background-subtle" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-12 bg-background-subtle rounded-full" />
          <div className="h-4 w-12 bg-background-subtle rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-background-subtle rounded" />
        <div className="h-3 w-1/2 bg-background-subtle rounded" />
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="h-4 w-14 bg-background-subtle rounded" />
          <div className="h-3 w-8 bg-background-subtle rounded" />
        </div>
      </div>
    </div>
  );
}

export default BookCard;
