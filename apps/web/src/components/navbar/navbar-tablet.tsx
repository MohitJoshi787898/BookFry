'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { BookFryLogo } from './logo';
import { NavbarSearch } from './navbar-search';
import { NavbarLocationButton } from './navbar-location-button';
import { NavbarProfileMenu } from './navbar-profile-menu';
import { NavbarActions } from './navbar-actions';

interface NavbarTabletProps {
  onOpenDrawer: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function NavbarTablet({ onOpenDrawer, theme, onToggleTheme }: NavbarTabletProps) {
  return (
    <div className="hidden md:flex lg:hidden flex-col w-full font-sans border-b border-border/80">
      {/* Primary Row */}
      <div className="flex items-center gap-3 px-5 h-15 w-full">
        {/* Mobile / Tablet Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <BookFryLogo />

        {/* Search Bar */}
        <div className="flex-1 min-w-0 mx-1">
          <NavbarSearch variant="compact" />
        </div>

        {/* Right Actions & Account */}
        <div className="flex items-center gap-1.5 shrink-0">
          <NavbarActions theme={theme} onToggleTheme={onToggleTheme} showSellButton={false} />
          <NavbarProfileMenu theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>

      {/* Sub row with location & quick chips */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-muted/40 border-t border-border/60 text-xs">
        <NavbarLocationButton variant="compact" />
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            Popular:
          </span>
          {['Engineering', 'Medical', 'UPSC', 'CBSE Class 12', 'Deals'].map((cat) => (
            <a
              key={cat}
              href={`/books?search=${encodeURIComponent(cat)}`}
              className="px-2.5 py-0.5 rounded-full bg-card border border-border/70 text-[11px] font-medium text-foreground hover:border-secondary/40 whitespace-nowrap transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavbarTablet;
