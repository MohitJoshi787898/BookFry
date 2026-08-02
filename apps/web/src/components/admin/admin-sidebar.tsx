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
  Sparkles,
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
    { label: 'Platform Settings', href: '/admin/settings' },
  ];

  return (
    <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 space-y-3 font-sans mx-1 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#F26522]" />
          <span>Quick Actions</span>
        </h4>
      </div>
      <div className="space-y-2 text-[11px] font-semibold text-muted-foreground">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="flex items-center justify-between hover:text-[#F26522] transition-colors py-0.5 active:scale-95"
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
      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
        isActive
          ? 'bg-[#F26522]/10 text-[#F26522] font-black border-l-4 border-[#F26522] shadow-xs'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      } ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? item.name : undefined}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#F26522]' : 'text-muted-foreground'}`} />
      {!collapsed && <span className="truncate flex-grow">{item.name}</span>}
      {!collapsed && item.badge && (
        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F26522]/15 text-[#F26522] border border-[#F26522]/20">
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
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/80 bg-background/50">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#1A3B5C] to-[#F26522] flex items-center justify-center text-white font-serif font-black text-sm shadow-md">
              BF
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base font-extrabold text-foreground leading-tight tracking-tight">BookFry</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#F26522]">ADMIN PANEL</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1A3B5C] to-[#F26522] flex items-center justify-center text-white font-serif font-black text-sm shadow-md mx-auto">
            BF
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all hidden sm:block active:scale-95"
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Lists */}
      <div className="flex-grow overflow-y-auto py-4 px-3 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!collapsed && (
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 px-3.5 mb-2">
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
      <div className="p-3 border-t border-border/80 bg-background/30">
        <Link
          href="/"
          className={`flex items-center space-x-2.5 p-3 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-[#F26522] transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Back to Customer Storefront"
        >
          <Store className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          {!collapsed && <span>Back to Storefront</span>}
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
