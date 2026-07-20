'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { BarChart3, ShieldAlert, IndianRupee, Download } from 'lucide-react';

interface MonthlyReportItem {
  month: string;
  revenue: number;
  ordersCount: number;
}

interface StatusCountItem {
  status: string;
  count: number;
}

interface AdminReports {
  monthlyReport: MonthlyReportItem[];
  statusCounts: StatusCountItem[];
}

export default function AdminReportsPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const {
    data: reports,
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminReports>({
    queryKey: ['admin-reports'],
    queryFn: () => apiClient('/admin/reports'),
    enabled: isAuthenticated && isAdmin,
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = reports?.monthlyReport.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  const platformCommission = totalRevenue * 0.1;

  const monthlyColumns: Column<MonthlyReportItem>[] = [
    {
      header: 'Billing Period',
      cell: (r) => <span className="font-bold text-text-primary">{r.month}</span>,
    },
    {
      header: 'Orders Completed',
      cell: (r) => <span className="font-mono">{r.ordersCount} orders</span>,
    },
    {
      header: 'Gross Revenue (GMV)',
      cell: (r) => <span className="font-bold font-mono text-text-primary">₹{r.revenue.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'BookFry Platform Fee (10%)',
      cell: (r) => (
        <span className="font-bold font-mono text-success">
          ₹{(r.revenue * 0.1).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <BarChart3 className="h-7 w-7 text-brand" />
            <span>Financial Telemetry & Sales Reports</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track Gross Merchandise Value, platform commission earnings, and sales volume over time.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting CSV financial statement...')}
          className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover transition-colors shadow flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 border border-border bg-surface rounded-md" />
            ))}
          </div>
          <div className="h-64 border border-border bg-surface rounded-md" />
        </div>
      ) : isError || !reports ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load platform financial telemetry.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry Financial Fetch
          </button>
        </div>
      ) : (
        <>
          {/* Top Financial Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminStatCard
              title="Total Processed GMV"
              value={`₹${totalRevenue.toLocaleString('en-IN')}`}
              change="+18.5%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="brand"
              description="Aggregated order value across all billing periods"
            />
            <AdminStatCard
              title="Net Platform Commission (10%)"
              value={`₹${platformCommission.toLocaleString('en-IN')}`}
              change="+18.5%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="success"
              description="BookFry transaction fee revenue"
            />
            <AdminStatCard
              title="Total Completed Orders"
              value={reports.monthlyReport.reduce((acc, c) => acc + c.ordersCount, 0)}
              change="+12.0%"
              isPositive={true}
              icon={BarChart3}
              accentColor="accent"
              description="Delivered student purchases across India"
            />
          </div>

          {/* Monthly Sales Breakdown Table */}
          <AdminDataTable
            title="Monthly Sales & Commission Ledger"
            subtitle="Financial billing breakdown"
            data={reports.monthlyReport}
            columns={monthlyColumns}
            searchField="month"
            searchPlaceholder="Filter billing month..."
          />

          {/* Order Status Distribution Grid */}
          <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4 font-sans">
            <h3 className="font-serif text-lg font-bold text-text-primary">Order Status Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {reports.statusCounts.map((sc: StatusCountItem) => (
                <div key={sc.status} className="p-4 border border-border rounded bg-background-subtle space-y-1">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">{sc.status}</span>
                  <span className="text-2xl font-bold font-mono text-text-primary block">{sc.count}</span>
                  <span className="text-[11px] text-text-secondary font-medium">orders</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
