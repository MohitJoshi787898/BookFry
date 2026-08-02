'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface SellHeroProps {
  isEditMode?: boolean;
}

export function SellHero({ isEditMode }: SellHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#15304B] to-[#F26522] text-white p-6 sm:p-10 shadow-2xl border border-white/10 font-sans">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#F26522]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 translate-y-12 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <Zap className="h-3.5 w-3.5 fill-amber-300" />
            <span>0% Commission • Free Pickup • Instant Payouts</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {isEditMode ? 'Edit & Resubmit Your Listing' : 'Sell Your Used Books & Earn Cash'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            Turn your engineering, medical, school, and degree textbooks into instant money with BookFry 0% Listing Fee.
          </p>
        </div>

        {/* Quick Stat Pills */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center space-y-0.5">
            <span className="text-xl font-black font-mono text-amber-300">0%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Listing Fee</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center space-y-0.5">
            <span className="text-xl font-black font-mono text-white">50K+</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Student Buyers</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center space-y-0.5">
            <span className="text-xl font-black font-mono text-emerald-400">UPI</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Instant Payouts</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center space-y-0.5">
            <span className="text-xl font-black font-mono text-white">100%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">Escrow Safety</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellHero;
