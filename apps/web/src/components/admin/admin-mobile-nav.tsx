'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  Layers,
  Tag,
  FileText,
  BarChart3,
  Star,
  MessageSquare,
  Settings,
} from 'lucide-react';

export function AdminMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Listings', href: '/admin/listings', icon: BookOpen },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Promotions', href: '/admin/promotions', icon: Tag },
    { name: 'CMS', href: '/admin/cms', icon: FileText },
    { name: 'Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Support', href: '/admin/support', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="block md:hidden overflow-x-auto scrollbar-none pb-2 mb-6 -mx-1 px-1 font-sans">
      <div className="flex items-center gap-2 min-w-max p-1.5 bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl shadow-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#F26522] text-white shadow-md shadow-[#F26522]/20 border border-[#F26522]'
                  : 'bg-background text-muted-foreground border border-border/60 hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-secondary'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AdminMobileNav;
