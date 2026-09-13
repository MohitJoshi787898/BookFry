'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  Check,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  Sparkles,
  LifeBuoy,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@bookmarket/types';

export interface DashboardNotificationsMenuProps {
  role?: 'admin' | 'seller' | 'buyer';
  className?: string;
  onOpenMobileDrawer?: () => void;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'order':
    case 'order_placed':
    case 'order_shipped':
    case 'order_delivered':
      return { icon: ShoppingBag, color: 'text-sky-500 bg-sky-500/10' };
    case 'moderation':
    case 'listing_pending':
    case 'listing_approved':
    case 'listing_rejected':
      return { icon: BookOpen, color: 'text-amber-500 bg-amber-500/10' };
    case 'ticket':
    case 'support_ticket':
      return { icon: LifeBuoy, color: 'text-purple-500 bg-purple-500/10' };
    case 'lead':
    case 'seller_checkout_lead':
    case 'used_book_request':
      return { icon: MessageSquare, color: 'text-secondary bg-secondary/10' };
    default:
      return { icon: Sparkles, color: 'text-primary bg-primary/10' };
  }
}

function getNotificationHref(item: Notification, role?: 'admin' | 'seller' | 'buyer'): string {
  if (item.meta?.link && typeof item.meta.link === 'string') {
    return item.meta.link;
  }
  if (item.meta?.orderId) {
    if (role === 'admin') return '/admin/orders';
    if (role === 'seller') return '/seller/orders';
    return `/account/orders`;
  }
  if (item.type.includes('ticket')) return '/admin/support';
  if (item.type.includes('moderation') || item.type.includes('listing')) {
    return role === 'admin' ? '/admin/listings' : '/seller/listings';
  }
  if (item.type.includes('lead') || item.type.includes('request')) {
    return role === 'seller' ? '/seller/requests' : '/account/requests';
  }
  return role === 'admin'
    ? '/admin/dashboard'
    : role === 'seller'
    ? '/seller/dashboard'
    : '/account/notifications';
}

export function DashboardNotificationsMenu({
  role = 'buyer',
  className = '',
  onOpenMobileDrawer,
}: DashboardNotificationsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead, isMarkingAll } =
    useNotifications();

  // Close on outside click and Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    // If mobile viewport handler is supplied and we are on small screen, trigger mobile drawer
    if (onOpenMobileDrawer && window.innerWidth < 768) {
      onOpenMobileDrawer();
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications: ${unreadCount} unread`}
        className={`relative p-2 rounded-2xl border transition-all active:scale-95 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
          isOpen
            ? 'bg-muted border-border text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80'
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-4 px-1 rounded-full bg-secondary text-secondary-foreground text-[9px] font-black flex items-center justify-center border-2 border-card shadow-xs animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Popover Panel */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 top-full mt-2.5 w-84 sm:w-96 rounded-3xl bg-card border border-border/80 shadow-2xl p-4 sm:p-5 z-50 origin-top-right font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-secondary/10 text-secondary">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                className="text-xs font-black text-secondary hover:text-secondary/80 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {isLoading && notifications.length === 0 ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-muted/40 animate-pulse flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-xl bg-muted/80 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 bg-muted/80 rounded" />
                      <div className="h-2.5 w-full bg-muted/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="relative w-12 h-12 mx-auto opacity-70">
                  <Image
                    src="/assets/bookfry/bookfry-fox-pointing.webp"
                    alt="Fox reading"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">You&apos;re all caught up!</p>
                  <p className="text-[11px] text-muted-foreground">
                    No notifications right now. Stay tuned for order &amp; listing updates.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((item) => {
                const { icon: Icon, color } = getNotificationIcon(item.type);
                const href = getNotificationHref(item, role);
                const timeAgo = formatTimeAgo(item.createdAt);

                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => {
                      if (!item.isRead) markAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3 rounded-2xl border transition-all text-xs active:scale-98 ${
                      item.isRead
                        ? 'bg-card/40 border-border/40 text-muted-foreground hover:bg-muted/40'
                        : 'bg-muted/60 border-secondary/30 text-foreground shadow-2xs hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              item.isRead ? 'font-medium text-foreground/80' : 'font-bold text-foreground'
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      </div>

                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-secondary shrink-0 mt-1.5 shadow-2xs" />
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Portal Link */}
          <div className="border-t border-border/60 pt-2.5 mt-2 flex justify-center">
            <Link
              href="/account/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-secondary hover:underline"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNotificationsMenu;
