'use client';

import React, { useState } from 'react';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import {
  Truck,
  MessageSquare,
  Sparkles,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface CustomerNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'order' | 'lead' | 'promo';
  link: string;
}

const initialNotifications: CustomerNotification[] = [
  {
    id: '1',
    title: 'Textbook Package Out for Delivery',
    description: 'Order #ORD-766893 (CLRS Algorithms) has reached your campus hub and will be delivered today.',
    time: '20m ago',
    read: false,
    type: 'order',
    link: '/account/orders',
  },
  {
    id: '2',
    title: 'Seller Responded to Your Request',
    description: 'Priya Sharma accepted your purchase offer for BD Chaurasia Anatomy. Check contact details.',
    time: '2h ago',
    read: false,
    type: 'lead',
    link: '/account/requests',
  },
  {
    id: '3',
    title: 'Special Semester Discount: CAMPUS50',
    description: 'Get flat ₹50 OFF on all Engineering reference textbooks with code CAMPUS50.',
    time: '1d ago',
    read: true,
    type: 'promo',
    link: '/books',
  },
];

export default function CustomerNotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<CustomerNotification[]>(initialNotifications);
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

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="space-y-6">
      <RoleHero
        title="Account Notifications &amp; Alerts"
          subtitle="Real-time status updates on textbook deliveries, seller responses to your requests, and campus deals."
          badgeText="Student Notification Center"
          showMascot={true}
          mascotPose="reading"
          stats={[
            { label: 'Unread Alerts', value: unreadCount, badge: unreadCount > 0 ? 'New' : 'All Read', isPositive: unreadCount === 0 },
            { label: 'Delivery Updates', value: 'Live', badge: 'Real-time', isPositive: true },
            { label: 'Seller Alerts', value: 'Active', badge: 'P2P Leads', isPositive: true },
            { label: 'Promotions', value: 'Active', badge: 'Exclusive', isPositive: true },
          ]}
          actions={
            unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark All Read</span>
              </button>
            ) : undefined
          }
        />

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl border border-border/80 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filter === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filter === 'unread' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <RoleEmptyState
            title="No Notifications Found"
            description="You're all caught up with your latest textbook orders and seller messages!"
            mascotVariant="reading"
          />
        ) : (
          <div className="space-y-3 font-sans">
            {filtered.map((item) => {
              const Icon = item.type === 'order' ? Truck : item.type === 'lead' ? MessageSquare : Sparkles;
              const iconColor = item.type === 'order' ? 'text-sky-500 bg-sky-500/10' : item.type === 'lead' ? 'text-secondary bg-secondary/10' : 'text-amber-500 bg-amber-500/10';

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => markSingleRead(item.id)}
                  className={`block p-4 sm:p-5 rounded-3xl border transition-all shadow-sm ${
                    item.read
                      ? 'bg-card/60 border-border/60 text-muted-foreground'
                      : 'bg-card border-border/90 hover:border-secondary/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-2xl ${iconColor} shrink-0 mt-0.5`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${item.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{item.time}</span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {!item.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary shrink-0 mt-1.5 shadow-xs" />
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
