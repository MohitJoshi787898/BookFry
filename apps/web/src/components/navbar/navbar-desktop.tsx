'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';
import { BookFryLogo } from './logo';
import { NavbarLocationButton } from './navbar-location-button';
import { NavbarSearch } from './navbar-search';
import { NavbarCategoryMegaMenu } from './navbar-category-mega-menu';
import { NavbarProfileMenu } from './navbar-profile-menu';
import { NavbarActions } from './navbar-actions';

const EDITORIAL_LINKS = [
  { name: 'All Books', href: '/books?conditionType=all' },
  { name: 'College Textbooks', href: '/books?category=engineering' },
  { name: 'Exam Prep (JEE/NEET/UPSC)', href: '/books?category=exams' },
  { name: 'Pre-Owned & Used', href: '/books?conditionType=used' },
  { name: 'New Arrivals', href: '/books?sort=newest' },
  { name: 'Deals & Offers', href: '/books?discount=40', isHighlight: true },
];

interface NavbarDesktopProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function NavbarDesktop({ theme, onToggleTheme }: NavbarDesktopProps) {
  return (
    <div className="hidden lg:flex flex-col w-full font-sans">
      {/* ── 1. Primary Header Row (h-16) ────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-16 w-full">
        {/* Brand Logo & Location Selector */}
        <div className="flex items-center gap-3.5 shrink-0">
          <BookFryLogo showTagline />
          <NavbarLocationButton variant="desktop" />
        </div>

        {/* Central Search Bar */}
        <div className="flex-1 max-w-2xl mx-2">
          <NavbarSearch variant="desktop" />
        </div>

        {/* Right Actions & Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <NavbarActions theme={theme} onToggleTheme={onToggleTheme} showSellButton />
          <div className="w-px h-6 bg-border/80" aria-hidden="true" />
          <NavbarProfileMenu theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>

      {/* ── 2. Editorial Secondary Category Bar (h-11) ───────────────── */}
      <nav
        aria-label="Category and curated collections"
        className="w-full border-t border-border/60 bg-muted/30 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-11 flex items-center justify-between overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center gap-2">
          {/* Mega-Menu Trigger */}
          <NavbarCategoryMegaMenu />

          <div className="w-px h-4 bg-border/80 mx-1 hidden xl:block" aria-hidden="true" />

          {/* Curated Editorial Links */}
          <div className="flex items-center gap-1">
            {EDITORIAL_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  link.isHighlight
                    ? 'text-secondary font-black hover:bg-secondary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Marketplace Trust Badges */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] font-semibold text-muted-foreground shrink-0 select-none">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>48h Student Escrow</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-secondary" />
            <span>Campus Pickup Available</span>
          </span>
        </div>
      </nav>
    </div>
  );
}

export default NavbarDesktop;
