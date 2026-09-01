'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  Search,
  Bell,
  ExternalLink,
  X,
  BookOpen,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  Layers,
  Star,
  MessageSquare,
  Check,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'order' | 'moderation' | 'ticket';
  link: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Listing Pending Moderation',
    description: 'CLRS Algorithms (3rd Edition) submitted by Priya S.',
    time: '5m ago',
    read: false,
    type: 'moderation',
    link: '/admin/listings',
  },
  {
    id: '2',
    title: 'High Priority Support Ticket',
    description: 'Ticket #TK-8492: Refund status query for ORD-977730',
    time: '25m ago',
    read: false,
    type: 'ticket',
    link: '/admin/support',
  },
  {
    id: '3',
    title: 'New High Value Purchase',
    description: 'Order #ORD-1102 completed: ₹4,290',
    time: '1h ago',
    read: true,
    type: 'order',
    link: '/admin/orders',
  },
];

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
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  // Global ⌘ K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredRoutes = searchQuery.trim()
    ? quickSearchRoutes.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickSearchRoutes;

  return (
    <>
      <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 font-sans">
        {/* Left Search Trigger & Telemetry */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center space-x-2.5 px-3.5 py-1.5 bg-muted/60 hover:bg-muted border border-border/80 rounded-2xl text-xs text-muted-foreground transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Search className="h-4 w-4 text-secondary" />
            <span className="hidden sm:inline font-medium">Search tools, listings, orders, users...</span>
            <span className="sm:hidden font-bold">Search tools...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-black text-muted-foreground bg-background border border-border/80 px-1.5 py-0.5 rounded-lg">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 relative">
          {/* View Customer Storefront */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-secondary hover:bg-muted transition-all"
          >
            <span>Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all relative active:scale-95 cursor-pointer"
              aria-label="Admin Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-secondary text-secondary-foreground text-[10px] font-black flex items-center justify-center border-2 border-card shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl z-50 font-sans space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-secondary" />
                    <h4 className="font-serif text-sm font-bold text-foreground">Notifications</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-black text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setNotificationsOpen(false)}
                      className={`block p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                        item.read
                          ? 'bg-background/40 border-border/40 text-muted-foreground'
                          : 'bg-muted/60 border-border/80 text-foreground font-semibold'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-xs">{item.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Status Badge */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-border/80">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-black text-foreground block leading-none">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-secondary font-black uppercase tracking-wider block mt-1">
                SUPER ADMIN
              </span>
            </div>

            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-extrabold text-xs flex items-center justify-center shadow-md select-none">
              SA
            </div>
          </div>
        </div>
      </header>

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
