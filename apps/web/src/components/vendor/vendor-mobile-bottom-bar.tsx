'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Grid,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface VendorMobileBottomBarProps {
  onOpenDrawer?: () => void;
}

export function VendorMobileBottomBar({ onOpenDrawer }: VendorMobileBottomBarProps) {
  const pathname = usePathname();

  const primaryTabs = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/vendor/products', icon: Package },
    { name: 'Inventory', href: '/vendor/inventory', icon: Layers },
    { name: 'Orders', href: '/vendor/orders', icon: ShoppingBag },
  ];

  const isCurrentActive = (href: string) =>
    pathname === href || (href !== '/vendor/dashboard' && pathname.startsWith(href));

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
                    layoutId="vendorBottomIndicator"
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
          <span className="text-[10px] tracking-tight mt-1 truncate">More</span>
        </button>
      </div>
    </div>
  );
}

export default VendorMobileBottomBar;
