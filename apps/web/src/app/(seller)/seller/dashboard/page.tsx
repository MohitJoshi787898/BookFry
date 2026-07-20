'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { SellerAnalytics } from '@bookmarket/types';
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { isAuthenticated } = useAuthStore();

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery<SellerAnalytics>({
    queryKey: ['seller-dashboard'],
    queryFn: () => apiClient('/seller/dashboard'),
    enabled: isAuthenticated,
  });

  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    confirmed: 'bg-brand/10 text-brand border-brand/20',
    shipped: 'bg-accent/10 text-accent border-accent/20',
    delivered: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
    refunded: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary text-sm font-sans mt-1">
              Manage your sales, listings, and track your marketplace performance.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/seller/orders"
              className="px-4 py-2 border border-border text-text-primary hover:bg-background-subtle rounded text-sm font-semibold transition-colors"
            >
              Manage Orders
            </Link>
            <Link
              href="/seller/earnings"
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold transition-all"
            >
              Earnings Ledger
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError || !stats ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load dashboard metrics
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {/* Earnings */}
              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider font-sans">
                    Total Net Earnings
                  </span>
                  <p className="text-3xl font-bold text-brand">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-brand/10 text-brand rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              {/* Sales */}
              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider font-sans">
                    Total Books Sold
                  </span>
                  <p className="text-3xl font-bold text-text-primary">{stats.totalSales} items</p>
                </div>
                <div className="p-3 bg-success/10 text-success rounded-full">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              {/* Active Listings */}
              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider font-sans">
                    Active Listings
                  </span>
                  <p className="text-3xl font-bold text-accent">{stats.activeListingsCount} books</p>
                </div>
                <div className="p-3 bg-accent/10 text-accent rounded-full">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Sales Chart / Monthly breakdown */}
            <div className="border border-border bg-surface rounded-md p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-text-primary mb-6 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                <span>Monthly Earnings Breakdown</span>
              </h3>

              {stats.salesByMonth.length === 0 ? (
                <div className="text-center py-12 text-text-secondary text-sm font-sans">
                  No monthly transaction data available yet. Complete orders to see stats here.
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <div className="flex h-48 items-end gap-4 border-b border-border pb-2 px-4">
                    {stats.salesByMonth.map((item, idx) => {
                      // Calculate height relative to max amount
                      const maxVal = Math.max(...stats.salesByMonth.map((m) => m.amount)) || 1;
                      const percentageHeight = (item.amount / maxVal) * 100;
                      return (
                        <div key={idx} className="flex flex-col items-center flex-grow group relative h-full justify-end">
                          <div className="absolute -top-6 bg-surface border border-border rounded text-[10px] font-bold px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${item.amount.toFixed(2)}
                          </div>
                          <div
                            style={{ height: `${Math.max(percentageHeight, 5)}%` }}
                            className="w-full bg-brand/80 hover:bg-brand rounded-t transition-all cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-bold px-4">
                    {stats.salesByMonth.map((item, idx) => (
                      <span key={idx}>{item.month}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="border border-border bg-surface rounded-md p-6 shadow-sm font-sans space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-brand" />
                  <span>Recent Sales Orders</span>
                </h3>
                <Link
                  href="/seller/orders"
                  className="text-xs text-brand hover:text-brand-hover flex items-center space-x-1 font-semibold"
                >
                  <span>See all orders</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-12 text-text-secondary text-sm font-sans">
                  No orders received yet. Listed books will show up here once purchased.
                </div>
              ) : (
                <div className="divide-y divide-border font-sans">
                  {stats.recentOrders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString();
                    return (
                      <div
                        key={order.id}
                        className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm font-sans"
                      >
                        <div className="space-y-1">
                          <p className="font-mono font-bold text-text-primary">{order.orderNumber}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1 font-sans">
                            <Calendar className="h-3.5 w-3.5" /> {formattedDate}
                          </p>
                        </div>

                        <div className="flex items-center space-x-6 text-sm font-sans">
                          <div>
                            <span className="text-xs text-text-muted block font-sans">Total</span>
                            <span className="font-bold text-text-primary font-sans">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize font-sans ${statusColors[order.status]}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
