'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Heart, User } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';

// Routes where sticky mobile action bars are already present and bottom nav must hide to prevent collisions
const EXCLUDED_PREFIXES = ['/checkout', '/cart', '/sell'];

export function MobileNav() {
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  // Hide on pages that have their own mobile sticky bottom bars
  if (
    EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    (pathname.startsWith('/books/') && pathname !== '/books')
  ) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/books', icon: Compass },
    { label: 'Sell', href: '/sell', icon: Plus, isPrimaryCta: true },
    { label: 'Saved', href: '/account/wishlist', icon: Heart, badge: wishlistCount, authProtected: true },
    {
      label: isAuthenticated ? 'Account' : 'Sign In',
      href: isAuthenticated ? '/account/profile' : '#',
      icon: User,
      authTrigger: !isAuthenticated,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/80 shadow-lg select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-15 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href !== '#' &&
            (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));

          // Sell Center Button
          if (item.isPrimaryCta) {
            return (
              <Link
                key={item.label}
                href="/sell"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal('login', '/sell');
                  }
                }}
                aria-label="Sell your books"
                className="relative -top-2 flex flex-col items-center group focus-visible:outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground shadow-md flex items-center justify-center border-2 border-background ring-2 ring-secondary/30 transition-transform"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                </motion.div>
                <span className="text-[10px] font-black text-secondary tracking-tight mt-0.5 leading-none">
                  Sell
                </span>
              </Link>
            );
          }

          const handleClick = (e: React.MouseEvent) => {
            if (item.authTrigger) {
              e.preventDefault();
              openModal('login', '/account/profile');
            } else if (item.authProtected && !isAuthenticated) {
              e.preventDefault();
              openModal('login', item.href);
            }
          };

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleClick}
              className="relative flex flex-col items-center justify-center min-w-[56px] h-full py-1 text-center group focus-visible:outline-none"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  isActive ? 'bg-secondary/15 text-secondary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 bg-secondary text-secondary-foreground text-[9px] font-black rounded-full flex items-center justify-center border border-background shadow-2xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                  isActive ? 'font-black text-secondary' : 'font-semibold text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
