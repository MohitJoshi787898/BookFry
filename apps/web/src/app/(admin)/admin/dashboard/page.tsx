'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Users, BookOpen, ShoppingBag, DollarSign, ShieldAlert, ArrowRight, Layers, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardUser {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

interface DashboardOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  items: unknown[];
}

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  totalOrders: number;
  grossMerchandiseValue: number;
  recentUsers: DashboardUser[];
  recentOrders: DashboardOrder[];
}

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.roles.includes('admin');

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient('/admin/dashboard'),
    enabled: isAuthenticated && isAdmin,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary">Admin Control Panel</h1>
            <p className="text-text-secondary text-sm font-sans mt-1">
              Platform administration, user management, content moderation, and analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 font-sans">
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-border text-text-primary hover:bg-background-subtle rounded text-sm font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Users className="h-4 w-4 text-brand" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/listings"
              className="px-4 py-2 border border-border text-text-primary hover:bg-background-subtle rounded text-sm font-semibold transition-colors flex items-center space-x-1.5"
            >
              <BookOpen className="h-4 w-4 text-brand" />
              <span>Listings</span>
            </Link>
            <Link
              href="/admin/categories"
              className="px-4 py-2 border border-border text-text-primary hover:bg-background-subtle rounded text-sm font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Layers className="h-4 w-4 text-brand" />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/reports"
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold transition-all flex items-center space-x-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Link>
          </div>
        </div>

        {!isAdmin ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-4 font-sans">
            <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Access Restricted</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              You must have Administrative privileges to view this control panel.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError || !stats ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load administrative stats
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
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Total Registered Users
                  </span>
                  <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-brand/10 text-brand rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Active Catalog Books
                  </span>
                  <p className="text-3xl font-bold text-text-primary mt-1">{stats.activeListings}</p>
                </div>
                <div className="p-3 bg-accent/10 text-accent rounded-full">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>

              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Total Marketplace Orders
                  </span>
                  <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-success/10 text-success rounded-full">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              <div className="border border-border bg-surface rounded-md p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                    Gross Merchandise Value
                  </span>
                  <p className="text-3xl font-bold text-brand mt-1">
                    ${stats.grossMerchandiseValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-brand/10 text-brand rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Platform Recent Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
              {/* Recent Registrations */}
              <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h2 className="font-serif text-lg font-bold text-text-primary">Recent User Registrations</h2>
                  <Link href="/admin/users" className="text-xs text-brand hover:underline font-semibold flex items-center space-x-1">
                    <span>Manage all</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border text-sm">
                  {stats.recentUsers.map((u: DashboardUser) => (
                    <div key={u._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-text-primary">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {u.roles.map((r: string) => (
                          <span key={r} className="px-2 py-0.5 bg-background-subtle border border-border text-[10px] font-bold uppercase rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h2 className="font-serif text-lg font-bold text-text-primary">Recent Marketplace Orders</h2>
                  <Link href="/admin/reports" className="text-xs text-brand hover:underline font-semibold flex items-center space-x-1">
                    <span>View report</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border text-sm">
                  {stats.recentOrders.map((ord: DashboardOrder) => (
                    <div key={ord._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-mono font-bold text-text-primary">{ord.orderNumber}</p>
                        <p className="text-xs text-text-muted">{ord.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text-primary">${ord.total.toFixed(2)}</span>
                        <span className="block text-[10px] text-brand font-semibold capitalize">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
