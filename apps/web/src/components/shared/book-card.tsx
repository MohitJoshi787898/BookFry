'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import { Star, ShoppingBag, Check, CheckCircle2, Heart, MapPin } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlist } from '@/hooks/use-wishlist';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const inWishlist = isWishlisted(book.id);

  const displayCondition = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    acceptable: 'Acceptable',
  }[book.condition] || 'Good';

  const conditionColors = {
    new: 'bg-success/10 text-success border-success/20',
    like_new: 'bg-info/10 text-info border-info/20',
    good: 'bg-success/10 text-success border-success/20',
    fair: 'bg-warning/10 text-warning border-warning/20',
    acceptable: 'bg-secondary/10 text-secondary border-secondary/20',
  }[book.condition] || 'bg-success/10 text-success border-success/20';

  const imageUrl =
    book.images?.[0]?.url ||
    'https://placehold.co/400x600/163A63/ffffff?text=' + encodeURIComponent(book.title || 'BookFry');

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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(book.id);
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
        <span className="absolute top-2.5 left-2.5 bg-danger text-danger-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs select-none">
          Bestseller
        </span>

        {/* Wishlist Heart Overlay - Always Visible */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-card/90 backdrop-blur-xs text-muted-foreground hover:text-secondary shadow-xs hover:shadow-sm transition-all z-10 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Add to Wishlist"
        >
          <Heart className={`h-4 w-4 transition-colors ${inWishlist ? 'fill-secondary text-secondary' : ''}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-3.5 sm:p-4 space-y-2">
        {/* Title */}
        <h3 className="font-sans text-xs sm:text-sm font-bold text-text-primary group-hover:text-secondary transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
          <Link href={`/books/${book.slug}`} title={book.title}>{book.title}</Link>
        </h3>

        {/* Author */}
        <p className="text-xs text-text-secondary font-medium line-clamp-1">by {book.author}</p>

        {/* Ratings block */}
        <div className="flex items-center space-x-1.5 text-xs text-text-secondary font-sans font-semibold">
          <div className="flex text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
          </div>
          <span>4.7</span>
          <span className="text-text-muted font-normal text-xs">(12,876)</span>
        </div>

        {/* Condition Badge */}
        <div className="pt-0.5 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${conditionColors}`}>
            {displayCondition}
          </span>
          <span className="text-xs font-medium text-text-muted">
            {book.condition === 'new' ? 'Online' : 'Contact'}
          </span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-1.5 pt-1 font-sans">
          <span className="text-xs text-text-muted font-semibold">From</span>
          <span className="text-sm sm:text-base font-bold text-text-primary">
            ₹{(book.lowestPrice ?? book.price).toFixed(0)}
          </span>
          <span className="text-xs text-text-muted line-through">₹{originalPrice.toFixed(0)}</span>
          {discountPercentage > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">{discountPercentage}% OFF</span>
          )}
        </div>

        {/* Seller Info & Location Row */}
        <div className="flex items-center justify-between gap-1 text-[11px] text-text-muted font-sans font-medium pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-1 min-w-0">
            {book.campusName ? (
              <span className="inline-flex items-center gap-1 text-secondary font-bold truncate" title={book.campusName}>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{book.campusName}</span>
              </span>
            ) : book.sellerCity ? (
              <span className="inline-flex items-center gap-1 text-foreground font-semibold truncate">
                <MapPin className="h-3 w-3 text-secondary shrink-0" />
                <span className="truncate">
                  {book.sellerCity}
                  {book.distanceKm !== undefined ? ` • ${book.distanceKm} km` : ''}
                </span>
              </span>
            ) : (
              <span className="text-primary dark:text-primary-foreground font-semibold truncate">
                {book.listingCount && book.listingCount > 1
                  ? `${book.listingCount} Offers`
                  : 'Verified Seller'}
              </span>
            )}
          </div>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-auto" />
        </div>

        {/* Add to Cart / Request button */}
        <div className="pt-2 mt-auto">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || book.stock === 0}
            className={`w-full py-2.5 min-h-[38px] border font-bold rounded-lg text-xs tracking-normal transition-colors flex items-center justify-center gap-2 active:scale-98 ${
              book.condition === 'new'
                ? 'border-secondary bg-secondary/5 text-secondary hover:bg-secondary hover:text-secondary-foreground'
                : 'border-primary bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>{book.condition === 'new' ? 'Add to Cart' : 'Request Book'}</span>
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
