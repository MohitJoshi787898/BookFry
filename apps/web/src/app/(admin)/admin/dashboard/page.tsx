'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  Users,
  BookOpen,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  Calendar,
  MoreVertical,
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
  { _id: '1', name: 'Siddharth Nair', email: 'siddharth.nair@anna.edu', roles: ['CUSTOMER', 'SELLER'], joinedOn: '11 Jun 2025 10:24 AM' },
  { _id: '2', name: 'Vikram Singh', email: 'vikram.singh@bits.ac.in', roles: ['CUSTOMER', 'SELLER'], joinedOn: '11 Jun 2025 09:15 AM' },
  { _id: '3', name: 'Ananya Roy', email: 'ananya.roy@du.ac.in', roles: ['CUSTOMER', 'SELLER'], joinedOn: '10 Jun 2025 08:45 PM' },
  { _id: '4', name: 'Rahul Verma', email: 'rahul.verma@du.ac.in', roles: ['CUSTOMER', 'SELLER'], joinedOn: '10 Jun 2025 06:10 PM' },
  { _id: '5', name: 'Priya Sharma', email: 'priya.sharma@iitd.ac.in', roles: ['CUSTOMER', 'SELLER'], joinedOn: '10 Jun 2025 04:32 PM' },
];

const mockRecentOrders: DashboardOrder[] = [
  { _id: '1', orderNumber: 'ORD-766893-3E7S', total: 1447, status: 'CONFIRMED', items: [1, 2] },
  { _id: '2', orderNumber: 'ORD-331646-4678', total: 188, status: 'CONFIRMED', items: [1] },
  { _id: '3', orderNumber: 'BF-ORD-1040', total: 590, status: 'CONFIRMED', items: [1] },
  { _id: '4', orderNumber: 'BF-ORD-1039', total: 360, status: 'CONFIRMED', items: [1] },
  { _id: '5', orderNumber: 'BF-ORD-1038', total: 490, status: 'CONFIRMED', items: [1] },
];

// Pre-configured columns for Siddhartha Nair & users
const userColumns: Column<DashboardUser>[] = [
  {
    header: 'User',
    cell: (u) => {
      const initial = u.name.split(' ').map((n) => n[0]).join('');
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-orange-500 text-white font-extrabold text-[11px] flex items-center justify-center shadow-3xs">
            {initial}
          </div>
          <div>
            <p className="font-extrabold text-text-primary text-xs">{u.name}</p>
            <p className="text-[10px] font-bold text-text-muted leading-relaxed">{u.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Roles',
    cell: (u) => (
      <div className="flex gap-1.5">
        {u.roles.map((r) => (
          <span key={r} className="px-2 py-0.5 bg-background-subtle border border-border/80 text-[9px] font-extrabold rounded-md text-text-secondary tracking-wide">
            {r}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: 'Status',
    cell: () => (
      <span className="inline-flex items-center space-x-1.5 text-[10px] font-black text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Active</span>
      </span>
    ),
  },
  {
    header: 'Joined On',
    cell: (u) => <span className="text-[10px] font-bold text-text-secondary">{u.joinedOn || '11 Jun 2025 10:24 AM'}</span>,
  },
  {
    header: '',
    cell: () => (
      <button className="text-text-muted hover:text-text-primary">
        <MoreVertical className="h-4 w-4" />
      </button>
    ),
  },
];

// Pre-configured columns for orders list
const orderColumns: Column<DashboardOrder>[] = [
  {
    header: 'Order Number',
    cell: (o) => <span className="font-bold text-text-primary text-xs">{o.orderNumber}</span>,
  },
  {
    header: 'Items',
    cell: (o) => <span className="font-bold text-text-secondary">{o.items.length} items</span>,
  },
  {
    header: 'Total Amount',
    cell: (o) => <span className="font-bold font-mono text-text-primary">₹{o.total.toLocaleString()}</span>,
  },
  {
    header: 'Status',
    cell: () => (
      <span className="text-[9px] font-black tracking-wider px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/10">
        CONFIRMED
      </span>
    ),
  },
];

function SalesOverviewChart() {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Sales Overview</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <h4 className="text-xl font-bold text-text-primary">₹17,825.20</h4>
            <span className="text-[10px] font-bold text-emerald-600">↗ +14.2%</span>
          </div>
        </div>
        <select className="px-2.5 py-1 text-[10px] font-bold bg-background-subtle border border-border rounded-lg text-text-primary">
          <option>This Month</option>
        </select>
      </div>

      <div className="relative h-44 w-full pt-4">
        {/* Tooltip Overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg p-2 shadow-sm text-[10px] font-bold text-center z-10">
          <p className="text-[8px] opacity-70">Jun 06, 2025</p>
          <p className="text-[#F26522]">₹18,650</p>
        </div>

        {/* SVG Spark Area Chart */}
        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F26522" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F26522" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="90" x2="300" y2="90" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="30" x2="300" y2="30" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Area under curve */}
          <path
            d="M0 110 C50 90, 80 100, 120 70 C160 40, 200 80, 240 50 L300 20 L300 120 L0 120 Z"
            fill="url(#salesGrad)"
          />
          {/* Curve stroke */}
          <path
            d="M0 110 C50 90, 80 100, 120 70 C160 40, 200 80, 240 50 L300 20"
            fill="none"
            stroke="#F26522"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex justify-between text-[8px] font-black text-text-muted uppercase tracking-widest pt-2">
        <span>May 12</span>
        <span>May 19</span>
        <span>May 26</span>
        <span>Jun 02</span>
        <span>Jun 09</span>
      </div>
    </div>
  );
}

function OrdersOverviewChart() {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Orders Overview</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <h4 className="text-xl font-bold text-text-primary">42</h4>
            <span className="text-[10px] font-bold text-emerald-600">↗ +8.6%</span>
          </div>
        </div>
        <select className="px-2.5 py-1 text-[10px] font-bold bg-background-subtle border border-border rounded-lg text-text-primary">
          <option>This Month</option>
        </select>
      </div>

      <div className="relative h-44 w-full pt-4">
        {/* Tooltip Overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg p-2 shadow-sm text-[10px] font-bold text-center z-10">
          <p className="text-[8px] opacity-70">Jun 06, 2025</p>
          <p className="text-emerald-500">46</p>
        </div>

        {/* SVG Spark Area Chart */}
        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="90" x2="300" y2="90" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="30" x2="300" y2="30" stroke="#ECECEC" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Area under curve */}
          <path
            d="M0 100 C50 95, 80 110, 125 80 C170 50, 200 90, 240 70 L300 35 L300 120 L0 120 Z"
            fill="url(#ordersGrad)"
          />
          {/* Curve stroke */}
          <path
            d="M0 100 C50 95, 80 110, 125 80 C170 50, 200 90, 240 70 L300 35"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex justify-between text-[8px] font-black text-text-muted uppercase tracking-widest pt-2">
        <span>May 12</span>
        <span>May 19</span>
        <span>May 26</span>
        <span>Jun 02</span>
        <span>Jun 09</span>
      </div>
    </div>
  );
}

function TopCategoriesDonut() {
  const categoriesList = [
    { name: 'Engineering', pct: 35, count: 6, color: '#3B82F6' },
    { name: 'Competitive Exams', pct: 29, count: 5, color: '#06B6D4' },
    { name: 'Management', pct: 18, count: 3, color: '#F26522' },
    { name: 'Medical', pct: 12, count: 2, color: '#10B981' },
    { name: 'Others', pct: 6, count: 1, color: '#94A3B8' },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4 font-sans flex flex-col justify-between">
      <div className="border-b border-border/40 pb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Top Categories</span>
        <p className="text-[10px] text-text-muted mt-0.5 font-bold">By number of active books</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        
        {/* SVG Donut Circle */}
        <div className="relative h-32 w-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.25" strokeDasharray="35 65" strokeDashoffset="0" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="3.25" strokeDasharray="29 71" strokeDashoffset="-35" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F26522" strokeWidth="3.25" strokeDasharray="18 82" strokeDashoffset="-64" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.25" strokeDasharray="12 88" strokeDashoffset="-82" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#94A3B8" strokeWidth="3.25" strokeDasharray="6 94" strokeDashoffset="-94" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xs font-black text-text-muted">TOTAL</span>
            <span className="text-base font-extrabold text-text-primary">17</span>
          </div>
        </div>

        {/* Labels checklist */}
        <div className="flex-grow space-y-1.5 w-full">
          {categoriesList.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate max-w-[100px]">{cat.name}</span>
              </div>
              <span className="font-mono text-text-primary">
                {cat.pct}% <span className="text-text-muted">({cat.count})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessRestrictedBanner() {
  return (
    <div className="text-center py-16 border border-border bg-card rounded-2xl space-y-4 font-sans shadow-xs">
      <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
      <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        You must have Administrative privileges to view this control panel.
      </p>
    </div>
  );
}

function ExecutiveDashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80 font-sans">
      <div>
        <h1 className="font-serif text-2xl font-bold text-text-primary flex items-center gap-2">
          <span>Executive Dashboard</span>
          <span>👋</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Real-time overview of your BookFry marketplace.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="px-3.5 py-2 bg-card border border-border/80 hover:bg-background-subtle rounded-xl text-xs font-bold text-text-primary flex items-center space-x-2 transition-all active:scale-95 shadow-2xs">
          <span>May 12 - Jun 11, 2025</span>
          <Calendar className="h-4 w-4 text-text-muted" />
        </button>

        <Link
          href="/admin/listings"
          className="px-4 py-2 bg-[#F26522] hover:bg-[#e05310] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5 active:scale-95"
        >
          <span>Review Pending Books</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function DashboardKpisGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminStatCard
        title="Gross Merchandise Value"
        value={`₹${(stats.grossMerchandiseValue || 17825.2).toLocaleString('en-IN')}`}
        change="14.2%"
        isPositive={true}
        icon={IndianRupee}
        accentColor="brand"
        description="Total processed marketplace transactions"
      />
      <AdminStatCard
        title="Total Orders Processed"
        value={stats.totalOrders || 42}
        change="8.6%"
        isPositive={true}
        icon={ShoppingBag}
        accentColor="success"
        description="Completed & active buyer purchases"
      />
      <AdminStatCard
        title="Active Book Catalog"
        value={stats.activeListings || 17}
        change="22.4%"
        isPositive={true}
        icon={BookOpen}
        accentColor="accent"
        description="Verified titles active for sale"
      />
      <AdminStatCard
        title="Registered Users & Sellers"
        value={stats.totalUsers || 12}
        change="11.0%"
        isPositive={true}
        icon={Users}
        accentColor="secondary"
        description="Verified campus accounts across India"
      />
    </div>
  );
}

function DashboardViews({ activeStats }: { activeStats: DashboardStats }) {
  return (
    <div className="space-y-8">
      
      {/* KPI Stat Cards Grid */}
      <DashboardKpisGrid stats={activeStats} />

      {/* Tables Overview side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminDataTable
          title="Recent Customer & Seller Registrations"
          subtitle="Latest student accounts created"
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

      {/* Bottom Area Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SalesOverviewChart />
        <OrdersOverviewChart />
        <TopCategoriesDonut />
      </div>

    </div>
  );
}

function AdminDashboardPage() {
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
        <AccessRestrictedBanner />
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
      <ExecutiveDashboardHeader />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-border bg-card rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center border border-border bg-card rounded-2xl font-sans space-y-3 shadow-xs">
          <p className="text-sm font-bold text-danger">Failed to load live administrative telemetry data.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#F26522] hover:bg-[#e05310] text-white text-xs font-bold rounded-xl"
          >
            Retry Data Load
          </button>
        </div>
      ) : (
        <DashboardViews activeStats={activeStats} />
      )}
    </AdminLayout>
  );
}
export default AdminDashboardPage;
