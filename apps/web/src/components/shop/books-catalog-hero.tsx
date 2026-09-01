'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, BookOpen, Layers } from 'lucide-react';
import { useLocationStore } from '@/stores/location.store';

export interface BooksCatalogHeroProps {
  searchQuery?: string;
  categoryName?: string;
  totalBooks: number;
  conditionType: 'all' | 'new' | 'used';
}

export function BooksCatalogHero({
  searchQuery,
  categoryName,
  totalBooks,
  conditionType,
}: BooksCatalogHeroProps) {
  const { locationName, setModalOpen } = useLocationStore();

  const getTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (categoryName) return `${categoryName} Textbooks & Guides`;
    if (conditionType === 'used') return 'Pre-Loved & Campus Used Books';
    if (conditionType === 'new') return 'Brand New Academic Textbooks';
    return 'India’s Unified Book Marketplace';
  };

  const getSubtitle = () => {
    if (searchQuery) {
      return `Explore verified listings matching your keyword with direct student and verified bookseller options.`;
    }
    return `Buy syllabus textbooks, entrance exam prep, and rare literature with 100% verified student escrow protection.`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-muted/80 border border-border/80 text-foreground p-5 sm:p-7 lg:p-8 shadow-sm mb-6 font-sans">
      {/* Ambient Lighting Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-secondary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Subtle Grid Texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:24px_24px]"
      />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/12 border border-secondary/25 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-secondary shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
            <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/80 hover:bg-muted border border-border text-xs font-bold text-foreground transition-colors cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            <span className="text-muted-foreground">Deliver to:</span>
            <span className="text-secondary max-w-[140px] truncate">{locationName}</span>
          </button>
        </div>

        {/* Hero Title & Mascot Row */}
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {getTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              {getSubtitle()}
            </p>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 hidden md:block drop-shadow-md"
          >
            <Image
              src="/assets/bookfry/bookfry-fox-reading.webp"
              alt="BookFry Mascot"
              fill
              sizes="96px"
              className="object-contain"
              priority
            />
          </motion.div>
        </div>

        {/* Live Marketplace Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 border-t border-border/80">
          <div className="rounded-2xl bg-background/60 border border-border/70 p-3 backdrop-blur-sm">
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3 text-secondary" />
              <span>Available Titles</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-extrabold text-foreground">
              {totalBooks} Books
            </p>
          </div>

          <div className="rounded-2xl bg-background/60 border border-border/70 p-3 backdrop-blur-sm">
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-primary" />
              <span>Condition Filter</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-extrabold text-foreground capitalize">
              {conditionType === 'all' ? 'All Verified' : conditionType}
            </p>
          </div>

          <div className="rounded-2xl bg-background/60 border border-border/70 p-3 backdrop-blur-sm">
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <span>Protection</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              100% Escrow
            </p>
          </div>

          <div className="rounded-2xl bg-background/60 border border-border/70 p-3 backdrop-blur-sm">
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <span>Delivery</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-extrabold text-foreground">
              Pan-India Fast
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BooksCatalogHero;
