'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Layers,
  BarChart3,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  FileText,
  ShoppingBag,
  Star,
  MessageSquare,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationGroups = [
    {
      title: 'OVERVIEW & ANALYTICS',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Financial Analytics', href: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'MARKETPLACE & ORDERS',
      items: [
        { name: 'Book Listings', href: '/admin/listings', icon: BookOpen, badge: 'Moderation' },
        { name: 'Orders & Refunds', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Categories', href: '/admin/categories', icon: Layers },
        { name: 'Promotions & Coupons', href: '/admin/promotions', icon: Tag },
        { name: 'Book Reviews', href: '/admin/reviews', icon: Star },
      ],
    },
    {
      title: 'USERS & SUPPORT',
      items: [
        { name: 'Users & Sellers', href: '/admin/users', icon: Users },
        { name: 'Support Tickets', href: '/admin/support', icon: MessageSquare, badge: 'Helpdesk' },
      ],
    },
    {
      title: 'SYSTEM & CONTENT',
      items: [
        { name: 'CMS & Banners', href: '/admin/cms', icon: FileText },
        { name: 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative bg-surface border-r border-border flex flex-col transition-all duration-300 z-30 font-sans ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold text-brand tracking-tight">BookFry</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-white px-2 py-0.5 rounded">
              Admin
            </span>
          </Link>
        )}
        {collapsed && (
          <span className="font-serif text-xl font-bold text-brand mx-auto">BF</span>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-background-subtle text-text-muted hover:text-text-primary transition-colors hidden sm:block"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2">
                {group.title}
              </h4>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand text-white shadow-sm font-bold'
                      : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-text-muted'}`} />

                  {!collapsed && <span className="truncate flex-1">{item.name}</span>}

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Storefront Switcher */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className={`flex items-center space-x-2 p-2.5 rounded-md text-xs font-medium text-text-secondary hover:bg-background-subtle hover:text-brand transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Back to Customer Storefront"
        >
          <Store className="h-4 w-4 text-text-muted shrink-0" />
          {!collapsed && <span>Storefront</span>}
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
