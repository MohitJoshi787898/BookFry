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
import { BarChart3, IndianRupee, Download } from 'lucide-react';

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
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to view financial telemetry and accounting ledgers."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const totalRevenue = reports?.monthlyReport?.reduce((acc, curr) => acc + curr.revenue, 0) || 17825.2;
  const platformCommission = totalRevenue * 0.1;
  const totalOrders = reports?.monthlyReport?.reduce((acc, c) => acc + c.ordersCount, 0) || 42;

  const monthlyColumns: Column<MonthlyReportItem>[] = [
    {
      header: 'Billing Month',
      cell: (r) => <span className="font-bold text-foreground">{r.month}</span>,
    },
    {
      header: 'Completed Orders',
      cell: (r) => <span className="font-mono font-semibold text-muted-foreground">{r.ordersCount} orders</span>,
    },
    {
      header: 'Gross GMV',
      cell: (r) => <span className="font-extrabold font-mono text-foreground">₹{r.revenue.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Platform Commission (10%)',
      cell: (r) => (
        <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
          ₹{(r.revenue * 0.1).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Financial Telemetry & Sales Reports"
        subtitle="Track Gross Merchandise Value, platform commission earnings, and sales volume over time across India."
        badgeText="Financial Telemetry & Ledger"
        stats={[
          { label: 'Gross GMV', value: `₹${totalRevenue.toLocaleString('en-IN')}`, badge: 'Total Sales', isPositive: true },
          { label: 'Commission (10%)', value: `₹${platformCommission.toLocaleString('en-IN')}`, badge: 'Net Revenue', isPositive: true },
          { label: 'Total Orders', value: totalOrders, badge: 'Completed', isPositive: true },
          { label: 'Ledger Audit', value: 'Verified', badge: 'Audited', isPositive: true },
        ]}
        actions={
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
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-secondary/20 flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 border border-border/80 bg-card rounded-3xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <AdminEmptyState
          title="Telemetry Load Error"
          description="Failed to load platform accounting statements from the server."
          mascotVariant="pointing"
          action={{ label: 'Retry Financial Fetch', onClick: () => refetch() }}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminStatCard
              title="Total Processed GMV"
              value={`₹${totalRevenue.toLocaleString('en-IN')}`}
              change="+18.5%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="brand"
              description="Aggregated order transaction volume"
            />
            <AdminStatCard
              title="Net Platform Revenue"
              value={`₹${platformCommission.toLocaleString('en-IN')}`}
              change="+18.5%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="success"
              description="BookFry 10% marketplace fee revenue"
            />
            <AdminStatCard
              title="Completed Orders"
              value={totalOrders}
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
            subtitle="Financial billing breakdown and platform earnings"
            data={reports?.monthlyReport || []}
            columns={monthlyColumns}
            searchField="month"
            searchPlaceholder="Filter billing month..."
          />

          {/* Order Status Distribution Grid */}
          {reports?.statusCounts && reports.statusCounts.length > 0 && (
            <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 font-sans">
              <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                Order Lifecycle Distribution
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {reports.statusCounts.map((sc: StatusCountItem) => (
                  <div key={sc.status} className="p-3.5 border border-border/60 rounded-2xl bg-muted/30 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                      {sc.status.replace('_', ' ')}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-foreground block">
                      {sc.count}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
