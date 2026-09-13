'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  BookOpen,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Layers,
  Star,
  MessageSquare,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-nav';

const quickSearchRoutes = [
  { title: 'Executive Command Center', category: 'Overview', href: '/admin/dashboard', icon: Sparkles },
  { title: 'Financial Reports & GMV', category: 'Analytics', href: '/admin/reports', icon: BarChart3 },
  { title: 'Book Listings Moderation', category: 'Catalog', href: '/admin/listings', icon: BookOpen },
  { title: 'Orders & Refund Operations', category: 'Sales', href: '/admin/orders', icon: ShoppingBag },
  { title: 'Used Book Direct Requests', category: 'P2P Leads', href: '/admin/requests', icon: MessageSquare },
  { title: 'Users & Seller Directory', category: 'Accounts', href: '/admin/users', icon: Users },
  { title: 'Promotions & Promo Codes', category: 'Marketing', href: '/admin/promotions', icon: Tag },
  { title: 'Categories & Taxonomy', category: 'Catalog', href: '/admin/categories', icon: Layers },
  { title: 'Book Reviews Moderation', category: 'Community', href: '/admin/reviews', icon: Star },
  { title: 'Support Tickets & Helpdesk', category: 'Help', href: '/admin/support', icon: MessageSquare },
  { title: 'Storefront CMS & Banners', category: 'Content', href: '/admin/cms', icon: FileText },
  { title: 'System & Platform Settings', category: 'System', href: '/admin/settings', icon: Settings },
];

export function AdminHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global ⌘ K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRoutes = searchQuery.trim()
    ? quickSearchRoutes.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickSearchRoutes;

  return (
    <>
      <DashboardHeader
        role="admin"
        showSearch={true}
        searchPlaceholder="Search tools, listings, orders..."
        onSearchClick={() => setSearchOpen(true)}
      >
        {/* View Customer Storefront */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </DashboardHeader>

      {/* GLOBAL ⌘ K SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/60 backdrop-blur-md p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-card border border-border/80 rounded-3xl max-w-xl w-full shadow-2xl p-5 sm:p-6 relative space-y-4">
            <div className="flex items-center space-x-3 border-b border-border/60 pb-3">
              <Search className="h-5 w-5 text-secondary" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admin tools, listings, orders, users..."
                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto pr-1 text-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 pb-1">
                Admin Console Directory
              </p>
              {filteredRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-muted/60 border border-transparent hover:border-border/80 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{route.title}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{route.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminHeader;
