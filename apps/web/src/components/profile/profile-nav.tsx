"use client";

import React from "react";
import Link from "next/link";
import { User as UserIcon, MapPin, ShoppingBag, Heart, Bell, Shield, CreditCard, LogOut, ChevronRight } from "lucide-react";

export type ActiveSection = "overview" | "addresses" | "orders" | "wishlist" | "notifications" | "security" | "payment";

interface ProfileNavProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  onLogout: () => void;
}

export function ProfileNav({ activeSection, onSelectSection, onLogout }: ProfileNavProps) {
  const navSections = [
    { id: "overview" as ActiveSection, icon: <UserIcon className="h-4 w-4" />, label: "Profile Overview" },
    { id: "addresses" as ActiveSection, icon: <MapPin className="h-4 w-4" />, label: "Shipping Addresses" },
    { id: "orders" as ActiveSection, icon: <ShoppingBag className="h-4 w-4" />, label: "My Orders", href: "/account/orders" },
    { id: "wishlist" as ActiveSection, icon: <Heart className="h-4 w-4" />, label: "Wishlist", href: "/account/wishlist" },
    { id: "notifications" as ActiveSection, icon: <Bell className="h-4 w-4" />, label: "Notifications", href: "/account/notifications" },
    { id: "security" as ActiveSection, icon: <Shield className="h-4 w-4" />, label: "Security & Login" },
    { id: "payment" as ActiveSection, icon: <CreditCard className="h-4 w-4" />, label: "Payment Methods" },
  ];

  return (
    <>
      {/* Mobile Segmented Pill Tab Switcher (sm:hidden) */}
      <div className="block md:hidden overflow-x-auto scrollbar-none pb-2 mb-4 -mx-1 px-1">
        <div className="flex items-center gap-2 min-w-max">
          {navSections.map((s) => {
            const isActive = activeSection === s.id && !s.href;

            if (s.href) {
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
                >
                  {s.icon}
                  <span>{s.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={s.id}
                onClick={() => onSelectSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-sm active:scale-95 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md border border-primary"
                    : "bg-card text-muted-foreground border border-border/80 hover:text-foreground"
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation (md:block) */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0">
        <div className="rounded-3xl border border-border/80 bg-card p-3 shadow-xl space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 py-2 block">
            Account Management
          </span>

          {navSections.map((s) => {
            const isActive = activeSection === s.id && !s.href;

            if (s.href) {
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 w-full text-left active:scale-98"
                >
                  <span className="text-secondary">{s.icon}</span>
                  <span className="flex-1">{s.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            }

            return (
              <button
                key={s.id}
                onClick={() => onSelectSection(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 w-full text-left active:scale-98 ${
                  isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={isActive ? "text-amber-300" : "text-secondary"}>{s.icon}</span>
                <span className="flex-1">{s.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border/60">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all w-full text-left active:scale-98"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
