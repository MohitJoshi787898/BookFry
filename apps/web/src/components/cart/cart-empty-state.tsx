'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { Book } from '@bookmarket/types';

interface CartEmptyStateProps {
  recommendedBooks: Book[];
  onAddToCart: (book: Book) => void;
  isAdding: boolean;
}

export function CartEmptyState({ recommendedBooks, onAddToCart, isAdding }: CartEmptyStateProps) {
  return (
    <div className="py-12 max-w-2xl mx-auto text-center space-y-8 font-sans">
      {/* Visual Fox Mascot Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/40 p-8 shadow-xl dark:shadow-2xl overflow-hidden"
      >
        {/* Soft Background Radial Glow */}
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-secondary/15 blur-3xl"
          aria-hidden="true"
        />

        {/* Mascot Image */}
        <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fox_reading_178491148655455.png"
            alt="BookFry Mascot — Fox reading a book"
            className="w-full h-full object-contain drop-shadow-xl select-none"
          />
        </div>

        {/* Motto Pill */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-secondary">
          <BookOpen className="h-3.5 w-3.5" />
          <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Your Reading Vault is Empty
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed mb-6">
          Education must never stop! Explore thousands of verified pre-owned and new textbooks starting at just ₹99 with nationwide fast dispatch.
        </p>

        <Link
          href="/books"
          className="inline-flex items-center gap-2 h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" /> Explore Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Recommended Books Section */}
      {recommendedBooks.length > 0 && (
        <div className="text-left space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-extrabold text-foreground">
              Popular Campus Textbooks
            </h3>
            <Link href="/books" className="text-xs font-extrabold text-secondary hover:underline">
              View All
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {recommendedBooks.map((book) => (
              <div
                key={book.id}
                className="w-40 shrink-0 bg-card border border-border/80 rounded-3xl p-3 flex flex-col justify-between gap-2 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-border/80 bg-muted relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.images?.[0]?.url || 'https://placehold.co/120x180'}
                      alt={book.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/120x180/1A3B5C/fff?text=${encodeURIComponent(
                          book.title.substring(0, 10)
                        )}`;
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground line-clamp-1">{book.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">by {book.author}</p>
                    <p className="text-sm font-extrabold text-secondary mt-1">₹{book.price}</p>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(book)}
                  disabled={isAdding}
                  className="w-full h-8 bg-secondary/15 hover:bg-secondary hover:text-secondary-foreground text-secondary font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
