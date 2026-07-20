'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Users, BookOpen, ShoppingBag, IndianRupee, ShieldAlert, CheckCircle, ArrowUpRight } from 'lucide-react';
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

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border bg-surface rounded-md space-y-4 font-sans">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            You must have Administrative privileges to view this control panel.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const userColumns: Column<DashboardUser>[] = [
    {
      header: 'User Name',
      cell: (u) => (
        <div>
          <p className="font-bold text-text-primary">{u.name}</p>
          <p className="text-[11px] text-text-muted">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Roles',
      cell: (u) => (
        <div className="flex gap-1">
          {u.roles.map((r) => (
            <span key={r} className="px-2 py-0.5 bg-background-subtle border border-border text-[9px] font-bold uppercase rounded text-text-secondary">
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: () => (
        <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase text-success">
          <CheckCircle className="h-3 w-3" />
          <span>Active</span>
        </span>
      ),
    },
  ];

  const orderColumns: Column<DashboardOrder>[] = [
    {
      header: 'Order Number',
      cell: (o) => <span className="font-mono font-bold text-brand">{o.orderNumber}</span>,
    },
    {
      header: 'Items',
      cell: (o) => <span>{o.items.length} items</span>,
    },
    {
      header: 'Total Amount',
      cell: (o) => <span className="font-bold font-mono text-text-primary">₹{o.total.toFixed(0)}</span>,
    },
    {
      header: 'Status',
      cell: (o) => (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-brand/10 text-brand rounded">
          {o.status}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Executive Dashboard</h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time analytics, catalog moderation queue, and user operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/listings"
            className="px-4 py-2 bg-brand text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-brand-hover transition-colors shadow flex items-center space-x-1.5"
          >
            <span>Review Pending Books</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-border bg-surface rounded-md" />
          ))}
        </div>
      ) : isError || !stats ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load live administrative telemetry data.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry Data Load
          </button>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              title="Gross Merchandise Value"
              value={`₹${(stats.grossMerchandiseValue || 0).toLocaleString('en-IN')}`}
              change="+14.2%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="brand"
              description="Total processed marketplace transactions"
            />
            <AdminStatCard
              title="Total Orders Processed"
              value={stats.totalOrders}
              change="+8.6%"
              isPositive={true}
              icon={ShoppingBag}
              accentColor="success"
              description="Completed & active buyer purchases"
            />
            <AdminStatCard
              title="Active Book Catalog"
              value={stats.activeListings}
              change="+22.4%"
              isPositive={true}
              icon={BookOpen}
              accentColor="accent"
              description="Verified titles active for sale"
            />
            <AdminStatCard
              title="Registered Users & Sellers"
              value={stats.totalUsers}
              change="+11.0%"
              isPositive={true}
              icon={Users}
              accentColor="secondary"
              description="Verified campus accounts across India"
            />
          </div>

          {/* Data Tables Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AdminDataTable
              title="Recent Customer & Seller Registrations"
              subtitle="Latest student accounts created"
              data={stats.recentUsers}
              columns={userColumns}
              searchField="name"
              searchPlaceholder="Filter users..."
            />

            <AdminDataTable
              title="Recent Marketplace Orders"
              subtitle="Latest peer-to-peer textbook transactions"
              data={stats.recentOrders}
              columns={orderColumns}
              searchField="orderNumber"
              searchPlaceholder="Filter orders..."
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}
