'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  UserCircle,
  ShoppingBag,
  Heart,
  MessageSquare,
  Bell,
  X,
  Store,
  ShieldCheck,
  Search,
} from 'lucide-react';

export interface BuyerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyerMobileDrawer({ isOpen, onClose }: BuyerMobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const links = [
    { name: 'Profile & Settings', href: '/account/profile', icon: UserCircle },
    { name: 'My Orders & Tracking', href: '/account/orders', icon: ShoppingBag },
    { name: 'Saved Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Used Book Requests (P2P)', href: '/account/requests', icon: MessageSquare },
    { name: 'Notifications & Alerts', href: '/account/notifications', icon: Bell },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto w-4/5 max-w-sm bg-card h-full flex flex-col z-10 shadow-2xl border-l border-border animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-border">
              <Image
                src="/assets/bookfry/bookfry-fox-pointing.webp"
                alt="BookFry"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-black text-foreground">BookFry</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-secondary">Student Hub</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Link
            href="/books"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-wider shadow-md"
          >
            <Search className="h-4 w-4" />
            <span>Explore Marketplace</span>
          </Link>

          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1">
              Navigation
            </div>
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive ? 'bg-secondary/15 text-secondary font-black' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <Link
              href="/seller/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20"
            >
              <Store className="h-4 w-4" />
              <span>Switch to Seller Hub</span>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/50 flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>100% Student Escrow Safe</span>
        </div>
      </div>
    </div>
  );
}
