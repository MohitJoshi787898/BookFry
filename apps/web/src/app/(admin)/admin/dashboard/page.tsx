'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  Users,
  BookOpen,
  ShoppingBag,
  IndianRupee,
  ArrowRight,
  AlertTriangle,
  Tag,
  FileText,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardUser {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  joinedOn: string;
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

const mockRecentUsers: DashboardUser[] = [
  { _id: '1', name: 'Siddharth Nair', email: 'siddharth.nair@anna.edu', roles: ['customer', 'seller'], joinedOn: '11 Jun 2025 10:24 AM' },
  { _id: '2', name: 'Vikram Singh', email: 'vikram.singh@bits.ac.in', roles: ['customer', 'seller'], joinedOn: '11 Jun 2025 09:15 AM' },
  { _id: '3', name: 'Ananya Roy', email: 'ananya.roy@du.ac.in', roles: ['customer', 'seller'], joinedOn: '10 Jun 2025 08:45 PM' },
  { _id: '4', name: 'Rahul Verma', email: 'rahul.verma@du.ac.in', roles: ['customer', 'seller'], joinedOn: '10 Jun 2025 06:10 PM' },
  { _id: '5', name: 'Priya Sharma', email: 'priya.sharma@iitd.ac.in', roles: ['customer', 'seller'], joinedOn: '10 Jun 2025 04:32 PM' },
];

const mockRecentOrders: DashboardOrder[] = [
  { _id: '1', orderNumber: 'ORD-766893-3E7S', total: 1447, status: 'confirmed', items: [1, 2] },
  { _id: '2', orderNumber: 'ORD-331646-4678', total: 188, status: 'confirmed', items: [1] },
  { _id: '3', orderNumber: 'BF-ORD-1040', total: 590, status: 'confirmed', items: [1] },
  { _id: '4', orderNumber: 'BF-ORD-1039', total: 360, status: 'confirmed', items: [1] },
  { _id: '5', orderNumber: 'BF-ORD-1038', total: 490, status: 'confirmed', items: [1] },
];

const userColumns: Column<DashboardUser>[] = [
  {
    header: 'User & College Email',
    cell: (u) => {
      const initial = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-xl bg-secondary/15 text-secondary font-black text-xs flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-xs truncate">{u.name}</p>
            <p className="text-[11px] font-medium text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Roles',
    cell: (u) => (
      <div className="flex gap-1">
        {u.roles.map((r) => (
          <span key={r} className="px-2 py-0.5 bg-muted border border-border/80 text-[10px] font-extrabold uppercase rounded-lg text-foreground">
            {r}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: 'Status',
    cell: () => (
      <span className="inline-flex items-center space-x-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Active</span>
      </span>
    ),
  },
];

const orderColumns: Column<DashboardOrder>[] = [
  {
    header: 'Order Ref',
    cell: (o) => <span className="font-mono font-bold text-foreground text-xs">{o.orderNumber}</span>,
  },
  {
    header: 'Items',
    cell: (o) => <span className="font-semibold text-muted-foreground">{o.items.length} items</span>,
  },
  {
    header: 'Total Amount',
    cell: (o) => <span className="font-mono font-extrabold text-foreground">₹{o.total.toLocaleString('en-IN')}</span>,
  },
  {
    header: 'Status',
    cell: () => (
      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
        Confirmed
      </span>
    ),
  },
];

function QuickActionPills() {
  const actions = [
    { label: 'Moderate Books', href: '/admin/listings', icon: BookOpen, primary: true },
    { label: 'Review Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Issue Promo Token', href: '/admin/promotions', icon: Tag },
    { label: 'Storefront CMS', href: '/admin/cms', icon: FileText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-1 font-sans">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
              act.primary
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-card text-foreground border border-border/80 hover:bg-muted'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{act.label}</span>
          </Link>
        );
      })}
    </div>
  );
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
        <AdminEmptyState
          title="Administrative Access Restricted"
          description="You must be logged in with verified Super Admin credentials to access the command center."
          mascotVariant="reading"
          action={{
            label: 'Return to Storefront',
            onClick: () => window.location.assign('/'),
          }}
        />
      </AdminLayout>
    );
  }

  const activeStats = stats || {
    totalUsers: 12,
    activeListings: 17,
    totalOrders: 42,
    grossMerchandiseValue: 17825.2,
    recentUsers: mockRecentUsers,
    recentOrders: mockRecentOrders,
  };

  return (
    <AdminLayout>
      {/* Executive Hero Banner */}
      <AdminHero
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}!`}
        subtitle="Real-time telemetry, peer escrow transactions, student onboarding, and catalog quality control."
        badgeText="Executive Command Center"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'GMV Volume', value: `₹${(activeStats.grossMerchandiseValue || 17825.2).toLocaleString('en-IN')}`, badge: '+14.2%', isPositive: true },
          { label: 'Active Orders', value: activeStats.totalOrders || 42, badge: '+8.6%', isPositive: true },
          { label: 'Catalog Titles', value: activeStats.activeListings || 17, badge: '+22.4%', isPositive: true },
          { label: 'Verified Accounts', value: activeStats.totalUsers || 12, badge: '+11.0%', isPositive: true },
        ]}
        actions={
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-secondary text-white text-xs font-bold shadow-md shadow-secondary/20 active:scale-95"
          >
            <span>Moderation Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Quick Action Shortcuts */}
      <QuickActionPills />

      {/* Action Required Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
          <div className="p-2 rounded-2xl bg-amber-500/15 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">Action Required: Catalog & Support Queues</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Review seller submitted textbook listings and ensure response SLA for open buyer tickets.
            </p>
          </div>
        </div>
        <Link
          href="/admin/listings"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl transition-all shadow-xs shrink-0 self-end sm:self-center"
        >
          Review Backlog
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-border/80 bg-card rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <AdminEmptyState
          title="Telemetry Connection Issue"
          description="Failed to sync real-time administrative telemetry data with the backend."
          mascotVariant="pointing"
          action={{
            label: 'Retry Connection',
            onClick: () => refetch(),
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              title="Gross Merchandise Value"
              value={`₹${(activeStats.grossMerchandiseValue || 17825.2).toLocaleString('en-IN')}`}
              change="14.2%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="brand"
              description="Aggregated order transaction volume"
            />
            <AdminStatCard
              title="Total Orders Processed"
              value={activeStats.totalOrders || 42}
              change="8.6%"
              isPositive={true}
              icon={ShoppingBag}
              accentColor="success"
              description="Delivered & active textbook sales"
            />
            <AdminStatCard
              title="Active Book Catalog"
              value={activeStats.activeListings || 17}
              change="22.4%"
              isPositive={true}
              icon={BookOpen}
              accentColor="accent"
              description="Approved titles live for purchase"
            />
            <AdminStatCard
              title="Verified Users & Sellers"
              value={activeStats.totalUsers || 12}
              change="11.0%"
              isPositive={true}
              icon={Users}
              accentColor="secondary"
              description="Registered campus students across India"
            />
          </div>

          {/* Side-by-Side Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminDataTable
              title="Recent Account Registrations"
              subtitle="Latest student & seller accounts created"
              data={activeStats.recentUsers || mockRecentUsers}
              columns={userColumns}
              searchField="name"
              searchPlaceholder="Filter users..."
            />

            <AdminDataTable
              title="Recent Marketplace Orders"
              subtitle="Latest peer-to-peer textbook transactions"
              data={activeStats.recentOrders || mockRecentOrders}
              columns={orderColumns}
              searchField="orderNumber"
              searchPlaceholder="Filter orders..."
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
