'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { AnnouncementBar } from './announcement-bar';
import { PushNotificationBanner } from './push-notification-banner';
import { MobileNav } from './mobile-nav';
import { LocationSelectorModal } from '../navbar/location-selector-modal';
import { NavbarDesktop } from '../navbar/navbar-desktop';
import { NavbarTablet } from '../navbar/navbar-tablet';
import { NavbarMobile } from '../navbar/navbar-mobile';
import { NavbarMobileDrawer } from '../navbar/navbar-mobile-drawer';

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const scrolled = useScrolled();

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Sync client theme & cart on mount
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  if (!mounted) return null;

  return (
    <div className="w-full">
      {/* Top Banner Notifications */}
      <AnnouncementBar />
      <PushNotificationBanner />

      {/* Main Sticky Navigation Shell */}
      <header
        className={`sticky top-0 z-40 w-full transition-shadow duration-200 bg-background/90 backdrop-blur-md ${
          scrolled ? 'border-b border-border shadow-xs' : 'border-b border-border/70'
        }`}
      >
        {/* Desktop Layout (lg+) */}
        <NavbarDesktop theme={theme} onToggleTheme={toggleTheme} />

        {/* Tablet Layout (md -> lg) */}
        <NavbarTablet onOpenDrawer={() => setDrawerOpen(true)} theme={theme} onToggleTheme={toggleTheme} />

        {/* Mobile Layout (< md) */}
        <NavbarMobile onOpenDrawer={() => setDrawerOpen(true)} />
      </header>

      {/* Mobile Slide-Over Sheet */}
      <NavbarMobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Global Modals & Bottom Navigation */}
      <LocationSelectorModal />
      <MobileNav />
    </div>
  );
}

export default Navbar;
