'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Store } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-nav';
import { useCartStore } from '@/stores/cart.store';
import { useCurrentUser } from '@/hooks/use-current-user';

export function BuyerHeader() {
  const { isSeller } = useCurrentUser();
  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <DashboardHeader
      role="buyer"
      showSearch={false}
    >
      <Link
        href="/books"
        className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/50 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Browse Books</span>
      </Link>

      {isSeller && (
        <Link
          href="/seller/dashboard"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
        >
          <Store className="h-3.5 w-3.5" />
          <span>Seller Hub</span>
        </Link>
      )}

      {/* Shopping Cart Button */}
      <Link
        href="/cart"
        aria-label={`Shopping cart: ${cartCount} items`}
        className="relative p-2 rounded-2xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
      >
        <ShoppingCart className="h-4 w-4" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center border-2 border-card shadow-xs">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
    </DashboardHeader>
  );
}

export default BuyerHeader;
