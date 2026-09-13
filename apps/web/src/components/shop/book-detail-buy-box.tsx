'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@bookmarket/types';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLocationStore } from '@/stores/location.store';
import {
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export interface BookDetailBuyBoxProps {
  book: Book;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

export function BookDetailBuyBox({
  book,
  isWishlisted = false,
  onToggleWishlist,
}: BookDetailBuyBoxProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem, items } = useCartStore();
  const { locationName, setModalOpen } = useLocationStore();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((it) => it.bookId === book.id || it.bookId === (book as { _id?: string })._id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  const originalPrice = book.discountPrice && book.discountPrice < book.price ? book.price : undefined;
  const currentPrice = book.discountPrice && book.discountPrice < book.price ? book.discountPrice : book.price;

  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(isAuthenticated, book, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setIsAdding(true);
    try {
      await addItem(isAuthenticated, book, quantity);
      router.push('/cart');
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = book.stock !== undefined && book.stock <= 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 font-sans shadow-sm sticky top-24">
      {/* Price & Discount Section */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-3xl sm:text-4xl font-black text-foreground">
            ₹{currentPrice}
          </span>
          {originalPrice ? (
            <span className="font-mono text-sm sm:text-base text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          ) : null}
        </div>

        {discountPercent ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <span>Special Deal: Save {discountPercent}% OFF</span>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground font-semibold">
            Inclusive of all taxes &amp; verified packing
          </p>
        )}
      </div>

      {/* Stock Telemetry */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold">
            Out of Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ready for Instant Dispatch</span>
          </span>
        )}
      </div>

      {/* Reactive Quantity Stepper */}
      {!isOutOfStock && (
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
            Select Quantity:
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/70 border border-border/80">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg bg-card hover:bg-background text-foreground flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 active:scale-95 shadow-2xs"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono font-extrabold text-base px-2 min-w-[28px] text-center text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {onToggleWishlist && (
              <button
                onClick={onToggleWishlist}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                    : 'bg-card border-border/80 text-muted-foreground hover:text-foreground'
                }`}
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="w-full py-3.5 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{inCartCount > 0 ? `In Cart (${inCartCount}) • Add More` : 'Add to Cart'}</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding}
          className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          <span>Buy Now • Express Checkout</span>
        </button>
      </div>

      {/* Delivery Estimate */}
      <div className="pt-3 border-t border-border/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-secondary" />
            <span>Delivery to {locationName}:</span>
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[11px] font-extrabold text-secondary hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>
        <p className="text-xs font-bold text-foreground">
          Estimated delivery in <span className="text-secondary font-black">2-4 business days</span>
        </p>
      </div>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-border/80 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-semibold">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Escrow Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4 text-secondary shrink-0" />
          <span>7-Day Return Policy</span>
        </div>
      </div>
    </div>
  );
}

export default BookDetailBuyBox;
