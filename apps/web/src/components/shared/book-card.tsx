'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import { Star, ShoppingBag, Check, CheckCircle2, Heart } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const displayCondition = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    acceptable: 'Acceptable',
  }[book.condition] || 'Good';

  const conditionColors = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    like_new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    fair: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    acceptable: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  }[book.condition] || 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';

  const imageUrl = book.images?.[0]?.url || '';

  // Calculate discount percentage
  let discountPercentage = 0;
  const originalPrice = book.discountPrice || Math.round(book.price * 2);
  if (originalPrice > book.price) {
    discountPercentage = Math.round(((originalPrice - book.price) / originalPrice) * 100);
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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-secondary/60">
      
      {/* 2:3 Cover Image Container */}
      <Link href={`/books/${book.slug}`} className="relative w-full aspect-[2/3] bg-background-subtle overflow-hidden block border-b border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x600/163A63/ffffff?text=' + encodeURIComponent(book.title);
          }}
        />

        {/* Bestseller overlay tag */}
        <span className="absolute top-2.5 left-2.5 bg-[#E11D48] text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-xs select-none">
          Bestseller
        </span>

        {/* Wishlist Heart Overlay - Always Visible */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white dark:bg-[#121C2C] text-slate-400 hover:text-secondary shadow-xs hover:shadow-sm transition-all z-10 focus:outline-none"
          title="Add to Wishlist"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-secondary text-secondary' : ''}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-3.5 space-y-2">
        {/* Title */}
        <h3 className="font-sans text-[11px] sm:text-xs font-bold text-text-primary group-hover:text-secondary transition-colors line-clamp-1">
          <Link href={`/books/${book.slug}`} title={book.title}>{book.title}</Link>
        </h3>

        {/* Author */}
        <p className="text-[10px] text-text-secondary font-medium line-clamp-1">by {book.author}</p>

        {/* Ratings block */}
        <div className="flex items-center space-x-1 text-[10px] text-text-secondary font-sans font-bold">
          <div className="flex text-amber-400">
            <Star className="h-3 w-3 fill-current text-amber-400" />
          </div>
          <span>4.7</span>
          <span className="text-text-muted font-normal">(12,876)</span>
        </div>

        {/* Condition Badge */}
        <div className="pt-0.5">
          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${conditionColors}`}>
            {displayCondition}
          </span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-1 pt-1 font-sans">
          <span className="text-xs sm:text-sm font-black text-text-primary">₹{book.price.toFixed(0)}</span>
          <span className="text-[10px] text-text-muted line-through">₹{originalPrice.toFixed(0)}</span>
          {discountPercentage > 0 && (
            <span className="text-[10px] text-emerald-600 font-bold ml-0.5">{discountPercentage}% OFF</span>
          )}
        </div>

        {/* Seller Info Row */}
        <div className="flex items-center gap-1 text-[9px] text-text-muted font-sans font-medium pt-1.5 border-t border-border/50">
          <span>Seller:</span>
          <span className="text-text-secondary font-bold truncate max-w-[80px]">Bookworm</span>
          <CheckCircle2 className="h-3 w-3 text-emerald-600 fill-emerald-50 shrink-0" />
        </div>

        {/* Add to Cart button */}
        <div className="pt-2 mt-auto">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || book.stock === 0}
            className="w-full py-2 border border-secondary text-secondary hover:bg-secondary/5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkeletonBookCard() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden animate-pulse shadow-xs">
      <div className="w-full aspect-[2/3] bg-background-subtle" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-3/4 bg-background-subtle rounded" />
        <div className="h-3.5 w-1/2 bg-background-subtle rounded" />
        <div className="h-3.5 w-1/3 bg-background-subtle rounded" />
        <div className="h-5 w-12 bg-background-subtle rounded" />
        <div className="h-6 w-full bg-background-subtle rounded" />
      </div>
    </div>
  );
}

export default BookCard;
