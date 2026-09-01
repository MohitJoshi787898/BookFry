'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  IndianRupee,
  BarChart3,
  Settings,
  Store,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

export interface VendorMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const vendorNavSections = [
  {
    title: 'Store Operations',
    items: [
      { name: 'Vendor Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard, desc: 'Operational hub & alerts' },
      { name: 'Products Catalog', href: '/vendor/products', icon: Package, desc: 'Bulk SKUs & pricing' },
      { name: 'Inventory & Stock', href: '/vendor/inventory', icon: Layers, desc: 'Low stock alerts & restock' },
      { name: 'Bulk Orders Dispatch', href: '/vendor/orders', icon: ShoppingBag, desc: 'Fulfillment & courier AWBs' },
    ],
  },
  {
    title: 'Financials & Insights',
    items: [
      { name: 'Revenue & Settlements', href: '/vendor/revenue', icon: IndianRupee, desc: 'Bank payouts & GST statements' },
      { name: 'Commercial Analytics', href: '/vendor/analytics', icon: BarChart3, desc: 'Demand trends & top titles' },
      { name: 'Vendor Store Settings', href: '/vendor/settings', icon: Settings, desc: 'Logistics & bank preferences' },
    ],
  },
];

export function VendorMobileDrawer({ isOpen, onClose }: VendorMobileDrawerProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end font-sans md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="pt-3 pb-2 px-5 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/20">
              <div className="flex items-center space-x-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center p-1">
                  <Image
                    src="/assets/bookfry/bookfry-fox-pointing.webp"
                    alt="Fox Mascot"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-extrabold text-foreground">
                    Vendor Commercial Back-Office
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    BookFry Merchant Hub
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Nav List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-12">
              {vendorNavSections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-2 block">
                    {sec.title}
                  </span>

                  <div className="grid grid-cols-1 gap-1.5">
                    {sec.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-98 ${
                            isActive
                              ? 'bg-secondary/15 border-secondary/30 text-secondary shadow-xs font-black'
                              : 'bg-background/80 border-border/60 text-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                isActive
                                  ? 'bg-secondary text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-secondary shrink-0 shadow-xs" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Storefront View */}
              <div className="p-4 rounded-2xl bg-muted border border-border text-foreground space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-bold">Public Marketplace</span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Switch from vendor back-office to buyer storefront.
                </p>
                <Link
                  href="/"
                  target="_blank"
                  className="w-full py-2.5 px-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Storefront</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default VendorMobileDrawer;
