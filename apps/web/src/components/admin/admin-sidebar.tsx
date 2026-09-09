"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
  ArrowRight,
  Activity,
} from "lucide-react";

export interface AdminSidebarProps {
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
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Financial Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Marketplace",
    items: [
      {
        name: "Book Listings",
        href: "/admin/listings",
        icon: BookOpen,
        badge: "Queue",
      },
      { name: "Orders & Refunds", href: "/admin/orders", icon: ShoppingBag },
      {
        name: "Used Book Leads",
        href: "/admin/requests",
        icon: MessageSquare,
        badge: "P2P",
      },
      { name: "Categories Taxonomy", href: "/admin/categories", icon: Layers },
      { name: "Promotions & Coupons", href: "/admin/promotions", icon: Tag },
      { name: "Reviews Moderation", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "People",
    items: [
      { name: "Users & Sellers", href: "/admin/users", icon: Users },
      {
        name: "Support Helpdesk",
        href: "/admin/support",
        icon: MessageSquare,
        badge: "Tickets",
      },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Storefront CMS", href: "/admin/cms", icon: FileText },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

function QuickActionsCard() {
  const actions = [
    { label: "Moderate Listings", href: "/admin/listings" },
    { label: "Manage Banners", href: "/admin/cms" },
    { label: "Issue Coupon", href: "/admin/promotions" },
    { label: "Platform Settings", href: "/admin/settings" },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/80 p-3 shadow-xs backdrop-blur-sm">
      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-secondary/80 to-transparent" />
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-foreground">
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-md bg-secondary/12 text-secondary">
            <Sparkles className="h-3 w-3" />
          </span>
          Quick Shortcuts
        </div>
      </div>

      <div className="space-y-1">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center justify-between rounded-lg border border-transparent px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted/80 hover:text-foreground"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-secondary" />
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
    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
        collapsed ? "justify-center px-2 py-2" : ""
      } ${
        isActive
          ? "bg-gradient-to-r from-primary/5 via-primary/5 to-secondary/8 text-foreground shadow-[inset_0_1px_0_hsl(var(--card)),0_8px_20px_hsl(var(--shadow-color)/0.06)] ring-1 ring-primary/10 font-bold"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
      title={collapsed ? item.name : undefined}
    >
      {isActive && !collapsed && (
        <span className="absolute inset-y-1.5 left-1 w-1 rounded-full bg-secondary" />
      )}
      <span
        className={`relative flex h-7.5 w-7.5 items-center justify-center rounded-lg border transition-all duration-200 shrink-0 ${
          isActive
            ? "border-secondary/25 bg-secondary/15 text-secondary shadow-xs"
            : "border-transparent bg-muted/50 text-muted-foreground group-hover:border-border group-hover:bg-muted group-hover:text-foreground"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.name}</span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col h-full max-h-screen min-h-0 shrink-0 border-r border-border/80 bg-gradient-to-b from-card via-card to-muted/80 backdrop-blur-lg transition-all duration-300 ease-out z-30 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Brand Header — Fixed Top */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-4 py-3.5">
          {!collapsed ? (
            <Link
              href="/admin/dashboard"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-xs shrink-0">
                <Image
                  src="/assets/bookfry/bookfry-fox-pointing.webp"
                  alt="BookFry Mascot"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-black tracking-[-0.02em] text-foreground">
                  BookFry
                </div>
                <div className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-secondary">
                  Admin Console
                </div>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-xs">
              <Image
                src="/assets/bookfry/bookfry-fox-pointing.webp"
                alt="BookFry Mascot"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 bg-background/70 text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground active:scale-[0.98] cursor-pointer"
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-2.5 py-3 [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-0.5 pt-0.5 text-[8.5px] font-black uppercase tracking-[0.18em] text-muted-foreground/80">
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

          {!collapsed && <QuickActionsCard />}
        </div>

        {/* Brand Footer — Fixed Bottom */}
        <div className="shrink-0 border-t border-border/80 bg-background/40 px-2.5 py-2.5">
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
              <Activity className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>Telemetry Online</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/80 hover:text-foreground ${
              collapsed ? "justify-center px-2" : ""
            }`}
            title="Back to Customer Storefront"
          >
            <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 bg-muted/60 text-muted-foreground shrink-0">
              <Store className="h-3.5 w-3.5" />
            </span>
            {!collapsed && <span>Storefront View</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
