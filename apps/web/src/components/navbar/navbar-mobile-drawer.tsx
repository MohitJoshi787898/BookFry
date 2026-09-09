'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Store,
  ShieldAlert,
  Package,
  Heart,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BookFryLogo } from './logo';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { apiClient } from '@/lib/api-client';

interface CategoryGroup {
  id: string;
  name: string;
  subcategories: { name: string; href: string }[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'higher-ed',
    name: 'Higher Education & Tech',
    subcategories: [
      { name: 'Computer Science & IT', href: '/books?category=computer-science' },
      { name: 'Engineering Textbooks', href: '/books?category=engineering' },
      { name: 'Medical & MBBS Guides', href: '/books?category=medical' },
      { name: 'Commerce & Accounting (CA)', href: '/books?category=commerce' },
      { name: 'Law & Judiciary', href: '/books?category=law' },
    ],
  },
  {
    id: 'exams',
    name: 'Competitive Exams',
    subcategories: [
      { name: 'JEE Main & Advanced', href: '/books?category=jee' },
      { name: 'NEET UG Medical', href: '/books?category=neet' },
      { name: 'UPSC Civil Services', href: '/books?category=upsc' },
      { name: 'Banking & SSC', href: '/books?category=banking' },
      { name: 'GATE Syllabus', href: '/books?category=gate' },
    ],
  },
  {
    id: 'literature',
    name: 'Literature & Fiction',
    subcategories: [
      { name: 'Fiction & Novels', href: '/books?category=fiction' },
      { name: 'Non-Fiction & Self-Help', href: '/books?category=non-fiction' },
      { name: 'Biographies', href: '/books?category=biography' },
      { name: 'Young Adult & Teens', href: '/books?category=teens-ya' },
    ],
  },
  {
    id: 'school',
    name: 'School (K-12)',
    subcategories: [
      { name: 'CBSE Classes 9–12', href: '/books?category=cbse' },
      { name: 'ICSE & ISC Board', href: '/books?category=icse' },
      { name: 'NCERT Standard Editions', href: '/books?category=ncert' },
    ],
  },
];

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function NavbarMobileDrawer({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}: NavbarMobileDrawerProps) {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [activeGroup, setActiveGroup] = useState<CategoryGroup | null>(null);

  useEffect(() => {
    if (!isOpen) setActiveGroup(null);
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {}
    finally {
      clearAuth();
      router.push('/');
      router.refresh();
    }
  };

  const isSeller = user?.roles?.includes('seller');
  const isAdmin = user?.roles?.includes('admin');
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Slide-in */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-background border-r border-border shadow-2xl flex flex-col overflow-hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border/80 shrink-0">
              <BookFryLogo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/80">
              {/* Profile Card */}
              {isAuthenticated && user ? (
                <div className="p-4 bg-muted/25 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-black shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Seller / Admin status banner */}
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-danger/10 text-danger text-xs font-bold"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Control Center</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : isSeller ? (
                    <Link
                      href="/seller/dashboard"
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/15 text-secondary text-xs font-bold"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>Seller Hub & Listings</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}

                  {/* Fast Account Links */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/account/orders"
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/80 text-xs font-semibold text-foreground"
                    >
                      <Package className="w-3.5 h-3.5 text-primary" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/80 text-xs font-semibold text-foreground"
                    >
                      <Heart className="w-3.5 h-3.5 text-secondary" />
                      <span>Wishlist</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Unauthenticated card with mascot accent */
                <div className="p-4 bg-muted/30 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground">Welcome to BookFry</p>
                    <p className="text-[11px] text-muted-foreground">Buy, sell & circulate textbooks.</p>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openModal('login');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openModal('signup');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                  <div className="relative w-16 h-16 shrink-0 opacity-90">
                    <Image
                      src="/assets/bookfry/bookfry-fox-reading.webp"
                      alt="BookFry Mascot"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Links or Drilldown */}
              <div className="p-3 space-y-1">
                {activeGroup ? (
                  /* Drilldown Subcategory View */
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveGroup(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-secondary px-2 py-1.5 hover:underline"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Categories</span>
                    </button>
                    <p className="px-3 text-[11px] font-black uppercase text-muted-foreground">
                      {activeGroup.name}
                    </p>
                    {activeGroup.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* Main Categories View */
                  <>
                    <Link
                      href="/books"
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold text-foreground hover:bg-muted"
                    >
                      <span className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>Browse All Books</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>

                    <Link
                      href="/sell"
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold text-secondary hover:bg-secondary/10"
                    >
                      <span className="flex items-center gap-2.5">
                        <Store className="w-4 h-4 text-secondary" />
                        <span>Sell Textbooks (Earn Cash)</span>
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    </Link>

                    <div className="pt-2 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Book Streams
                    </div>

                    {CATEGORY_GROUPS.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveGroup(group)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <span>{group.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Informational Links */}
              <div className="p-3 space-y-1 text-xs font-medium text-muted-foreground">
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted hover:text-foreground"
                >
                  <span>Our Story & Mission</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted hover:text-foreground"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Contact Support</span>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/80 bg-muted/20 shrink-0 space-y-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground"
              >
                <span className="flex items-center gap-2">
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-secondary" />}
                  <span>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{theme}</span>
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default NavbarMobileDrawer;
