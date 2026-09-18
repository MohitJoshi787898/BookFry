"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Heart,
  Bell,
  Store,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { DashboardAvatar, LogoutConfirmDialog } from "@/components/dashboard-nav";

interface NavbarProfileMenuProps {
  className?: string;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function NavbarProfileMenu({
  className = "",
  theme,
  onToggleTheme,
}: NavbarProfileMenuProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className={`flex items-center gap-2 shrink-0 ${className}`}>
        <button
          type="button"
          onClick={() => openModal("login")}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => openModal("signup")}
          className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-black shadow-2xs hover:bg-secondary/90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Join free
        </button>
      </div>
    );
  }

  const isSeller = user.roles?.includes("seller");
  const isAdmin = user.roles?.includes("admin");

  const roleBadges: { label: string; color: string }[] = [];
  if (isAdmin) {
    roleBadges.push({ label: "Admin", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20" });
  }
  if (isSeller) {
    roleBadges.push({ label: "Seller", color: "text-secondary bg-secondary/10 border border-secondary/20" });
  }
  roleBadges.push({ label: "Student", color: "text-muted-foreground bg-muted border border-border" });

  const buyerLinks = [
    { label: "Orders & deliveries", href: "/account/orders", icon: Package },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
    { label: "Saved addresses", href: "/account/profile", icon: MapPin },
  ];

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account menu"
        className={`group flex items-center gap-2 py-1 pl-1 pr-2 rounded-full border transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
          isOpen
            ? "bg-muted border-border"
            : "bg-transparent hover:bg-muted/60 border-transparent"
        }`}
      >
        <DashboardAvatar user={user} size="xs" />
        <span className="hidden sm:block text-xs font-semibold text-foreground max-w-[100px] truncate">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[280px] rounded-2xl bg-card border border-border shadow-xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
          {/* Identity */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <DashboardAvatar user={user} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {roleBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-border mx-4" />

          {/* Role portals — understated, not colored cards */}
          {(isSeller || isAdmin) && (
            <div className="py-1.5">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-2.5 pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-danger hover:bg-danger/5 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-muted-foreground group-hover:text-danger shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    Admin control center
                  </span>
                </Link>
              )}
              {isSeller && (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-2.5 pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-secondary hover:bg-secondary/5 transition-colors"
                >
                  <Store className="w-4 h-4 text-muted-foreground group-hover:text-secondary shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    Seller hub
                  </span>
                </Link>
              )}
              <div className="h-px bg-border mx-4 mt-1.5" />
            </div>
          )}

          {/* Buyer links */}
          <div className="py-1.5">
            {buyerLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-secondary hover:bg-muted/60 transition-colors"
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="h-px bg-border mx-4" />

          {/* Support & preferences */}
          <div className="py-1.5">
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-secondary hover:bg-muted/60 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground">
                Help center
              </span>
            </Link>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full group flex items-center justify-between pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-secondary hover:bg-muted/60 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="h-px bg-border mx-4" />

          {/* Sign out */}
          <div className="py-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsLogoutOpen(true);
              }}
              className="group w-full flex items-center gap-2.5 pl-4 pr-4 py-2 border-l-2 border-transparent hover:border-danger hover:bg-danger/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-danger shrink-0" />
              <span className="text-xs font-medium text-foreground group-hover:text-danger">
                Sign out
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={user?.name}
      />
    </div>
  );
}

export default NavbarProfileMenu;
