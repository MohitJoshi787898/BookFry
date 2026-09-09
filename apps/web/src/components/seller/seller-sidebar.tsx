'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  CheckSquare,
  PlusCircle,
  Store,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface SellerSidebarProps {
  user?: { name?: string; email?: string; roles?: string[] } | null;
  totalListings?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  sellerOnboardingStatus?: string;
  sellerVerificationStatus?: string;
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

const sellerNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Performance & SLA', href: '/seller/performance', icon: TrendingUp },
      { name: 'Daily Checklist', href: '/seller/tasks', icon: CheckSquare, badge: 'Tasks' },
    ],
  },
  {
    title: 'Sales & Pipeline',
    items: [
      { name: 'Buyer Leads (P2P)', href: '/seller/requests', icon: MessageSquare, badge: 'Leads' },
      { name: 'Customer Orders', href: '/seller/orders', icon: ShoppingBag },
      { name: 'Earnings & Payouts', href: '/seller/earnings', icon: IndianRupee },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { name: 'Book Listings', href: '/seller/listings', icon: BookOpen },
    ],
  },
];

function SellerQuickActionsCard() {
  const actions = [
    { label: 'List a New Book', href: '/sell' },
    { label: 'Buyer P2P Leads', href: '/seller/requests' },
    { label: 'Process Orders', href: '/seller/orders' },
    { label: 'Request Payout', href: '/seller/earnings' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/80 p-3.5 shadow-sm backdrop-blur-sm">
      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-secondary/80 to-transparent" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary/12 text-secondary">
            <Sparkles className="h-3 w-3" />
          </span>
          Seller Shortcuts
        </div>
      </div>

      <div className="space-y-1.5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center justify-between rounded-xl border border-transparent px-2.5 py-2 text-[11px] font-semibold text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted/80 hover:text-foreground"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-secondary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function SidebarItem({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== '/seller/dashboard' && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
        collapsed ? 'justify-center px-2.5' : ''
      } ${
        isActive
          ? 'bg-gradient-to-r from-primary/5 via-primary/5 to-secondary/8 text-foreground shadow-[inset_0_1px_0_hsl(var(--card)),0_10px_25px_hsl(var(--shadow-color)/0.08)] ring-1 ring-primary/10'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      }`}
      title={collapsed ? item.name : undefined}
    >
      {isActive && !collapsed && (
        <span className="absolute inset-y-1.5 left-1.5 w-1 rounded-full bg-secondary" />
      )}
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200 ${
          isActive
            ? 'border-secondary/20 bg-secondary/10 text-secondary shadow-sm'
            : 'border-transparent bg-muted/50 text-muted-foreground group-hover:border-border group-hover:bg-muted group-hover:text-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.name}</span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function SellerSidebar({
  collapsed = false,
  onToggleCollapse,
  sellerOnboardingStatus,
  sellerVerificationStatus,
}: SellerSidebarProps) {
  // Compute the sidebar status label from real state — never hardcoded
  const statusConfig = (() => {
    if (sellerOnboardingStatus === 'incomplete') {
      return { label: 'Profile Incomplete', color: 'text-danger', dotColor: 'bg-danger' };
    }
    if (sellerVerificationStatus === 'pending') {
      return { label: 'Under Review', color: 'text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500' };
    }
    if (sellerVerificationStatus === 'rejected') {
      return { label: 'Action Required', color: 'text-danger', dotColor: 'bg-danger' };
    }
    if (sellerVerificationStatus === 'approved') {
      return { label: 'Verified Seller', color: 'text-emerald-600 dark:text-emerald-400', dotColor: 'bg-emerald-500' };
    }
    // not_submitted or undefined
    return { label: 'Verification Pending', color: 'text-muted-foreground', dotColor: 'bg-muted-foreground' };
  })();

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border/80 bg-gradient-to-b from-card via-card to-muted/80 backdrop-blur-lg transition-all duration-300 ease-out z-30 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="relative flex h-full flex-col">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Brand & Mascot Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-4">
          {!collapsed ? (
            <Link
              href="/seller/dashboard"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-sm">
                <Image
                  src="/assets/bookfry/bookfry-fox-pointing.webp"
                  alt="BookFry Mascot"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-black tracking-[-0.02em] text-foreground">
                  BookFry
                </div>
                <div className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-secondary">
                  Seller Hub
                </div>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-sm">
              <Image
                src="/assets/bookfry/bookfry-fox-pointing.webp"
                alt="BookFry Mascot"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-background/70 text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground active:scale-[0.98]"
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
          {!collapsed && (
            <div className="px-1">
              <Link
                href="/sell"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-secondary/20 transition-all hover:bg-secondary/90 active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>List a New Book</span>
              </Link>
            </div>
          )}

          {sellerNavGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              {!collapsed && (
                <div className="px-3 pb-1 pt-1 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/80">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => (
                <SidebarItem
                  key={item.name}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}

          {!collapsed && <SellerQuickActionsCard />}
        </div>

        {/* Footer — dynamic seller status (never hardcoded) */}
        <div className="border-t border-border/80 bg-background/40 px-2.5 py-3">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
              <span className={`h-2 w-2 rounded-full shrink-0 ${statusConfig.dotColor}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/80 hover:text-foreground ${
              collapsed ? 'justify-center px-2.5' : ''
            }`}
            title="Back to Customer Storefront"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 bg-muted/60 text-muted-foreground">
              <Store className="h-4 w-4" />
            </span>
            {!collapsed && <span>Storefront View</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default SellerSidebar;

