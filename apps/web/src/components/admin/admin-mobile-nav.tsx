"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export function AdminMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Listings", href: "/admin/listings", icon: BookOpen },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Promotions", href: "/admin/promotions", icon: Tag },
    { name: "CMS", href: "/admin/cms", icon: FileText },
    { name: "Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Support", href: "/admin/support", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="block md:hidden overflow-x-auto scrollbar-none pb-2 mb-6 -mx-1 px-1 font-sans">
      <div className="flex items-center gap-2 min-w-max">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-sm active:scale-95 ${
                isActive
                  ? "bg-[#1A3B5C] text-white shadow-md shadow-[#1A3B5C]/20 border border-[#1A3B5C]"
                  : "bg-card text-muted-foreground border border-border/80 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-secondary"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
