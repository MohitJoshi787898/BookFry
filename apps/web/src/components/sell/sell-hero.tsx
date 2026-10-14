'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, ShieldCheck, Sparkles, TrendingUp, Crown } from 'lucide-react';

interface SellHeroProps {
  isEditMode?: boolean;
  isAdmin?: boolean;
}

export function SellHero({ isEditMode, isAdmin }: SellHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/70 border border-border/80 text-foreground p-3.5 sm:p-5 lg:p-6 shadow-xs font-sans">
      {/* Ambient Lighting Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-secondary/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-5">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/12 border border-secondary/25 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-secondary">
              <Zap className="h-3 w-3 fill-current shrink-0" />
              <span>0% Fee • Instant Payout</span>
            </div>

            {isAdmin && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Crown className="h-3 w-3 shrink-0" />
                <span>Admin Mode • Brand New Default</span>
              </div>
            )}
          </div>

          <h1 className="font-sans text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight leading-snug text-foreground">
            {isEditMode
              ? 'Edit & Update Book Listing'
              : isAdmin
              ? 'Publish Brand New Book to Catalog'
              : 'Sell Your Textbooks & Earn Cash'}
          </h1>

          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
            {isAdmin
              ? 'List factory-fresh books directly to the BookFry storefront. Condition is automatically set to Brand New.'
              : 'List your college, exam prep, or school textbooks in minutes with protected escrow payouts and doorstep pickup.'}
          </p>

          {/* Compact Mobile Trust Pills */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] font-semibold text-muted-foreground pt-0.5">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" /> 100% Escrow Safe
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" /> Free Listing
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-secondary shrink-0" /> Fast Campus Reach
            </span>
          </div>
        </div>

        {/* Right side: Compact Metrics & Mascot (Desktop / Tablet only so mobile stays ultra-compact) */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
            <div className="bg-background/70 border border-border/70 rounded-xl px-3 py-2 text-center min-w-[88px]">
              <span className="text-sm sm:text-base font-black font-mono text-secondary block leading-tight">0%</span>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-wider">Listing Fee</span>
            </div>
            <div className="bg-background/70 border border-border/70 rounded-xl px-3 py-2 text-center min-w-[88px]">
              <span className="text-sm sm:text-base font-black font-mono text-foreground block leading-tight">50K+</span>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-wider">Buyers</span>
            </div>
            <div className="bg-background/70 border border-border/70 rounded-xl px-3 py-2 text-center min-w-[88px]">
              <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block leading-tight">Instant</span>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-wider">UPI Payout</span>
            </div>
            <div className="bg-background/70 border border-border/70 rounded-xl px-3 py-2 text-center min-w-[88px]">
              <span className="text-sm sm:text-base font-black font-mono text-foreground block leading-tight">Doorstep</span>
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-wider">Pickup</span>
            </div>
          </div>

          <div className="relative w-16 h-16 lg:w-20 lg:h-20 hidden md:block shrink-0 drop-shadow-sm select-none">
            <Image
              src="/assets/bookfry/bookfry-fox-pointing.webp"
              alt="BookFry Mascot"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellHero;

