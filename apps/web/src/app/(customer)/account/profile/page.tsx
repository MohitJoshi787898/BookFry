'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { apiClient } from '@/lib/api-client';
import { Order } from '@bookmarket/types';
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  MapPin,
  Shield,
  CheckCircle2,
  ArrowRight,
  Store,
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const { user, isAuthenticated } = useAuthStore();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['buyer-orders-profile'],
    queryFn: () => apiClient('/orders'),
    enabled: isAuthenticated,
  });

  const { data: wishlistRaw = [] } = useQuery<{ books?: unknown[] } | unknown[]>({
    queryKey: ['buyer-wishlist-profile'],
    queryFn: () => apiClient('/wishlist'),
    enabled: isAuthenticated,
  });

  const wishlist = Array.isArray(wishlistRaw) ? wishlistRaw : wishlistRaw?.books || [];
  const inTransitOrders = orders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status));

  return (
    <div className="space-y-6">
        <RoleHero
          title={`Hello, ${user?.name || 'Student Reader'}!`}
          subtitle="Manage your campus deliveries, saved textbook wishlists, and account preferences."
          badgeText="Student Account Center"
          showMascot={true}
          mascotPose="reading"
          stats={[
            { label: 'Orders Placed', value: orders.length, badge: 'Purchases', isPositive: true },
            { label: 'Active Shipments', value: inTransitOrders.length, badge: inTransitOrders.length > 0 ? 'On The Way' : 'Settled', isPositive: true },
            { label: 'Saved in Wishlist', value: wishlist.length, badge: 'Favorites', isPositive: true },
            { label: 'Student Savings', value: '₹2,450', badge: 'Est. Saved', isPositive: true },
          ]}
          actions={
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-md shadow-secondary/20 active:scale-95"
            >
              <Store className="h-4 w-4" />
              <span>Seller Workspace</span>
            </Link>
          }
        />

        {/* 2-Column Split: Profile Identity (5 cols) + Saved Addresses & Security (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Profile Identity Card (5 cols) */}
          <div className="lg:col-span-5 border border-border/80 bg-card rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-4 border-b border-border/60 pb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#1A3B5C] to-[#FF9F2D] text-white font-extrabold text-lg flex items-center justify-center shadow-md select-none">
                {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-lg font-bold text-foreground truncate">
                  {user?.name || 'Student Account'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono truncate">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Verified Student
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs font-semibold">
              <Link
                href="/account/orders"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-secondary" />
                  <span>My Orders &amp; Delivery Tracking</span>
                </div>
                <span className="font-mono font-bold text-muted-foreground">{orders.length}</span>
              </Link>

              <Link
                href="/account/wishlist"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Saved Books (Wishlist)</span>
                </div>
                <span className="font-mono font-bold text-muted-foreground">{wishlist.length}</span>
              </Link>

              <Link
                href="/account/requests"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 hover:bg-muted/60 border border-border/60 text-foreground transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-sky-500" />
                  <span>Used Book Requests (P2P)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Saved Delivery Addresses & Security (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Addresses */}
            <div className="border border-border/80 bg-card rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <span>Saved Campus Delivery Addresses</span>
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase text-secondary">Primary Address</span>
                <p className="font-bold text-foreground">{user?.name}</p>
                <p className="text-muted-foreground">Hostel 4, Room 212, Campus Main Block</p>
                <p className="text-muted-foreground">New Delhi, Delhi 110016 • India</p>
              </div>
            </div>

            {/* Account Security */}
            <div className="border border-border/80 bg-card rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary" />
                <span>Security &amp; Password</span>
              </h3>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/80 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">Password &amp; Authentication</p>
                  <p className="text-muted-foreground">Encrypted with bcrypt (12 rounds)</p>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground font-bold text-xs shadow-xs transition-all">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
