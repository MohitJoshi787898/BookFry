'use client';

import React, { useState } from 'react';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { useNotifications } from '@/hooks/use-notifications';
import {
  Truck,
  MessageSquare,
  Sparkles,
  Check,
  Package,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

function getNotificationLink(notification: { type: string; meta?: Record<string, unknown> }): string {
  if (notification.meta?.url && typeof notification.meta.url === 'string') return notification.meta.url;
  if (notification.type.startsWith('order_')) return '/account/orders';
  if (notification.type.startsWith('seller_verification')) return '/seller/onboarding';
  if (notification.type.startsWith('seller_')) return '/seller/listings';
  if (notification.type.startsWith('request_')) return '/account/requests';
  return '/account/orders';
}

function getNotificationIcon(type: string) {
  if (type.startsWith('order_delivery') || type === 'delivery_update') {
    return { Icon: Truck, color: 'text-sky-500 bg-sky-500/10' };
  }
  if (type.startsWith('order_')) {
    return { Icon: Package, color: 'text-emerald-500 bg-emerald-500/10' };
  }
  if (type.startsWith('seller_verification') || type.startsWith('verification_')) {
    return { Icon: ShieldCheck, color: 'text-amber-500 bg-amber-500/10' };
  }
  if (type.startsWith('request_') || type.startsWith('lead_')) {
    return { Icon: MessageSquare, color: 'text-brand bg-brand/10' };
  }
  if (type.includes('alert') || type.includes('breach') || type.includes('warning')) {
    return { Icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' };
  }
  return { Icon: Sparkles, color: 'text-brand bg-brand/10' };
}

export default function CustomerNotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    isMarkingAll,
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isAuthenticated) {
    return (
      <RoleEmptyState
        title="Sign In to View Notifications"
        description="Stay updated with order deliveries, seller responses, and campus book fair announcements."
        mascotVariant="reading"
      />
    );
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      <RoleHero
        title="Account Notifications &amp; Alerts"
        subtitle="Real-time status updates on textbook deliveries, seller responses to your requests, and campus deals."
        badgeText="Student Notification Center"
        showMascot={true}
        mascotPose="reading"
        stats={[
          {
            label: 'Unread Alerts',
            value: unreadCount,
            badge: unreadCount > 0 ? 'New' : 'All Read',
            isPositive: unreadCount === 0,
          },
          { label: 'Delivery Updates', value: 'Live', badge: 'Real-time', isPositive: true },
          { label: 'Total Alerts', value: notifications.length, badge: 'History', isPositive: true },
          { label: 'Push Alerts', value: 'Active', badge: 'Web Push', isPositive: true },
        ]}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isMarkingAll ? 'Marking...' : 'Mark All Read'}</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl border border-border/80 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-border/60 bg-card/40 animate-pulse space-y-2"
            >
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <RoleEmptyState
          title="No Notifications Found"
          description={
            filter === 'unread'
              ? "You're all caught up! No unread notifications right now."
              : 'You do not have any notifications yet. We will notify you when your orders or requests update!'
          }
          mascotVariant="reading"
        />
      ) : (
        <div className="space-y-3 font-sans">
          {filtered.map((item) => {
            const { Icon, color } = getNotificationIcon(item.type);
            const targetLink = getNotificationLink(item);

            return (
              <Link
                key={item.id}
                href={targetLink}
                onClick={() => {
                  if (!item.isRead) markAsRead(item.id);
                }}
                className={`block p-4 sm:p-5 rounded-3xl border transition-all shadow-sm ${
                  item.isRead
                    ? 'bg-card/60 border-border/60 text-muted-foreground'
                    : 'bg-card border-border/90 hover:border-brand/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-2xl ${color} shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          item.isRead ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand shrink-0 mt-1.5 shadow-xs" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
