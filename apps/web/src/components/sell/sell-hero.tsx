'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

interface SellHeroProps {
  isEditMode?: boolean;
}

export function SellHero({ isEditMode }: SellHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-foreground p-6 sm:p-8 lg:p-10 shadow-lg border border-border/20 font-sans mb-6">
      {/* Ambient decorative gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl">
          {/* Slogan & Value pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-black uppercase tracking-wider shadow-xs">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>0% Commission • Free Pickup • Instant UPI Payout</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {isEditMode ? 'Edit & Update Your Book Listing' : 'Sell Your Textbooks & Earn Direct Cash'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl">
            Circulate your engineering, medical, school, and university textbooks to students across India. Zero listing fees, protected escrow payouts, and doorstep courier pickup.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Escrow Protection
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" /> Free Student Listings
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-secondary" /> Average Sale in 48h
            </span>
          </div>
        </div>

        {/* Right side: Mascot & Quick Metrics */}
        <div className="flex items-center gap-6 self-center lg:self-auto">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center min-w-[110px]">
              <span className="text-xl sm:text-2xl font-black font-mono text-secondary block">0%</span>
              <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wider mt-0.5">Listing Fee</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center min-w-[110px]">
              <span className="text-xl sm:text-2xl font-black font-mono text-white block">50K+</span>
              <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wider mt-0.5">Active Buyers</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center min-w-[110px]">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block">Instant</span>
              <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wider mt-0.5">UPI Payout</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center min-w-[110px]">
              <span className="text-xl sm:text-2xl font-black font-mono text-white block">Doorstep</span>
              <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wider mt-0.5">Free Pickup</span>
            </div>
          </div>

          {/* BookFry Fox Mascot */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 hidden sm:block shrink-0 drop-shadow-lg select-none">
            <Image
              src="/assets/bookfry/bookfry-fox-pointing.webp"
              alt="BookFry Mascot"
              fill
              sizes="112px"
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
