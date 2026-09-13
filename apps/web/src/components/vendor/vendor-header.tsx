'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, PlusCircle } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-nav';

export function VendorHeader() {
  return (
    <DashboardHeader
      role="seller"
      showSearch={false}
    >
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
    </DashboardHeader>
  );
}

export default VendorHeader;
