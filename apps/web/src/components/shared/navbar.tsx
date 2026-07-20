'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import { AnnouncementBar } from './announcement-bar';
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  ShoppingCart,
  Heart,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Book } from '@bookmarket/types';

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth, isAuthenticated } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close autosuggest
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications unread count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['unread-notifications-count'],
    queryFn: () => apiClient('/notifications/unread-count'),
    enabled: isAuthenticated && mounted,
    refetchInterval: 15000,
  });

  // Autosuggest Search Query
  const { data: searchResults = [] } = useQuery<Book[]>({
    queryKey: ['navbar-autosuggest', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const res = await apiClient<{ books: Book[] }>(`/books?search=${encodeURIComponent(searchQuery)}&limit=5`);
      return res.books || [];
    },
    enabled: searchQuery.trim().length >= 2,
  });

  const unreadCount = unreadData?.count || 0;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  if (!mounted) return null;

  const isSeller = user?.roles.includes('seller');
  const isAdmin = user?.roles.includes('admin');

  const categorySubnav = [
    { name: 'Fiction', href: '/books?category=fiction' },
    { name: 'Non-Fiction', href: '/books?category=non-fiction' },
    { name: 'Teens & YA', href: '/books?category=ya' },
    { name: 'Kids', href: '/books?category=kids' },
    { name: 'Exams & Study', href: '/books?category=exams' },
    { name: 'Manga', href: '/books?category=manga' },
    { name: 'Award Winners', href: '/books?category=award-winners' },
    { name: "Today's Deals", href: '/books?discount=40', isHighlight: true },
    { name: '💰 Sell Books', href: '/sell', isSecondary: true },
  ];

  return (
    <div className="w-full">
      {/* Slim Promo Announcement Bar */}
      <AnnouncementBar />

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Bar */}
          <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand hover:opacity-90 transition-opacity">
                BookMarket
              </span>
            </Link>

            {/* Center: Full-Width Search Bar with Autosuggest */}
            <div ref={searchRef} className="relative flex-1 max-w-xl hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search by title, author, ISBN..."
                    aria-label="Search books by title, author, or ISBN"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all shadow-sm"
                  />
                </div>
              </form>

              {/* Autosuggest Dropdown */}
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-md shadow-lg overflow-hidden z-50 divide-y divide-border">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Matching Catalog Books
                      </div>
                      {searchResults.map((book) => (
                        <Link
                          key={book.id}
                          href={`/books/${book.slug}`}
                          onClick={() => setSearchFocused(false)}
                          className="flex items-center space-x-3 px-3 py-2 hover:bg-background-subtle transition-colors"
                        >
                          {/* Mini Cover */}
                          <div className="h-10 w-7 bg-background-subtle rounded overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={book.images?.[0]?.url || 'https://placehold.co/100x150/16523d/ffffff?text=Book'}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary truncate">{book.title}</p>
                            <p className="text-[11px] text-text-muted truncate">by {book.author}</p>
                          </div>
                          <span className="text-xs font-bold text-text-primary">${book.price.toFixed(2)}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-text-muted">
                      No books found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                  <Link
                    href={`/books?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setSearchFocused(false)}
                    className="block px-3 py-2 text-center text-xs font-semibold text-brand hover:bg-background-subtle transition-colors"
                  >
                    View all search results →
                  </Link>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-full p-2 text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                aria-label="Toggle dark/light mode"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Cart Link */}
              <Link
                href="/cart"
                className="relative rounded-full p-2 text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                aria-label="Shopping Cart"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Link */}
              {isAuthenticated && (
                <Link
                  href="/account/wishlist"
                  className="relative rounded-full p-2 text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="My Wishlist"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Link>
              )}

              {/* Notifications Link */}
              {isAuthenticated && (
                <Link
                  href="/account/notifications"
                  className="relative rounded-full p-2 text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account Controls */}
              {isAuthenticated && user ? (
                <div className="hidden sm:flex items-center space-x-3">
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center space-x-1 text-xs font-semibold text-accent hover:opacity-80 transition-colors uppercase tracking-wider"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  {isSeller && (
                    <Link
                      href="/seller/dashboard"
                      className="flex items-center space-x-1 text-xs font-semibold text-brand hover:opacity-80 transition-colors uppercase tracking-wider"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Seller</span>
                    </Link>
                  )}

                  <Link
                    href="/account/profile"
                    className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-semibold border border-border hover:bg-background-subtle transition-colors text-text-primary"
                  >
                    <UserIcon className="h-4 w-4 text-text-muted" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-full p-2 text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors focus:outline-none"
                    aria-label="Log out"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-text-secondary hover:text-brand transition-colors px-2.5 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-hover transition-all duration-120"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-text-secondary hover:bg-background-subtle"
                aria-label="Open Mobile Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Category Text Subnav Bar (Underline on Hover) */}
          <nav className="hidden lg:flex items-center space-x-8 border-t border-border/60 py-2.5 text-xs font-medium text-text-secondary overflow-x-auto no-scrollbar">
            {categorySubnav.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`transition-colors whitespace-nowrap hover:text-brand border-b-2 border-transparent hover:border-brand py-1 ${
                  cat.isHighlight ? 'text-accent font-bold hover:border-accent' : ''
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-surface p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md text-text-primary"
              />
            </form>

            <div className="space-y-1 text-sm font-medium divide-y divide-border">
              <div className="py-2 space-y-2">
                <Link
                  href="/books"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-between items-center py-2 text-text-primary font-semibold"
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

              {isAuthenticated ? (
                <div className="pt-3 space-y-2">
                  <Link
                    href="/account/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-text-primary font-medium"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>My Profile ({user?.name})</span>
                  </Link>
                  {isSeller && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 text-brand font-semibold"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 py-2 text-accent font-semibold"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left py-2 text-danger font-semibold flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center border border-border rounded text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center bg-brand text-white rounded text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default Navbar;
