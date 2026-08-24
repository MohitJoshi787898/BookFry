'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  BookOpen,
  ShoppingBag,
  DollarSign,
  HelpCircle,
} from 'lucide-react';

interface SellerSidebarProps {
  user: { name?: string; email?: string } | null;
  totalListings: number;
}

export function SellerSidebar({ user, totalListings }: SellerSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/seller/dashboard',
      icon: TrendingUp,
      badge: null,
      badgeClass: '',
      isActive: pathname === '/seller/dashboard',
    },
    {
      label: 'My Listings',
      href: '/seller/listings',
      icon: BookOpen,
      badge: totalListings > 0 ? String(totalListings) : null,
      badgeClass: '',
      isActive: pathname === '/seller/listings',
    },
    {
      label: 'Used Buyer Requests',
      href: '/seller/requests',
      icon: ShoppingBag,
      badge: 'P2P',
      badgeClass: 'bg-secondary text-white',
      isActive: pathname === '/seller/requests',
    },
    {
      label: 'Paid Orders',
      href: '/seller/orders',
      icon: ShoppingBag,
      badge: 'Online',
      badgeClass: 'bg-brand/10 text-brand dark:bg-brand/20',
      isActive: pathname === '/seller/orders',
    },
    {
      label: 'Earnings Ledger',
      href: '/seller/earnings',
      icon: DollarSign,
      badge: null,
      badgeClass: '',
      isActive: pathname === '/seller/earnings',
    },
  ];

  return (
    <>
      {/* Mobile horizontal navigation tabs */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar border border-border bg-card rounded-2xl p-2.5 flex items-center gap-2 font-sans text-xs font-semibold whitespace-nowrap shadow-sm">
        {navItems.map((item) => {
          const active = item.isActive;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all flex items-center gap-2 ${
                active
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-secondary hover:bg-muted hover:text-text-primary'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    item.badgeClass || (active ? 'bg-white/20 text-white' : 'bg-muted text-text-muted')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Desktop Left Navigation Panel */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5 font-sans">
          {/* Seller Profile Header */}
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="h-10 w-10 bg-brand/10 text-brand dark:bg-brand/20 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'BF'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-text-primary truncate">
                {user?.name || 'Verified Seller'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                <p className="text-xs text-text-muted">Seller Portal Active</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const active = item.isActive;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-brand text-white shadow-xs font-bold'
                      : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 ${active ? 'text-white' : 'text-text-muted'}`} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : item.badgeClass || 'bg-muted text-text-secondary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Seller Promo / Guidelines Box */}
        <div className="bg-brand text-white rounded-2xl p-5 shadow-md font-sans space-y-3 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 select-none pointer-events-none">
            📚
          </div>
          <div className="flex items-center gap-1.5 text-accent text-[11px] font-bold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Seller Success</span>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">Boost Your Book Sales</h4>
          <p className="text-xs text-slate-200 leading-relaxed">
            Books with clear, natural-light photos and accurate condition tags sell up to 3x faster!
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center w-full py-2 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            Sell Another Book
          </Link>
        </div>
      </aside>
    </>
  );
}
