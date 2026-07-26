'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { useCartStore } from '@/stores/cart.store';
import { apiClient } from '@/lib/api-client';
import { AnnouncementBar } from './announcement-bar';
import { ThemeToggle } from './theme-toggle';
import {
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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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
    { name: 'Teens & YA', href: '/books?category=teens-ya' },
    { name: 'Kids', href: '/books?category=kids' },
    { name: 'Exam Prep', href: '/books?category=exams' },
    { name: 'Engineering', href: '/books?category=engineering' },
    { name: 'Medical', href: '/books?category=medical' },
    { name: 'Management', href: '/books?category=management' },
    { name: 'Competitive Exams', href: '/books?category=competitive-exams' },
    { name: "Today's Deals", href: '/books?discount=40', isHighlight: true },
  ];

  return (
    <div className="w-full">
      {/* Slim Promo Announcement Bar */}
      <AnnouncementBar />

      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Bar */}
          <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <span className="font-sans text-2xl font-black tracking-tight text-brand hover:opacity-95 transition-opacity">
                Book<span className="text-secondary">Fry</span>
              </span>
            </Link>

            {/* Center: Full-Width Search Bar with Autosuggest */}
            <div ref={searchRef} className="relative flex-1 max-w-xl hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search by title, author, ISBN or keyword..."
                    aria-label="Search books by title, author, or ISBN"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-secondary hover:bg-[#e05310] text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
              </form>

              {/* Autosuggest Dropdown */}
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50 divide-y divide-border">
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
              <ThemeToggle />

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
                <button
                  onClick={() => router.push('/account/notifications')}
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
                </button>
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
                    href="/sell"
                    className="border border-[#F26522]/30 bg-[#FEF8F3] dark:bg-muted/40 hover:bg-[#FFF5F0] text-[#F26522] dark:text-[#FFF5F0] rounded-md px-3.5 py-2 text-xs font-bold transition-all shadow-xs"
                  >
                    Become a Seller
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-md bg-[#F26522] px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e05310] transition-colors"
                  >
                    Login / Sign up
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
          <nav className="hidden lg:flex items-center border-t border-border/60 py-2.5 text-xs font-medium text-text-secondary overflow-x-auto no-scrollbar w-full">
            <div className="flex items-center gap-6">
              {categorySubnav.map((cat) => {
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className={`transition-colors whitespace-nowrap hover:text-brand border-b-2 border-transparent hover:border-brand py-1 ${
                      cat.isHighlight ? 'text-secondary font-bold hover:border-secondary flex items-center gap-1' : ''
                    }`}
                  >
                    {cat.isHighlight ? (
                      <>
                        <span>{cat.name}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                      </>
                    ) : (
                      cat.name
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right-aligned Sell Books Link */}
            <Link
              href="/sell"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  useAuthModalStore.getState().openModal('login', '/sell');
                }
              }}
              className="ml-auto flex items-center gap-1.5 text-text-primary hover:text-secondary font-bold transition-colors"
            >
              <span className="text-secondary select-none">🔥</span>
              <span>Sell Books</span>
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-card p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
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
