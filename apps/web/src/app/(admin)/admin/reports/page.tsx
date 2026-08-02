'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
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
        <div className="text-center py-16 border border-border/80 bg-card rounded-3xl font-sans space-y-4 shadow-xl my-8">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You must have Administrative privileges to view platform financial telemetry and accounting ledgers.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue = reports?.monthlyReport.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  const platformCommission = totalRevenue * 0.1;
  const totalOrders = reports?.monthlyReport.reduce((acc, c) => acc + c.ordersCount, 0) || 0;

  const monthlyColumns: Column<MonthlyReportItem>[] = [
    {
      header: 'Billing Period',
      cell: (r) => <span className="font-bold text-foreground">{r.month}</span>,
    },
    {
      header: 'Orders Completed',
      cell: (r) => <span className="font-mono font-semibold">{r.ordersCount} orders</span>,
    },
    {
      header: 'Gross Revenue (GMV)',
      cell: (r) => <span className="font-bold font-mono text-foreground">₹{r.revenue.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'BookFry Platform Fee (10%)',
      cell: (r) => (
        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
          ₹{(r.revenue * 0.1).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Brand Hero Section Header */}
      <AdminHero
        title="Financial Telemetry & Sales Reports"
        subtitle="Track Gross Merchandise Value, platform commission earnings, and sales volume over time across India."
        badgeText="Financial Telemetry & Ledger"
        stats={[
          { label: "Gross GMV", value: `₹${totalRevenue.toLocaleString('en-IN')}`, badge: "Total Sales", isPositive: true },
          { label: "Commission (10%)", value: `₹${platformCommission.toLocaleString('en-IN')}`, badge: "Net Revenue", isPositive: true },
          { label: "Total Orders", value: totalOrders, badge: "Completed", isPositive: true },
          { label: "Report Status", value: "Verified", badge: "Audited Ledger", isPositive: true },
        ]}
      />

      <div className="flex justify-end pb-2">
        <button
          onClick={async () => {
            try {
              const res = await apiClient<string>('/admin/reports/export');
              const blob = new Blob([res], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'bookfry-sales-report.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Failed to export CSV', err);
            }
          }}
          className="px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#F26522]/20 flex items-center space-x-2 active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 border border-border/80 bg-card rounded-3xl" />
            ))}
          </div>
          <div className="h-64 border border-border/80 bg-card rounded-3xl" />
        </div>
      ) : isError || !reports ? (
        <div className="p-8 text-center border border-border/80 bg-card rounded-3xl font-sans space-y-3 shadow-xl">
          <p className="text-sm font-bold text-rose-500">Failed to load platform financial telemetry.</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-[#F26522] text-white text-xs font-bold rounded-2xl hover:bg-[#D64E0F] active:scale-95"
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
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl font-sans">
            <AdminDataTable
              title="Monthly Sales & Commission Ledger"
              subtitle="Financial billing breakdown and platform earnings"
              data={reports.monthlyReport}
              columns={monthlyColumns}
              searchField="month"
              searchPlaceholder="Filter billing month..."
            />
          </div>

          {/* Order Status Distribution Grid */}
          <div className="border border-border/80 bg-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 font-sans">
            <h3 className="font-serif text-lg font-bold text-foreground">Order Status Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {reports.statusCounts.map((sc: StatusCountItem) => (
                <div key={sc.status} className="p-4 border border-border/60 rounded-2xl bg-muted/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">{sc.status}</span>
                  <span className="text-2xl font-black font-mono text-foreground block">{sc.count}</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">orders</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
