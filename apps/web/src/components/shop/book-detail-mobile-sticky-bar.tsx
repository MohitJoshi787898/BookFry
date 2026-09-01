'use client';

import React from 'react';
import { Book } from '@bookmarket/types';
import { ShoppingBag, Zap } from 'lucide-react';

export interface BookDetailMobileStickyBarProps {
  book: Book;
  onAddToCart: () => void;
  onBuyNow: () => void;
  inCartCount: number;
  isLoading?: boolean;
}

export function BookDetailMobileStickyBar({
  book,
  onAddToCart,
  onBuyNow,
  inCartCount,
  isLoading = false,
}: BookDetailMobileStickyBarProps) {
  const isOutOfStock = book.stock !== undefined && book.stock <= 0;
  const originalPrice = book.discountPrice && book.discountPrice < book.price ? book.price : undefined;
  const currentPrice = book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-border/80 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-2xl font-sans pb-[env(safe-area-inset-bottom,12px)]">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Price display */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-black text-foreground">
              ₹{currentPrice}
            </span>
            {originalPrice ? (
              <span className="font-mono text-[11px] text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block truncate">
            {isOutOfStock ? 'Sold Out' : 'Ready to Ship'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock || isLoading}
            className="py-2.5 px-3.5 rounded-2xl border border-border bg-card text-foreground hover:bg-muted font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-secondary" />
            <span>{inCartCount > 0 ? `In Cart (${inCartCount})` : 'Cart'}</span>
          </button>

          <button
            onClick={onBuyNow}
            disabled={isOutOfStock || isLoading}
            className="py-2.5 px-4 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailMobileStickyBar;
