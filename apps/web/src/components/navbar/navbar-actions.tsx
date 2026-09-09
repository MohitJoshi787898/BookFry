'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Moon, Sun, PlusCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

interface NavbarActionsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  className?: string;
  showSellButton?: boolean;
}

export function NavbarActions({
  theme,
  onToggleTheme,
  className = '',
  showSellButton = true,
}: NavbarActionsProps) {
  const { items } = useCartStore();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleWishlistClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal('login', '/account/wishlist');
    }
  };

  const handleSellClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openModal('login', '/sell');
    }
  };

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      {/* "Sell Books" Primary Marketplace CTA */}
      {showSellButton && (
        <Link
          href="/sell"
          onClick={handleSellClick}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/35 text-secondary text-xs font-black transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary mr-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Sell Books</span>
        </Link>
      )}

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme'}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-secondary" />}
      </button>

      {/* Wishlist Button */}
      <Link
        href="/account/wishlist"
        onClick={handleWishlistClick}
        aria-label={`Wishlist: ${wishlistCount} items`}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <Heart className="w-4 h-4" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-secondary text-secondary-foreground text-[9px] font-black flex items-center justify-center border-2 border-background shadow-xs">
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart Button */}
      <Link
        href="/cart"
        aria-label={`Shopping cart: ${cartCount} items`}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <ShoppingCart className="w-4 h-4" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center border-2 border-background shadow-xs">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

export default NavbarActions;
