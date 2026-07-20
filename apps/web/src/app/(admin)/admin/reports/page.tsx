'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { BarChart3, ArrowLeft, ShieldAlert, TrendingUp } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Control Panel</span>
        </Link>

        <div className="flex justify-between items-center border-b border-border pb-6">
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-brand" />
            <span>Platform Financial & Sales Reports</span>
          </h1>
        </div>

        {!isAdmin ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
            <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Access Restricted</h2>
          </div>
        ) : isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 border border-border bg-surface rounded-md" />
            <div className="h-48 border border-border bg-surface rounded-md" />
          </div>
        ) : isError || !reports ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load platform reports
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8 font-sans">
            {/* Monthly Sales Breakdown */}
            <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                <span>Monthly Gross Revenue Overview</span>
              </h2>

              {reports.monthlyReport.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  No monthly sales data collected yet.
                </p>
              ) : (
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background-subtle text-xs font-bold uppercase tracking-wider text-text-secondary">
                        <th className="p-4">Billing Month</th>
                        <th className="p-4">Orders Completed</th>
                        <th className="p-4">Gross Revenue</th>
                        <th className="p-4">Platform Fee (10%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reports.monthlyReport.map((item: MonthlyReportItem, idx: number) => {
                        const fee = item.revenue * 0.1;
                        return (
                          <tr key={idx} className="hover:bg-background-subtle">
                            <td className="p-4 font-bold text-text-primary">{item.month}</td>
                            <td className="p-4 text-text-secondary">{item.ordersCount} orders</td>
                            <td className="p-4 font-bold text-text-primary">${item.revenue.toFixed(2)}</td>
                            <td className="p-4 font-bold text-success">${fee.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-text-primary">Order Status Distribution</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {reports.statusCounts.map((sc: StatusCountItem) => (
                  <div key={sc.status} className="p-4 border border-border rounded bg-background-subtle">
                    <span className="text-xs text-text-muted uppercase font-bold block">{sc.status}</span>
                    <span className="text-2xl font-bold text-text-primary mt-1 block">{sc.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
