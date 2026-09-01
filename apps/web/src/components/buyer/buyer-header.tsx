'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth.store';
import { Bell, ShoppingCart, User, Search, Store } from 'lucide-react';

export function BuyerHeader() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link href="/account/profile" className="flex items-center gap-2 md:hidden">
          <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-border">
            <Image
              src="/assets/bookfry/bookfry-fox-pointing.webp"
              alt="BookFry"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-xs font-black tracking-tight text-foreground">
            Student Hub
          </span>
        </Link>
        <span className="hidden md:inline-block text-xs font-bold text-muted-foreground">
          Welcome back, <strong className="text-foreground">{user?.name || 'Reader'}</strong>!
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/books"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/50 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Browse Books</span>
        </Link>

        <Link
          href="/seller/dashboard"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
        >
          <Store className="h-3.5 w-3.5" />
          <span>Seller Hub</span>
        </Link>

        <Link
          href="/account/notifications"
          className="relative p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>

        <Link
          href="/cart"
          className="relative p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          aria-label="Cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Link>

        <Link
          href="/account/profile"
          className="flex items-center gap-2 p-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted transition-all"
        >
          <div className="h-7 w-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
          </div>
        </Link>
      </div>
    </header>
  );
}
