"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModalStore } from "@/stores/auth-modal.store";
import { useCartStore } from "@/stores/cart.store";
import { useWishlist } from "@/hooks/use-wishlist";
import { apiClient } from "@/lib/api-client";
import { AnnouncementBar } from "./announcement-bar";
import { BookFryLogo } from "../navbar/logo";
import { SearchBar } from "../navbar/search-bar";
import { CategoryScroll } from "../navbar/category-scroll";
import { NavIconButton } from "../shared/nav-icon-button";
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
  Grid,
  Store,
} from "lucide-react";

const categorySubnav = [
  { name: "Fiction", href: "/books?category=fiction" },
  { name: "Non-Fiction", href: "/books?category=non-fiction" },
  { name: "Teens & YA", href: "/books?category=teens-ya" },
  { name: "Kids", href: "/books?category=kids" },
  { name: "Exam Prep", href: "/books?category=exams" },
  { name: "Engineering", href: "/books?category=engineering" },
  { name: "Medical", href: "/books?category=medical" },
  { name: "Management", href: "/books?category=management" },
  { name: "Competitive Exams", href: "/books?category=competitive-exams" },
  { name: "Today's Deals", href: "/books?discount=40", isHighlight: true },
];

/** Shared pill styling for "All Categories" / "Become a Seller" outline
 *  buttons — previously each instance re-typed border/bg hex by hand. */
const outlinePillClass =
  "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-4 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-secondary/10";

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { count: wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCart(isAuthenticated);
    }
  }, [isAuthenticated, fetchCart, mounted]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
  };

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      router.push("/");
      router.refresh();
    }
  };

  const guardWishlist = (e: React.MouseEvent) => {
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

      {/* glass-header is already defined in globals.css (blur + translucent bg) —
          reused here instead of re-declaring bg-background/90 backdrop-blur-md */}
      <header className="glass-header sticky top-0 z-50 w-full border-b border-border transition-colors duration-200">
        {/* ---------------------------------------------------------------
            DESKTOP HEADER
           --------------------------------------------------------------- */}
        <div className="mx-auto hidden max-w-7xl px-4 py-3.5 sm:px-6 lg:block lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <BookFryLogo />
            <SearchBar variant="desktop" className="mx-2 flex-1" />

            <div className="flex shrink-0 items-center gap-1.5">
              <NavIconButton
                icon={theme === "light" ? Moon : Sun}
                label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                onClick={toggleTheme}
                showLabel
              />
              <NavIconButton
                icon={Heart}
                label="Wishlist"
                href="/account/wishlist"
                onClick={guardWishlist}
                badgeCount={wishlistCount}
                showLabel
              />
              <NavIconButton
                icon={ShoppingCart}
                label="Cart"
                href="/cart"
                badgeCount={cartCount}
                showLabel
              />

              <div className="ml-2 h-6 w-px bg-border" aria-hidden="true" />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {user.roles.includes("admin") && (
                    <Link
                      href="/admin/dashboard"
                      aria-label="Admin dashboard"
                      className="focus-ring rounded-lg p-2 text-secondary transition-opacity hover:opacity-85"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                  <Link
                    href="/account/profile"
                    className="focus-ring flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-text-primary transition-colors hover:bg-background-subtle"
                  >
                    <UserIcon
                      className="h-4 w-4 text-text-muted"
                      aria-hidden="true"
                    />
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="focus-ring rounded-full p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/sell"
                    onClick={(e) => {
                      if (!isAuthenticated) {
                        e.preventDefault();
                        useAuthModalStore
                          .getState()
                          .openModal("login", "/sell");
                      }
                    }}
                    className="focus-ring flex items-center gap-1.5 rounded-xl border border-secondary bg-secondary/5 px-4 py-2 text-xs font-extrabold text-secondary transition-colors hover:bg-secondary/10"
                  >
                    <Store className="h-4 w-4" aria-hidden="true" />
                    <span>Become a seller</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      useAuthModalStore.getState().openModal("login")
                    }
                    className="focus-ring flex items-center gap-1.5 rounded-xl bg-secondary px-5 py-2.5 text-xs font-extrabold text-secondary-foreground shadow-xs transition-colors hover:bg-secondary/90"
                  >
                    <UserIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Login / Sign up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------
            TABLET HEADER
           --------------------------------------------------------------- */}
        <div className="mx-auto hidden max-w-7xl px-6 py-3.5 md:block lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="focus-ring rounded-md p-2 text-text-secondary hover:bg-background-subtle"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <BookFryLogo />
            </div>

            <SearchBar variant="tablet" className="w-80" />

            <div className="flex items-center gap-1.5">
              <NavIconButton
                icon={Heart}
                label="Wishlist"
                href="/account/wishlist"
                onClick={guardWishlist}
              />
              <NavIconButton
                icon={ShoppingCart}
                label="Cart"
                href="/cart"
                badgeCount={cartCount}
              />
              <Link href="/sell" className={outlinePillClass}>
                Become a seller
              </Link>
              <NavIconButton
                icon={UserIcon}
                label={isAuthenticated ? "My profile" : "Sign in"}
                href={isAuthenticated ? "/account/profile" : "/login"}
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------
            MOBILE HEADER + SEARCH
           --------------------------------------------------------------- */}
        <div className="mx-auto max-w-7xl px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="focus-ring rounded-md p-2 text-text-secondary hover:bg-background-subtle"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <BookFryLogo />
            <div className="flex items-center gap-1">
              <NavIconButton
                icon={Heart}
                label="Wishlist"
                href="/account/wishlist"
                onClick={guardWishlist}
              />
              <NavIconButton
                icon={ShoppingCart}
                label="Cart"
                href="/cart"
                badgeCount={cartCount}
              />
              <NavIconButton
                icon={UserIcon}
                label={isAuthenticated ? "My profile" : "Sign in"}
                href={isAuthenticated ? "/account/profile" : "/login"}
              />
            </div>
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <SearchBar variant="mobile" className="w-full" />
        </div>

        {/* ---------------------------------------------------------------
            DESKTOP CATEGORY BAR — bg-[#FAFAFA]/bg-[#0E1726] replaced with
            the existing bg-background-subtle token so it tracks light/dark
            mode automatically instead of a manually paired hex pair
           --------------------------------------------------------------- */}
        <nav className="hidden w-full border-t border-border/80 bg-background-subtle px-8 py-2.5 font-sans text-xs font-semibold text-text-secondary lg:flex">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/books" className={outlinePillClass}>
                <Grid className="h-3.5 w-3.5" aria-hidden="true" />
                <span>All categories</span>
              </Link>

              {categorySubnav.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`focus-ring whitespace-nowrap rounded-md px-1 py-0.5 transition-colors hover:text-secondary ${
                    cat.isHighlight
                      ? "flex items-center font-extrabold text-secondary"
                      : "font-medium text-text-secondary"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.isHighlight && (
                    <span
                      className="ml-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ))}
            </div>

            <Link
              href="/sell"
              className="focus-ring flex items-center gap-1.5 rounded-md px-1 py-0.5 font-bold text-text-primary transition-colors hover:text-secondary"
            >
              <span>Sell books</span>
            </Link>
          </div>
        </nav>

        <CategoryScroll screen="tablet" className="hidden md:flex lg:hidden" />
        <CategoryScroll screen="mobile" className="flex md:hidden" />

        {/* ---------------------------------------------------------------
            MOBILE SLIDE-DOWN DRAWER — theme toggle added here since it was
            previously only reachable on desktop
           --------------------------------------------------------------- */}
        {mobileMenuOpen && (
          <div className="animate-in slide-in-from-top space-y-4 border-t border-border bg-card p-4 font-sans shadow-lg duration-200 lg:hidden">
            <div className="divide-y divide-border text-sm font-medium">
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between py-1">
                  <Link
                    href="/books"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-1 items-center justify-between py-2 font-bold text-text-primary"
                  >
                    <span>Browse all books</span>
                    <ChevronRight
                      className="h-4 w-4 text-text-muted"
                      aria-hidden="true"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={
                      theme === "light"
                        ? "Switch to dark mode"
                        : "Switch to light mode"
                    }
                    className="focus-ring rounded-lg p-2 text-text-secondary hover:text-secondary"
                  >
                    {theme === "light" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {categorySubnav.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-text-secondary hover:text-secondary"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/sell"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 font-bold text-secondary"
                >
                  Sell books
                </Link>
              </div>

              <div className="pt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 font-medium text-text-primary"
                    >
                      <UserIcon className="h-4 w-4" aria-hidden="true" />
                      <span>My profile ({user?.name})</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 py-2 text-left font-bold text-danger"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Log out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      useAuthModalStore.getState().openModal("login");
                    }}
                    className="focus-ring w-full rounded-xl border border-border py-2 text-center text-sm font-bold"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default Navbar;
