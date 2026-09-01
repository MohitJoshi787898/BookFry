'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@bookmarket/types';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  ShoppingBag,
  Star,
  Plus,
  Minus,
} from 'lucide-react';

export interface BooksListItemProps {
  book: Book;
}

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  like_new: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  good: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  fair: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  acceptable: 'bg-secondary/15 text-secondary border-secondary/30',
};

function getBookImage(img: unknown): string {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && 'url' in img && typeof (img as { url: unknown }).url === 'string') {
    return (img as { url: string }).url;
  }
  return '/assets/bookfry/bookfry-fox-reading.webp';
}

export function BooksListItem({ book }: BooksListItemProps) {
  const { isAuthenticated } = useAuthStore();
  const { addItem, items, updateQuantity } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((it) => it.bookId === book.id || it.bookId === (book as { _id?: string })._id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const itemIdentifier = cartItem?.listingId || cartItem?.bookId || book.id;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(isAuthenticated, book, 1);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async () => {
    if (cartItem) {
      await updateQuantity(isAuthenticated, itemIdentifier, cartItem.quantity + 1);
    } else {
      await handleAddToCart();
    }
  };

  const handleDecrement = async () => {
    if (cartItem && cartItem.quantity > 0) {
      await updateQuantity(isAuthenticated, itemIdentifier, cartItem.quantity - 1);
    }
  };

  const originalPrice = book.discountPrice && book.discountPrice < book.price ? book.price : undefined;
  const currentPrice = book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price;

  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const bookImageSrc =
    book.images && book.images.length > 0
      ? getBookImage(book.images[0])
      : '/assets/bookfry/bookfry-fox-reading.webp';

  const ratingAvg = book.ratingAvg || 4.5;
  const ratingCount = book.ratingCount || 12;

  return (
    <div className="group rounded-3xl border border-border/80 bg-card p-4 sm:p-5 transition-all duration-200 hover:border-secondary/40 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 font-sans">
      {/* Book Cover */}
      <Link
        href={`/books/${book.slug || book.id}`}
        className="relative w-24 h-32 sm:w-28 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/70 group-hover:scale-102 transition-transform"
      >
        <Image
          src={bookImageSrc}
          alt={book.title}
          fill
          sizes="112px"
          className="object-cover"
        />
        {book.condition && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs ${
              CONDITION_COLORS[book.condition] || 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {book.condition.replace('_', ' ')}
          </span>
        )}
      </Link>

      {/* Book Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          {ratingAvg ? (
            <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{ratingAvg.toFixed(1)}</span>
              {ratingCount ? (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  ({ratingCount})
                </span>
              ) : null}
            </div>
          ) : null}
          {book.edition && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              • {book.edition} Edition
            </span>
          )}
        </div>

        <Link
          href={`/books/${book.slug || book.id}`}
          className="block font-serif text-base sm:text-lg font-bold text-foreground hover:text-secondary transition-colors line-clamp-1"
        >
          {book.title}
        </Link>

        <p className="text-xs text-muted-foreground font-medium truncate">
          by <span className="text-foreground font-semibold">{book.author}</span>
          {book.publisher ? ` • ${book.publisher}` : ''}
        </p>

        {book.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
            {book.description}
          </p>
        )}
      </div>

      {/* Pricing & Cart Action */}
      <div className="w-full sm:w-auto shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/70">
        <div className="text-left sm:text-right">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black text-foreground">
              ₹{currentPrice}
            </span>
            {originalPrice ? (
              <span className="font-mono text-xs text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            ) : null}
          </div>
          {discountPercent ? (
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
              Save {discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {/* Tactile Quantity Stepper or Add Button */}
        {currentQuantity > 0 ? (
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted/80 border border-border">
            <button
              onClick={handleDecrement}
              className="h-8 w-8 rounded-xl bg-card hover:bg-background text-foreground flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-extrabold text-sm px-2 min-w-[20px] text-center text-foreground">
              {currentQuantity}
            </span>
            <button
              onClick={handleIncrement}
              className="h-8 w-8 rounded-xl bg-secondary text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-1.5 shadow-sm shadow-secondary/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default BooksListItem;
