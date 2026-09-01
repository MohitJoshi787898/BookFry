'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, PlusCircle, Heart, User } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/stores/auth.store';

export function MobileNav() {
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/books', icon: Compass },
    { label: 'Sell', href: '/sell', icon: PlusCircle, isHighlight: true },
    { label: 'Saved', href: '/account/wishlist', icon: Heart, badge: wishlistCount },
    {
      label: isAuthenticated ? 'Account' : 'Login',
      href: isAuthenticated ? '/account/profile' : '/account/profile',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl glass-header border border-border/80 shadow-2xl transition-all duration-300"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative px-1 pt-1 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Sell a book"
                className="relative -top-4 group flex flex-col items-center focus-ring rounded-full"
              >
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.06 }}
                  className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-xl flex items-center justify-center border-4 border-background ring-2 ring-secondary/30 transition-all"
                >
                  <PlusCircle className="h-7 w-7 stroke-[2.5]" />
                </motion.div>
                <span className="text-xs font-extrabold text-secondary tracking-tight mt-1 leading-none">
                  Sell
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center py-1.5 px-3 min-w-[48px] min-h-[48px] justify-center text-center group focus-ring rounded-xl"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-secondary/15 text-secondary'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-secondary text-secondary-foreground text-xs font-black rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.div>

              <span
                className={`text-xs tracking-tight leading-none mt-1 transition-all duration-200 ${
                  isActive
                    ? 'font-extrabold text-secondary'
                    : 'font-medium text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 w-5 h-0.5 bg-secondary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
