'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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

export interface MobileNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'admin' | 'seller' | 'buyer';
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
  if (item.meta?.link && typeof item.meta.link === 'string') return item.meta.link;
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

export function MobileNotificationsDrawer({
  isOpen,
  onClose,
  role = 'buyer',
}: MobileNotificationsDrawerProps) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllRead, isMarkingAll } =
    useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end font-sans md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="pt-3 pb-2 px-5 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/20">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-extrabold text-foreground">
                    Notifications
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead()}
                    disabled={isMarkingAll}
                    className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 px-2 py-1 rounded-lg"
                  >
                    {isMarkingAll ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Mark all read</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Close Notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-12 safe-area-bottom">
              {isLoading && notifications.length === 0 ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-muted/40 animate-pulse flex items-start gap-3"
                    >
                      <div className="h-9 w-9 rounded-xl bg-muted/80 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 bg-muted/80 rounded" />
                        <div className="h-2.5 w-full bg-muted/60 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="relative w-14 h-14 mx-auto opacity-70">
                    <Image
                      src="/assets/bookfry/bookfry-fox-pointing.webp"
                      alt="Fox reading"
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">You&apos;re all caught up!</p>
                    <p className="text-xs text-muted-foreground">
                      No notifications right now. Alerts for orders, book listings, and messages will show here.
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
                        onClose();
                      }}
                      className={`block p-3.5 rounded-2xl border transition-all text-xs active:scale-98 ${
                        item.isRead
                          ? 'bg-card/60 border-border/60 text-muted-foreground'
                          : 'bg-muted/70 border-secondary/35 text-foreground shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs truncate ${
                                item.isRead ? 'font-semibold text-foreground/80' : 'font-black text-foreground'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                              {timeAgo}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.body}
                          </p>
                        </div>

                        {!item.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-secondary shrink-0 mt-1.5 shadow-2xs" />
                        )}
                      </div>
                    </Link>
                  );
                })
              )}

              {/* Full Page Link */}
              <div className="pt-2 text-center">
                <Link
                  href="/account/notifications"
                  onClick={onClose}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Go to Full Notification Center &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileNotificationsDrawer;
