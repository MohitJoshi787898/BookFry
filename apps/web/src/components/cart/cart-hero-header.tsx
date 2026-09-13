'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BookOpen, Sparkles, Share2, ShoppingBag } from 'lucide-react';

interface CartHeroHeaderProps {
  itemCount: number;
  onShareCart: () => void;
}

export function CartHeroHeader({ itemCount, onShareCart }: CartHeroHeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm mb-8 font-sans">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-secondary/15 dark:bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 h-48 w-48 rounded-full bg-primary/10 dark:bg-primary/20 blur-2xl"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Column: Brand Motto + Title + Sub-text */}
        <div className="space-y-3 max-w-2xl">
          <motion.div {...reveal(0)} className="flex items-center gap-3">
            <Link
              href="/books"
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-muted/80 border border-border hover:bg-card hover:border-border/80 transition-all active:scale-95 shadow-xs"
              aria-label="Back to catalog"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Link>

            {/* Motto Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 dark:bg-secondary/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-secondary shadow-2xs">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            </div>
          </motion.div>

          <motion.div {...reveal(0.08)}>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Your Reading <span className="text-secondary underline decoration-secondary/30 decoration-wavy underline-offset-4">Vault</span>
            </h1>
          </motion.div>

          <motion.p {...reveal(0.14)} className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
            Review your selected textbooks and novels. Enjoy guaranteed student discounts, peer escrow protection, and rapid delivery across India.
          </motion.p>
        </div>

        {/* Right Column: Live Cart Chip & Share Action */}
        <motion.div {...reveal(0.18)} className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="h-8 w-8 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary font-extrabold">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">Bag Total</p>
              <p className="text-sm font-extrabold text-foreground">
                {itemCount} {itemCount === 1 ? 'Book' : 'Books'}
              </p>
            </div>
          </div>

          {itemCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onShareCart}
              className="h-11 px-4 rounded-2xl border border-border/90 bg-card hover:bg-muted text-xs font-extrabold text-foreground flex items-center gap-2 transition-all shadow-xs"
              title="Share Cart"
            >
              <Share2 className="h-4 w-4 text-secondary" />
              <span className="hidden sm:inline">Share Cart</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
