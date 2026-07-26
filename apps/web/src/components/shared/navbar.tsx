'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import { AnnouncementBar } from './announcement-bar';
import { BookFryLogo } from '../navbar/logo';
import { SearchBar } from '../navbar/search-bar';
import { CategoryScroll } from '../navbar/category-scroll';
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
} from 'lucide-react';

const categorySubnav = [
  { name: 'Fiction', href: '/books?category=fiction' },
  { name: 'Non-Fiction', href: '/books?category=non-fiction' },
  { name: 'Teens & YA', href: '/books?category=teens-ya' },
  { name: 'Kids', href: '/books?category=kids' },
  { name: 'Exam Prep', href: '/books?category=exams' },
  { name: 'Engineering', href: '/books?category=engineering' },
  { name: 'Medical', href: '/books?category=medical' },
  { name: 'Management', href: '/books?category=management' },
  { name: 'Competitive Exams', href: '/books?category=competitive-exams' },
  { name: "Today's Deals", href: '/books?discount=40', isHighlight: true },
];

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCart(isAuthenticated);
    }
  }, [isAuthenticated, fetchCart, mounted]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      router.push('/');
      router.refresh();
    }
  };

  if (!mounted) return null;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="w-full">
      <AnnouncementBar />

      <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-[#0B1320]/95 backdrop-blur-md transition-colors duration-200">
        {/* DESKTOP HEADER (Large screens) */}
        <div className="hidden lg:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <BookFryLogo />
            <SearchBar variant="desktop" className="mx-8" />
            
            {/* Desktop Actions */}
            <div className="flex items-center space-x-6">
              {/* Theme/Dark Toggle */}
              <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center p-1 text-text-secondary hover:text-[#F26522] transition-colors focus:outline-none shrink-0"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="text-[10px] font-bold text-text-secondary mt-1">Dark</span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    useAuthModalStore.getState().openModal('login', '/account/wishlist');
                  }
                }}
                className="flex flex-col items-center justify-center p-1 text-text-secondary hover:text-[#F26522] transition-colors shrink-0"
              >
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-bold text-text-secondary mt-1">Wishlist</span>
              </Link>

              {/* Cart Link */}
              <Link
                href="/cart"
                className="relative flex flex-col items-center justify-center p-1 text-text-secondary hover:text-[#F26522] transition-colors shrink-0"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#F26522] text-[9px] font-extrabold text-white border border-white dark:border-[#0B1320] shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-text-secondary mt-1">Cart</span>
              </Link>

              {/* Auth actions / controls */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 shrink-0">
                  {user.roles.includes('admin') && (
                    <Link
                      href="/admin/dashboard"
                      className="text-xs font-bold text-[#F26522] hover:opacity-85 transition-opacity uppercase tracking-wider flex items-center gap-1"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    href="/account/profile"
                    className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-bold border border-border hover:bg-background-subtle transition-colors text-text-primary bg-background"
                  >
                    <UserIcon className="h-4 w-4 text-text-muted" />
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-full p-2 text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors focus:outline-none"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 shrink-0">
                  <Link
                    href="/sell"
                    onClick={(e) => {
                      if (!isAuthenticated) {
                        e.preventDefault();
                        useAuthModalStore.getState().openModal('login', '/sell');
                      }
                    }}
                    className="border border-[#F26522] text-[#F26522] hover:bg-[#F26522]/5 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all bg-[#FEF8F3] dark:bg-transparent"
                  >
                    <Store className="h-4 w-4" />
                    <span>Become a Seller</span>
                  </Link>
                  <button
                    onClick={() => useAuthModalStore.getState().openModal('login')}
                    className="bg-[#F26522] hover:bg-[#e05310] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Login / Sign up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLET HEADER (Medium screens) */}
        <div className="hidden md:block lg:hidden mx-auto max-w-7xl px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-text-secondary hover:bg-background-subtle"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <BookFryLogo />
            </div>

            <SearchBar variant="tablet" className="w-80" />

            <div className="flex items-center space-x-4">
              <Link href="/account/wishlist" className="p-2 text-text-secondary hover:text-[#F26522] relative">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/cart" className="p-2 text-text-secondary hover:text-[#F26522] relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F26522] text-[9px] font-extrabold text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/sell"
                className="border border-[#F26522]/30 bg-[#FEF8F3] dark:bg-transparent text-[#F26522] font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#FFF5F0] transition-colors"
              >
                Become a Seller
              </Link>
              <Link href={isAuthenticated ? "/account/profile" : "/login"} className="p-2 text-text-secondary hover:text-[#F26522]">
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER (Small screens) */}
        <div className="md:hidden mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-secondary hover:bg-background-subtle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <BookFryLogo />
            
            <div className="flex items-center space-x-3">
              <Link href="/account/wishlist" className="p-2 text-text-secondary hover:text-[#F26522] relative">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/cart" className="p-2 text-text-secondary hover:text-[#F26522] relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F26522] text-[9px] font-extrabold text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href={isAuthenticated ? "/account/profile" : "/login"} className="p-2 text-text-secondary hover:text-[#F26522]">
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH BAR (below mobile header) */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar variant="mobile" className="w-full" />
        </div>

        {/* DESKTOP CATEGORY BAR (Large screens) */}
        <nav className="hidden lg:flex items-center border-t border-border/80 bg-[#FAFAFA] dark:bg-[#0E1726]/50 py-2.5 px-8 font-sans text-xs font-semibold text-text-secondary w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              {/* All Categories Toggle pill */}
              <Link
                href="/books"
                className="border border-[#F26522]/30 text-[#F26522] bg-[#FEF8F3] dark:bg-transparent px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#FFF5F0] transition-colors"
              >
                <Grid className="h-3.5 w-3.5" />
                <span>All Categories</span>
              </Link>

              {/* Subnav links */}
              {categorySubnav.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`transition-colors whitespace-nowrap hover:text-secondary ${
                    cat.isHighlight ? 'text-[#F26522] font-extrabold flex items-center' : 'text-text-secondary font-medium'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.isHighlight && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F26522] ml-1 shrink-0" />}
                </Link>
              ))}
            </div>

            {/* Sell Books Link */}
            <Link
              href="/sell"
              className="flex items-center gap-1.5 text-text-primary hover:text-[#F26522] font-bold transition-colors"
            >
              <span>Sell Books</span>
            </Link>
          </div>
        </nav>

        {/* TABLET CATEGORY ROW */}
        <CategoryScroll screen="tablet" className="hidden md:flex lg:hidden" />

        {/* MOBILE CATEGORY ROW */}
        <CategoryScroll screen="mobile" className="flex md:hidden" />

        {/* Mobile slide-down drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200 font-sans">
            <div className="space-y-1 text-sm font-medium divide-y divide-border">
              <div className="py-2 space-y-2">
                <Link
                  href="/books"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-between items-center py-2 text-text-primary font-bold"
                >
                  <span>Browse All Books</span>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </Link>
                {categorySubnav.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 text-text-secondary hover:text-brand"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              
              <div className="pt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 text-text-primary font-medium"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>My Profile ({user?.name})</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left py-2 text-danger font-bold flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        useAuthModalStore.getState().openModal('login');
                      }}
                      className="flex-1 py-2 text-center border border-border rounded-xl text-sm font-bold"
                    >
                      Sign In
                    </button>
                  </div>
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
