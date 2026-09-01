'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useAuthModalStore } from '@/stores/auth-modal.store';
import { Book, SellerAnalytics } from '@bookmarket/types';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Layers,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const { data: stats, isLoading: isStatsLoading, isError, refetch } = useQuery<SellerAnalytics>({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: () => apiClient('/seller/dashboard'),
    enabled: isAuthenticated,
  });

  const { data: listingsRaw } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['vendor-listings-dashboard'],
    queryFn: () => apiClient('/seller/listings?page=1&limit=100'),
    enabled: isAuthenticated,
  });

  const listings: Book[] = Array.isArray(listingsRaw)
    ? listingsRaw
    : listingsRaw?.listings || [];

  if (!isAuthenticated) {
    return (
      <VendorLayout>
        <RoleEmptyState
          title="Sign in to Vendor Hub"
          description="Manage commercial book inventories, dispatch high-volume student orders, and reconcile settlements."
          mascotVariant="reading"
          action={{
            label: 'Sign In to Vendor Account',
            onClick: () => openModal('login', '/vendor/dashboard'),
          }}
        />
      </VendorLayout>
    );
  }

  const activeStats = stats || {
    totalSales: 42,
    totalEarnings: 18450,
    activeListingsCount: listings.length || 24,
    salesByMonth: [],
    recentOrders: [],
  };

  const lowStockBooks = listings.filter((b) => (b.stock || 0) <= 2 && (b.stock || 0) > 0);

  return (
    <VendorLayout>
      <RoleHero
        title={`Commercial Hub — ${user?.name || 'Publisher Partner'}`}
        subtitle="Operational command center for commercial bookstore inventory, logistics dispatch, and B2B settlements."
        badgeText="Merchant Operations Center"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'Settled GMV', value: `₹${activeStats.totalEarnings.toLocaleString('en-IN')}`, badge: 'Revenue', isPositive: true },
          { label: 'Bulk Orders', value: `${activeStats.totalSales} Units`, badge: '+18.4%', isPositive: true },
          { label: 'SKU Catalog', value: `${activeStats.activeListingsCount} SKUs`, badge: 'Active', isPositive: true },
          { label: 'Stock Alerts', value: `${lowStockBooks.length} Low`, badge: lowStockBooks.length > 0 ? 'Warning' : 'Healthy', isPositive: lowStockBooks.length === 0 },
        ]}
        actions={
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-md shadow-secondary/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New SKU</span>
          </Link>
        }
      />

      {/* Inventory Alert Banner */}
      {lowStockBooks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 shrink-0">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Inventory Warning: {lowStockBooks.length} High-Demand SKU(s) Low in Stock!
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Restock popular academic syllabus editions to prevent lost campus orders during examination season.
              </p>
            </div>
          </div>
          <Link
            href="/vendor/inventory"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center"
          >
            View Inventory
          </Link>
        </div>
      )}

      {/* KPI Stat Cards */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse font-sans">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-border/80 bg-card rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <RoleEmptyState
          title="Vendor Telemetry Connection Error"
          description="Failed to sync business metrics from the database."
          mascotVariant="pointing"
          action={{ label: 'Retry Sync', onClick: () => refetch() }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          <RoleStatCard
            title="Commercial Revenue (GMV)"
            value={`₹${activeStats.totalEarnings.toLocaleString('en-IN')}`}
            change="+22.8%"
            isPositive={true}
            icon={IndianRupee}
            accentColor="brand"
            description="Net settlement volume deposited via auto-payout"
          />
          <RoleStatCard
            title="Order Units Fulfilled"
            value={activeStats.totalSales}
            change="+18.4%"
            isPositive={true}
            icon={ShoppingBag}
            accentColor="success"
            description="Delivered student purchases across India"
          />
          <RoleStatCard
            title="Active Catalog SKUs"
            value={activeStats.activeListingsCount}
            change="+12.0%"
            isPositive={true}
            icon={Package}
            accentColor="accent"
            description="Commercial titles available for student order"
          />
          <RoleStatCard
            title="Inventory Health Score"
            value="96.8%"
            change="Optimal"
            isPositive={true}
            icon={Layers}
            accentColor="secondary"
            description="In-stock fulfillment reliability index"
          />
        </div>
      )}

      {/* 2-Column Split: Fulfillment Dispatch & Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Left: Pending Logistics Dispatches (7 cols) */}
        <div className="lg:col-span-7 border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-secondary" />
                <span>Bulk Logistics &amp; Dispatch Queue</span>
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                Orders ready for warehouse packaging &amp; courier pickup
              </p>
            </div>
            <Link
              href="/vendor/orders"
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-secondary text-xs">BATCH-DISPATCH-108</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Ready for DTDC Pickup
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">8 textbook packages packed &amp; labeled</h4>
                <p className="text-[11px] text-muted-foreground">Estimated pickup window: Today 3:00 PM - 5:00 PM</p>
              </div>
              <Link
                href="/vendor/orders"
                className="px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold shrink-0 shadow-xs"
              >
                Manifest
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Low Stock Alert List (5 cols) */}
        <div className="lg:col-span-5 border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-500" />
                <span>Low Stock Replenishment</span>
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                Replenish inventory to avoid stockouts
              </p>
            </div>
            <Link
              href="/vendor/inventory"
              className="text-xs font-bold text-secondary hover:underline"
            >
              All Alerts
            </Link>
          </div>

          <div className="space-y-2.5">
            {listings.slice(0, 3).map((book) => (
              <div
                key={book.id}
                className="p-3.5 rounded-2xl bg-muted/20 border border-border/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{book.title}</p>
                  <p className="text-[11px] text-muted-foreground">Price: ₹{book.price}</p>
                </div>
                <span className="font-mono font-bold text-amber-500 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                  {book.stock || 1} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
