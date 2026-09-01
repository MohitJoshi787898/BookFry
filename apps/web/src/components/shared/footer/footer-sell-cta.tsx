'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export function FooterSellCTA() {
  return (
    <div className="dark-section relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary text-white p-6 sm:p-8 shadow-2xl border border-white/10 font-sans">
      <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg text-amber-300">
            <Store className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              <Zap className="h-3 w-3 fill-amber-300" />
              <span>0% Seller Commission</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-extrabold tracking-tight text-white">
              Have Used Textbooks to Sell?
            </h3>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Turn your old engineering, medical, and college textbooks into instant cash. Join 50,000+ happy student sellers across India.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-200 font-semibold pr-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Instant UPI Payouts</span>
          </div>
          <Link
            href="/sell"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 shadow-xl text-center"
          >
            <span>Start Selling Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FooterSellCTA;
