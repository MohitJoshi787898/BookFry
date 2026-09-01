'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@bookmarket/types';
import { Star, ShoppingBag, CheckCircle2, Heart, MapPin, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

const CONDITION_BADGE: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  like_new: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25',
  good: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  fair: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25',
  acceptable: 'bg-orange-500/15 text-secondary border-secondary/25',
};


export function BookCard({ book }: BookCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isUpdating, setIsUpdating] = useState(false);
  const inWishlist = isWishlisted(book.id);

  // Check if this book is already in the cart and find its quantity
  const cartItem = items.find(
    (item) => item.listingId === book.id || item.bookId === book.id
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const displayCondition = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    acceptable: 'Acceptable',
  }[book.condition] || 'Good';

  const conditionColors = CONDITION_BADGE[book.condition] || CONDITION_BADGE.good;


  const imageUrl =
    book.images?.[0]?.url ||
    'https://placehold.co/400x600/1D2535/F8FAFC?text=' + encodeURIComponent(book.title || 'BookFry');

  let discountPercentage = 0;
  const originalPrice = book.discountPrice || Math.round(book.price * 2);
  if (originalPrice > book.price) {
    discountPercentage = Math.round(((originalPrice - book.price) / originalPrice) * 100);
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || book.stock === 0) return;
    setIsUpdating(true);
    try {
      await addItem(isAuthenticated, book, 1);
    } catch (err) {
      console.error('Failed to add book to cart', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || (book.stock !== undefined && cartQuantity >= book.stock)) return;
    setIsUpdating(true);
    try {
      await updateQuantity(isAuthenticated, book.id, cartQuantity + 1);
    } catch (err) {
      console.error('Failed to increment book quantity', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (cartQuantity > 1) {
        await updateQuantity(isAuthenticated, book.id, cartQuantity - 1);
      } else {
        await removeItem(isAuthenticated, book.id);
      }
    } catch (err) {
      console.error('Failed to decrement book quantity', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(book.id);
  };

  const hasRating = (book.ratingAvg ?? 0) > 0;
  const hasReviews = (book.ratingCount ?? 0) > 0;
  const isBestseller = Boolean(book.tags?.includes('bestseller') || (book as unknown as Record<string, unknown>).isBestseller);

  return (
    <div className="group relative flex flex-col h-full rounded-2xl border border-border bg-card hover:border-secondary/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* 2:3 Cover Image Container */}
      <Link
        href={`/books/${book.slug}`}
        className="relative w-full aspect-[2/3] bg-muted overflow-hidden block border-b border-border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x600/1A3B5C/FFFFFF?text=' + encodeURIComponent(book.title);
          }}
        />

        {/* Bestseller badge — only shown when tagged */}
        {isBestseller && (
          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm select-none">
            Bestseller
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-card/85 backdrop-blur-sm text-muted-foreground hover:text-secondary shadow-sm transition-all z-10 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center border border-border"
          title={inWishlist ? 'Remove from wishlist' : 'Add to Wishlist'}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to Wishlist'}
        >
          <Heart className={cn('h-4 w-4 transition-colors', inWishlist ? 'fill-secondary text-secondary' : '')} />
        </button>
      </Link>


      {/* Content Area */}
      <div className="flex flex-col flex-grow p-3.5 sm:p-4 space-y-2 font-sans">
        {/* Title */}
        <h3 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
          <Link href={`/books/${book.slug}`} title={book.title}>
            {book.title}
          </Link>
        </h3>

        {/* Author */}
        <p className="text-xs text-muted-foreground font-medium line-clamp-1">by {book.author}</p>

        {/* Ratings block */}
        {hasRating ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary shrink-0" />
            <span className="font-semibold text-foreground">{(book.ratingAvg ?? 0).toFixed(1)}</span>
            {hasReviews && (
              <span className="text-muted-foreground">
                {((book.ratingCount ?? 0) > 999 ? `${((book.ratingCount ?? 0) / 1000).toFixed(1)}k` : book.ratingCount)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Unrated</span>
          </div>
        )}

        {/* Condition Badge */}
        <div className="flex items-center justify-between gap-1">
          <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] sm:text-xs font-semibold', conditionColors)}>
            {displayCondition}
          </span>
          <span className="text-xs text-muted-foreground">
            {book.condition === 'new' ? 'Online' : 'Campus'}
          </span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-1.5 pt-0.5 font-sans">
          <span className="text-xs text-muted-foreground font-medium">From</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground">
            ₹{(book.lowestPrice ?? book.price).toFixed(0)}
          </span>
          {discountPercentage > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{originalPrice.toFixed(0)}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{discountPercentage}% off</span>
            </>
          )}
        </div>

        {/* Seller Info & Location Row */}
        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground pt-1.5 border-t border-border">
          <div className="flex items-center gap-1 min-w-0">
            {book.campusName ? (
              <span className="inline-flex items-center gap-1 text-secondary font-semibold truncate" title={book.campusName}>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{book.campusName}</span>
              </span>
            ) : (
              <span className="text-muted-foreground truncate">
                {book.listingCount && book.listingCount > 1
                  ? `${book.listingCount} Offers`
                  : 'Verified Seller'}
              </span>
            )}
          </div>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 ml-auto" />
        </div>

        {/* Add to Cart / Quantity Stepper */}
        <div className="pt-1.5 mt-auto">
          {book.stock === 0 ? (
            <div className="w-full py-2.5 min-h-[40px] rounded-xl text-xs font-semibold bg-muted text-muted-foreground border border-border flex items-center justify-center select-none">
              Out of Stock
            </div>
          ) : cartQuantity > 0 ? (
            <div
              className="flex items-center justify-between w-full h-[40px] px-1 bg-muted border border-secondary/50 rounded-xl overflow-hidden"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isUpdating}
                aria-label={cartQuantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                title={cartQuantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                className="w-9 h-full flex items-center justify-center text-secondary hover:bg-secondary/15 active:scale-90 transition-all rounded-lg cursor-pointer disabled:opacity-50"
              >
                {cartQuantity === 1 ? (
                  <Trash2 className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
              </button>

              <span className="font-mono text-sm font-bold text-foreground flex items-center justify-center min-w-[2rem] select-none">
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
                ) : (
                  cartQuantity
                )}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isUpdating || (book.stock !== undefined && cartQuantity >= book.stock)}
                aria-label="Increase quantity"
                title={
                  book.stock !== undefined && cartQuantity >= book.stock
                    ? 'Maximum available stock reached'
                    : 'Increase quantity'
                }
                className="w-9 h-full flex items-center justify-center text-secondary hover:bg-secondary/15 active:scale-90 transition-all rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isUpdating}
              className={cn(
                'w-full py-2.5 min-h-[40px] font-bold rounded-xl text-xs tracking-normal transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-60',
                book.condition === 'new'
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-secondary/40'
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>{book.condition === 'new' ? 'Add to Cart' : 'Request Book'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkeletonBookCard() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-muted" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="h-3 w-1/3 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-9 w-full bg-muted rounded-xl mt-1" />
      </div>
    </div>
  );
}

export default BookCard;

