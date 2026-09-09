'use client';

import { Zap } from 'lucide-react';

interface SellHeroProps {
  isEditMode?: boolean;
}

export function SellHero({ isEditMode }: SellHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground p-6 sm:p-8 lg:p-10 shadow-lg border border-border/20 font-sans">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider shadow-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>0% Commission • Free Pickup • Instant UPI Payout</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {isEditMode ? 'Edit & Resubmit Your Book Listing' : 'Sell Your Textbooks & Earn Direct Cash'}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            Circulate your engineering, medical, school, and university textbooks to students across India. Zero listing fees, protected payouts.
          </p>
        </div>

        {/* Quick Value Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-xl font-bold font-mono text-secondary">0%</span>
            <span className="text-[11px] font-semibold text-slate-200 block uppercase tracking-wider">Listing Fee</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-xl font-bold font-mono text-white">50K+</span>
            <span className="text-[11px] font-semibold text-slate-200 block uppercase tracking-wider">Active Buyers</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-xl font-bold font-mono text-emerald-400">Instant</span>
            <span className="text-[11px] font-semibold text-slate-200 block uppercase tracking-wider">UPI Transfers</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center space-y-0.5">
            <span className="text-xl font-bold font-mono text-white">100%</span>
            <span className="text-[11px] font-semibold text-slate-200 block uppercase tracking-wider">Escrow Safety</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellHero;
