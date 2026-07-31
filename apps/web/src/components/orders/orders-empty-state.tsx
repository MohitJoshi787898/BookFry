"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface OrdersEmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function OrdersEmptyState({ searchQuery, onClearSearch }: OrdersEmptyStateProps) {
  if (searchQuery) {
    return (
      <div className="rounded-3xl bg-card border border-border/80 p-8 text-center space-y-4 my-8 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-foreground">
          No orders matching &ldquo;{searchQuery}&rdquo;
        </h3>
        <p className="text-sm text-muted-foreground">
          Try searching with a different order number or book title.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-5 py-2.5 rounded-2xl bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-8 sm:p-12 text-center space-y-6 my-8 shadow-xl">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

      {/* Mascot Illustration */}
      <div className="relative h-28 w-28 sm:h-36 sm:w-36 mx-auto hover:scale-105 transition-transform duration-300">
        <Image
          src="/fox_reading_178491148655455.png"
          alt="BookFry Mascot Reading"
          fill
          className="object-contain"
        />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Your Bookshelf Awaits</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          No Orders Placed Yet
        </h2>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          You haven&apos;t purchased any textbooks or novels yet. Browse campus listings with up to 80% peer discounts!
        </p>
      </div>

      <div>
        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-secondary text-secondary-foreground font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-secondary/20 hover:bg-secondary/90 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
