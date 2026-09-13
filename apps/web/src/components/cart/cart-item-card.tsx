'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShieldCheck, Clock, Tag } from 'lucide-react';
import { CartItem } from '@bookmarket/types';

interface CartItemCardProps {
  item: CartItem;
  isLoading: boolean;
  onQtyChange: (itemKey: string, currentQty: number, change: number, stock: number) => void;
  onRemove: (itemKey: string) => void;
}

export function CartItemCard({ item, isLoading, onQtyChange, onRemove }: CartItemCardProps) {
  const itemKey = item.listingId || item.bookId || '';
  const book = item.listingDetail?.catalog || item.bookDetail;
  const condition = item.listingDetail?.condition || item.bookDetail?.condition || 'good';
  const stock = item.listingDetail?.stock || item.bookDetail?.stock || 1;

  if (!book) return null;

  const imageUrl = book.images?.[0]?.url || '';
  const itemTotal = item.priceSnapshot * item.quantity;
  const strikePrice = itemTotal * 1.25;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="hover-page-turn group relative rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden font-sans"
    >
      {/* Soft background hover gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/[0.02] to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
        {/* Book Cover Container */}
        <Link href={`/books/${book.slug}`} className="shrink-0 self-center sm:self-start">
          <div className="relative h-32 w-22 sm:h-36 sm:w-26 rounded-xl overflow-hidden border border-border/80 bg-muted shadow-2xs group-hover:shadow-xs transition-all duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={book.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/120x180/1A3B5C/fff?text=${encodeURIComponent(
                  book.title.substring(0, 15)
                )}`;
              }}
            />
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
              <span className={`px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-md border text-[11px] font-extrabold uppercase tracking-wider shadow-2xs ${
                condition === 'new' ? 'border-success/60 text-success' : 'border-secondary/60 text-secondary'
              }`}>
                {condition === 'new' ? 'New • Online' : 'Used • Escrow'}
              </span>
            </div>
          </div>
        </Link>

        {/* Details & Actions Container */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-3">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/books/${book.slug}`}
                className="font-serif text-base sm:text-lg font-extrabold text-foreground hover:text-secondary transition-colors line-clamp-2 leading-snug"
              >
                {book.title}
              </Link>
              <button
                onClick={() => onRemove(itemKey)}
                disabled={isLoading}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-border/80 text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all shrink-0 active:scale-90 cursor-pointer"
                title="Remove item"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium">by <span className="text-foreground font-semibold">{book.author}</span></p>

            {/* Quality & Speed Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-success/10 border border-success/20 text-success text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Quality
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                <Clock className="h-3.5 w-3.5" /> 2–4 Days Dispatch
              </span>
            </div>
          </div>

          {/* Bottom Bar: Price Breakdown & Stepper */}
          <div className="flex items-end sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
            {/* Price Column */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-foreground">₹{itemTotal.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground line-through font-medium">₹{strikePrice.toFixed(0)}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-xs font-bold text-secondary">
                  <Tag className="h-3 w-3" /> 20% OFF
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">₹{item.priceSnapshot.toFixed(0)} / book</p>
            </div>

            {/* Stepper Control */}
            <div className="flex items-center border border-border/90 rounded-xl overflow-hidden bg-background shadow-2xs">
              <button
                onClick={() => onQtyChange(itemKey, item.quantity, -1, stock)}
                disabled={item.quantity <= 1 || isLoading}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 active:scale-90 text-foreground cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-extrabold text-foreground font-mono">{item.quantity}</span>
              <button
                onClick={() => onQtyChange(itemKey, item.quantity, 1, stock)}
                disabled={item.quantity >= stock || isLoading}
                className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 active:scale-90 text-foreground cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
