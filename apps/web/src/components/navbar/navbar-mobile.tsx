'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ShoppingCart } from 'lucide-react';
import { BookFryLogo } from './logo';
import { NavbarSearch } from './navbar-search';
import { NavbarLocationButton } from './navbar-location-button';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

interface NavbarMobileProps {
  onOpenDrawer: () => void;
}

export function NavbarMobile({ onOpenDrawer }: NavbarMobileProps) {
  const { items } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex md:hidden flex-col w-full font-sans bg-background/95 backdrop-blur-md border-b border-border/80">
      {/* ── Top Bar: Logo, Location, Cart, Profile (h-14) ───────────── */}
      <div className="flex items-center justify-between px-3.5 h-14 w-full">
        {/* Left: Drawer Trigger + Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open mobile navigation"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BookFryLogo />
        </div>

        {/* Right: Location Chip, Cart, User / Login */}
        <div className="flex items-center gap-2 shrink-0">
          <NavbarLocationButton variant="compact" />

          {/* Cart Icon */}
          <Link
            href="/cart"
            aria-label={`Cart: ${cartCount} items`}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-foreground hover:bg-muted/80 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center border-2 border-background shadow-xs">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Account Avatar or Login Button */}
          {isAuthenticated && user ? (
            <Link
              href="/account/profile"
              aria-label="My Account"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground text-xs font-black ring-2 ring-primary/20 shrink-0"
            >
              {initial}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openModal('login')}
              className="px-2.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-[11px] font-black shadow-xs active:scale-95 transition-all"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ── Search Input Row ────────────────────────────────────────── */}
      <div className="px-3.5 pb-2.5 w-full">
        <NavbarSearch variant="mobile" />
      </div>
    </div>
  );
}

export default NavbarMobile;
