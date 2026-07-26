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
  ChevronRight as ArrowRightIcon,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
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

function QuickActionsCard() {
  const actions = [
    { label: 'Add New Book', href: '/admin/listings' },
    { label: 'Add Banner', href: '/admin/cms' },
    { label: 'Send Announcement', href: '/admin/cms' },
    { label: 'Clear Cache', href: '/admin/settings' },
  ];

  return (
    <div className="bg-background-subtle border border-border/70 rounded-2xl p-4 space-y-3.5 font-sans mx-2">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
        <span>⚡ Quick Actions</span>
      </h4>
      <div className="space-y-2 text-[11px] font-bold text-text-secondary">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="flex items-center justify-between hover:text-[#F26522] transition-colors"
          >
            <span>{act.label}</span>
            <ArrowRightIcon className="h-3 w-3 opacity-60" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
        isActive
          ? 'bg-[#FFF5F0] dark:bg-orange-950/15 text-[#F26522] shadow-2xs font-extrabold'
          : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
      } ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? item.name : undefined}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#F26522]' : 'text-text-muted'}`} />
      {!collapsed && <span className="truncate flex-grow">{item.name}</span>}
      {!collapsed && item.badge && (
        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FFF5F0] dark:bg-orange-950/20 text-[#F26522]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  return (
    <aside
      className={`relative bg-card border-r border-border/80 flex flex-col transition-all duration-300 z-30 font-sans ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/80">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="font-serif text-lg font-bold text-text-primary tracking-tight">BookFry</span>
            <span className="text-[9px] font-black uppercase tracking-wider bg-[#F26522] text-white px-2 py-0.5 rounded-md">
              ADMIN
            </span>
          </Link>
        )}
        {collapsed && (
          <span className="font-serif text-lg font-bold text-brand mx-auto">BF</span>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-background-subtle text-text-muted hover:text-text-primary transition-colors hidden sm:block"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Lists */}
      <div className="flex-grow overflow-y-auto py-4 px-3 space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <h4 className="text-[9px] font-black uppercase tracking-wider text-text-muted px-3 mb-2">
                {group.title}
              </h4>
            )}

            {group.items.map((item) => (
              <SidebarItem key={item.name} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}

        {/* Quick Actions Panel */}
        {!collapsed && <QuickActionsCard />}
      </div>

      {/* Footer Storefront Toggle link */}
      <div className="p-3 border-t border-border/80">
        <Link
          href="/"
          className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-background-subtle hover:text-[#F26522] transition-colors ${
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
