'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  ExternalLink,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export function VendorHeader() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/80">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <span>Commercial Merchant Workspace</span>
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <Link
          href="/sell"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-xs hover:bg-secondary/90 transition-all active:scale-95"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Link>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Profile Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-border/80">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-xs font-black text-foreground block leading-none">
              {user?.name || 'Publisher Partner'}
            </span>
            <span className="text-[10px] text-secondary font-black uppercase tracking-wider block mt-1">
              VERIFIED VENDOR
            </span>
          </div>

          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md select-none">
            {user?.name?.slice(0, 2).toUpperCase() || 'VN'}
          </div>
        </div>
      </div>
    </header>
  );
}

export default VendorHeader;
