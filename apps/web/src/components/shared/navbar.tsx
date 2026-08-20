"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { useCartStore } from "@/stores/cart.store";
import { useWishlist } from "@/hooks/use-wishlist";
import { apiClient } from "@/lib/api-client";
import { AnnouncementBar } from "./announcement-bar";
import { MobileNav } from "./mobile-nav";
import { BookFryLogo } from "../navbar/logo";
import { SearchBar } from "../navbar/search-bar";
import { CategoryScroll } from "../navbar/category-scroll";
import {
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
  Store,
  BookOpen,
  Settings,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────
const categorySubnav = [
  { name: "All Books", href: "/books?conditionType=all" },
  { name: "New Books ⚡", href: "/books?conditionType=new" },
  { name: "Used Books 🤝", href: "/books?conditionType=used" },
  { name: "Fiction", href: "/books?category=fiction" },
  { name: "Non-Fiction", href: "/books?category=non-fiction" },
  { name: "Teens & YA", href: "/books?category=teens-ya" },
  { name: "Exam Prep", href: "/books?category=exams" },
  { name: "Engineering", href: "/books?category=engineering" },
  { name: "Medical", href: "/books?category=medical" },
  { name: "Today's Deals 🔥", href: "/books?discount=40", isHighlight: true },
];

// ──────────────────────────────────────────────────────────────────────────────
// Scroll-aware hook
// ──────────────────────────────────────────────────────────────────────────────
function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return scrolled;
}

// ──────────────────────────────────────────────────────────────────────────────
// Premium Icon Button
// ──────────────────────────────────────────────────────────────────────────────
function IconBtn({
  icon: Icon, label, href, onClick, badge, showLabel = false,
}: {
  icon: React.ElementType; label: string; href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  badge?: number; showLabel?: boolean;
}) {
  const inner = (
    <motion.span whileTap={{ scale: 0.88 }} className="relative flex flex-col items-center gap-0.5">
      <span className="relative">
        <Icon className="h-5 w-5" aria-hidden />
        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-secondary-foreground text-[9px] font-black flex items-center justify-center border-2 border-background shadow-sm">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {showLabel && <span className="text-[10px] font-extrabold leading-none">{label}</span>}
    </motion.span>
  );

  const cls = "focus-ring relative flex items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 min-w-[40px] min-h-[40px]";

  return href ? (
    <Link href={href} onClick={onClick} aria-label={label} className={cls}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>{inner}</button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Navbar Export
// ──────────────────────────────────────────────────────────────────────────────
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { count: wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const scrolled = useScrolled();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (mounted) fetchCart(isAuthenticated);
  }, [isAuthenticated, fetchCart, mounted]);

  // Trap focus + ESC for drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    try { await apiClient("/auth/logout", { method: "POST" }); } catch {}
    finally { clearAuth(); router.push("/"); router.refresh(); }
  };

  const guardWishlist = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      useAuthModalStore.getState().openModal("login", "/account/wishlist");
    }
  };

  if (!mounted) return null;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="w-full">
      <AnnouncementBar />

      {/* ──────────────────────── HEADER ──────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${
          scrolled
            ? "glass-header border-b border-border/80 shadow-sm"
            : "glass-header border-b border-border/60"
        }`}
      >
        {/* ── Desktop (lg+) ──────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-4 px-8 xl:px-12 h-16 w-full max-w-screen-2xl mx-auto">
          {/* Logo */}
          <BookFryLogo />

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <SearchBar variant="desktop" className="w-full" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme toggle */}
            <IconBtn
              icon={theme === "light" ? Moon : Sun}
              label={theme === "light" ? "Dark mode" : "Light mode"}
              onClick={toggleTheme}
            />

            {/* Wishlist */}
            <IconBtn
              icon={Heart}
              label="Wishlist"
              href="/account/wishlist"
              onClick={guardWishlist}
              badge={wishlistCount}
            />

            {/* Cart */}
            <IconBtn icon={ShoppingCart} label="Cart" href="/cart" badge={cartCount} />

            <div className="w-px h-5 bg-border mx-1" aria-hidden />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {user.roles.includes("admin") && (
                  <Link
                    href="/admin/dashboard"
                    aria-label="Admin dashboard"
                    className="focus-ring rounded-xl p-2.5 text-secondary hover:bg-secondary/10 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/account/profile"
                  className="focus-ring flex items-center gap-2 rounded-2xl border border-border bg-card hover:bg-muted px-3.5 py-2 text-xs font-extrabold text-foreground transition-all"
                >
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="focus-ring rounded-xl p-2.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/sell"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      useAuthModalStore.getState().openModal("login", "/sell");
                    }
                  }}
                  className="focus-ring flex items-center gap-1.5 rounded-2xl border border-secondary/40 bg-secondary/5 hover:bg-secondary/10 px-4 py-2 text-xs font-extrabold text-secondary transition-all"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Sell Books</span>
                </Link>
                <button
                  type="button"
                  onClick={() => useAuthModalStore.getState().openModal("login")}
                  className="focus-ring flex items-center gap-1.5 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2.5 text-xs font-extrabold shadow-sm transition-all active:scale-95"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Login / Sign up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Tablet (md → lg) ───────────────────────────────────────── */}
        <div className="hidden md:flex lg:hidden items-center gap-3 px-5 h-14 w-full">
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-muted transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BookFryLogo />
          <div className="flex-1 min-w-0">
            <SearchBar variant="tablet" className="w-full" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <IconBtn icon={Heart} label="Wishlist" href="/account/wishlist" onClick={guardWishlist} badge={wishlistCount} />
            <IconBtn icon={ShoppingCart} label="Cart" href="/cart" badge={cartCount} />
            <IconBtn
              icon={isAuthenticated ? UserIcon : UserIcon}
              label={isAuthenticated ? "My profile" : "Sign in"}
              href={isAuthenticated ? "/account/profile" : undefined}
              onClick={!isAuthenticated ? () => useAuthModalStore.getState().openModal("login") : undefined}
            />
          </div>
        </div>

        {/* ── Mobile (< md) ──────────────────────────────────────────── */}
        <div className="flex md:hidden flex-col w-full">
          {/* Top Row */}
          <div className="flex items-center justify-between px-4 h-14">
            {/* Menu + Logo */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => setDrawerOpen(!drawerOpen)}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                aria-expanded={drawerOpen}
                className="focus-ring h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-all"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {drawerOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <BookFryLogo />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-0.5">
              <IconBtn icon={Heart} label="Wishlist" href="/account/wishlist" onClick={guardWishlist} badge={wishlistCount} />
              <IconBtn icon={ShoppingCart} label="Cart" href="/cart" badge={cartCount} />
              {isAuthenticated ? (
                <Link href="/account/profile" aria-label="My profile" className="focus-ring h-9 w-9 flex items-center justify-center rounded-xl">
                  <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center ring-2 ring-primary/20">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                </Link>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => useAuthModalStore.getState().openModal("login")}
                  className="focus-ring h-8 px-3 bg-secondary text-secondary-foreground text-[11px] font-extrabold rounded-xl ml-1 active:scale-95 transition-all"
                >
                  Login
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="px-4 pb-3">
            <SearchBar variant="mobile" className="w-full" />
          </div>
        </div>

        {/* ── Desktop Category Bar ────────────────────────────────────── */}
        <nav
          aria-label="Book categories"
          className="hidden lg:flex w-full border-t border-border/60 bg-muted/50 dark:bg-muted/30 px-8 xl:px-12 h-10 items-center gap-0 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-1 w-full max-w-screen-2xl mx-auto">
            {categorySubnav.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`whitespace-nowrap px-3 h-8 flex items-center rounded-lg text-xs font-bold transition-all hover:bg-background focus-ring ${
                  cat.isHighlight
                    ? "text-secondary font-extrabold hover:text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </Link>
            ))}
            <div className="flex-1" />
            <Link
              href="/sell"
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-extrabold text-secondary hover:bg-secondary/10 transition-all whitespace-nowrap shrink-0"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Sell Books</span>
            </Link>
          </div>
        </nav>

        {/* ── Tablet + Mobile Category Scroll ────────────────────────── */}
        <CategoryScroll screen="tablet" className="hidden md:flex lg:hidden" />
        <CategoryScroll screen="mobile" className="flex md:hidden" />
      </header>

      {/* ──────────────────── MOBILE DRAWER ───────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />

            {/* Drawer Panel */}
            <motion.div
              ref={drawerRef}
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[300px] sm:w-[340px] bg-background border-r border-border/80 overflow-y-auto flex flex-col lg:hidden shadow-2xl"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
                <BookFryLogo />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="focus-ring h-9 w-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* ── Auth Section ─────────────────────────────────────── */}
              {isAuthenticated && user ? (
                <div className="px-5 py-4 border-b border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground text-lg font-black flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      { label: "My Orders", href: "/account/orders", icon: Package },
                      { label: "Profile", href: "/account/profile", icon: UserIcon },
                      { label: "Wishlist", href: "/account/wishlist", icon: Heart },
                      { label: "Settings", href: "/account/profile", icon: Settings },
                    ].map(({ label, href, icon: Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-border hover:border-primary/30 hover:bg-muted text-xs font-bold text-foreground transition-all"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-5 border-b border-border bg-card space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-foreground">Welcome to BookFry</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Sign in to access your account</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setDrawerOpen(false); useAuthModalStore.getState().openModal("login"); }}
                      className="h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDrawerOpen(false); useAuthModalStore.getState().openModal("signup"); }}
                      className="h-11 border border-border bg-background hover:bg-muted text-foreground font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {/* ── Navigation Links ─────────────────────────────────── */}
              <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {/* Quick Actions */}
                <div className="flex gap-2 px-2 py-1">
                  <Link
                    href="/sell"
                    onClick={(e) => {
                      setDrawerOpen(false);
                      if (!isAuthenticated) {
                        e.preventDefault();
                        useAuthModalStore.getState().openModal("login", "/sell");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-primary text-primary-foreground rounded-2xl text-xs font-extrabold transition-all active:scale-95"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Sell Books
                  </Link>
                  <Link
                    href="/books?discount=40"
                    onClick={() => setDrawerOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-secondary/10 border border-secondary/30 text-secondary rounded-2xl text-xs font-extrabold transition-all active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Today&apos;s Deals
                  </Link>
                </div>

                {/* Browse All */}
                <DrawerNavItem
                  icon={BookOpen}
                  label="Browse All Books"
                  href="/books"
                  onClose={() => setDrawerOpen(false)}
                />
                <DrawerNavItem
                  icon={TrendingUp}
                  label="Trending Now"
                  href="/books?sort=trending"
                  onClose={() => setDrawerOpen(false)}
                />

                {/* Categories */}
                <div className="pt-2 pb-1 px-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Categories</p>
                </div>

                {categorySubnav.filter((c) => !c.isHighlight).map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-foreground hover:bg-muted transition-all group"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>

              {/* ── Footer Controls ──────────────────────────────────── */}
              <div className="px-5 py-4 border-t border-border space-y-2 shrink-0">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-muted border border-border text-sm font-bold text-foreground hover:bg-card transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === "light" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-secondary" />}
                    {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  </span>
                  <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all ${theme === "dark" ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"}`}>
                    <div className="h-4 w-4 rounded-full bg-background shadow-sm" />
                  </div>
                </button>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-danger hover:bg-danger/5 border border-transparent hover:border-danger/20 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Drawer Nav Item sub-component
// ──────────────────────────────────────────────────────────────────────────────
function DrawerNavItem({
  icon: Icon, label, href, onClose,
}: { icon: React.ElementType; label: string; href: string; onClose: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-all group"
    >
      <span className="flex items-center gap-3">
        <span className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
        </span>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default Navbar;
