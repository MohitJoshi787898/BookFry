'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCircle,
  ShoppingBag,
  Heart,
  MessageSquare,
  Menu,
} from 'lucide-react';

export interface BuyerMobileBottomBarProps {
  onOpenDrawer: () => void;
}

export function BuyerMobileBottomBar({ onOpenDrawer }: BuyerMobileBottomBarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Profile', href: '/account/profile', icon: UserCircle },
    { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Requests', href: '/account/requests', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold transition-all ${
              isActive ? 'text-secondary font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-4 w-4 mb-0.5 ${isActive ? 'text-secondary' : 'text-muted-foreground'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        aria-label="Open Navigation Menu"
      >
        <Menu className="h-4 w-4 mb-0.5 text-muted-foreground" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
