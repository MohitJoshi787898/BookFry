'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  Grid,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface AdminMobileBottomBarProps {
  onOpenDrawer?: () => void;
}

export function AdminMobileBottomBar({ onOpenDrawer }: AdminMobileBottomBarProps) {
  const pathname = usePathname();

  const primaryTabs = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Listings', href: '/admin/listings', icon: BookOpen },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const isCurrentActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 px-3 py-2 font-sans shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {primaryTabs.map((tab) => {
          const isActive = isCurrentActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all active:scale-95 relative ${
                isActive
                  ? 'text-secondary font-black'
                  : 'text-muted-foreground hover:text-foreground font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-secondary' : 'text-muted-foreground'}`} />
                {isActive && (
                  <motion.div
                    layoutId="mobileBottomIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-secondary"
                  />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate">{tab.name}</span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-muted-foreground hover:text-secondary transition-all active:scale-95 cursor-pointer font-semibold"
        >
          <div className="relative">
            <Grid className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">All Tools</span>
        </button>
      </div>
    </div>
  );
}

export default AdminMobileBottomBar;
