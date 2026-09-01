'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Tag, Heart, Package, Store } from 'lucide-react';

const QUICK_APP_ACTIONS = [
  { label: 'Browse Books', href: '/books', icon: Search, color: 'text-blue-500 bg-blue-500/10' },
  { label: 'Sell Books', href: '/sell', icon: Store, color: 'text-secondary bg-secondary/10' },
  { label: 'Deals & Offers', href: '/books?deals=true', icon: Tag, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'My Orders', href: '/account/orders', icon: Package, color: 'text-emerald-500 bg-emerald-500/10' },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
];

export function FooterMobileAppGrid() {
  return (
    <div className="block lg:hidden w-full space-y-3 font-sans pb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block px-1">
        Native App Actions
      </span>
      <div className="grid grid-cols-5 gap-2">
        {QUICK_APP_ACTIONS.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 text-center space-y-1.5 transition-all active:scale-95 shadow-xs"
          >
            <div className={`p-2 rounded-xl ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-foreground leading-none truncate w-full">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FooterMobileAppGrid;
