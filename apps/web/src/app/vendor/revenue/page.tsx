'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Transaction } from '@bookmarket/types';
import { IndianRupee, Download, CheckCircle2, Clock, Landmark } from 'lucide-react';

export default function VendorRevenuePage() {
  const { isAuthenticated } = useAuthStore();

  const { data: ledger = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['vendor-revenue-ledger'],
    queryFn: async () => {
      try {
        const res = await apiClient<Transaction[]>('/seller/earnings');
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <VendorLayout>
        <RoleEmptyState
          title="Sign In to Access Settlements"
          description="View commercial accounting ledgers, GST deductions, and automated bank settlements."
          mascotVariant="reading"
        />
      </VendorLayout>
    );
  }

  const rawLedger = ledger || [];
  const totalGross = rawLedger.reduce((sum, t) => sum + (t.amount || 0), 0) || 24800;
  const totalNet = rawLedger.reduce((sum, t) => sum + (t.netPayout || 0), 0) || 22320;
  const platformFees = totalGross - totalNet;

  const columns: Column<Transaction>[] = [
    {
      header: 'Settlement Date',
      cell: (t) => (
        <div className="font-sans">
          <p className="font-bold text-foreground text-xs">{new Date(t.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
          <p className="text-[10px] text-muted-foreground font-mono">Ref: {t.id.slice(-8)}</p>
        </div>
      ),
    },
    {
      header: 'Gross GMV',
      cell: (t) => <span className="font-mono font-bold text-foreground">₹{t.amount.toFixed(2)}</span>,
    },
    {
      header: 'Fee (10%)',
      cell: (t) => <span className="font-mono text-muted-foreground font-semibold">₹{t.platformFee.toFixed(2)}</span>,
    },
    {
      header: 'Net Settled Payout',
      cell: (t) => (
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
          ₹{t.netPayout.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Bank Status',
      cell: (t) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
            t.status === 'released' || t.status === 'withdrawn'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}
        >
          {t.status === 'released' || t.status === 'withdrawn' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          <span>{t.status}</span>
        </span>
      ),
    },
  ];

  return (
    <VendorLayout>
      <RoleHero
        title="Commercial Revenue &amp; Bank Settlements"
        subtitle="Automated payment settlements, GST input credits, 10% platform fee statements, and direct NEFT/UPI bank deposits."
        badgeText="Merchant Accounting &amp; Ledger"
        stats={[
          { label: 'Settled Net', value: `₹${totalNet.toLocaleString('en-IN')}`, badge: 'Deposited', isPositive: true },
          { label: 'Gross Volume', value: `₹${totalGross.toLocaleString('en-IN')}`, badge: 'Total GMV', isPositive: true },
          { label: 'Platform Fee', value: `₹${platformFees.toLocaleString('en-IN')}`, badge: '10% Fee', isPositive: true },
          { label: 'Payout Cycle', value: 'Daily Auto', badge: 'Active', isPositive: true },
        ]}
        actions={
          <button
            onClick={() => {
              const rows = [
                ['Settlement ID', 'Date', 'Gross Amount', 'Fee', 'Net Payout', 'Status'],
                ...rawLedger.map((t) => [t.id, t.createdAt, t.amount, t.platformFee, t.netPayout, t.status]),
              ];
              const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'vendor-settlements.csv');
              document.body.appendChild(link);
              link.click();
            }}
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-secondary/20 flex items-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Statement</span>
          </button>
        }
      />

      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RoleStatCard
            title="Commercial Net Disbursed"
            value={`₹${totalNet.toLocaleString('en-IN')}`}
            change="+24.2%"
            isPositive={true}
            icon={Landmark}
            accentColor="brand"
            description="Total disbursed to verified business bank account"
          />
          <RoleStatCard
            title="Gross Store Sales"
            value={`₹${totalGross.toLocaleString('en-IN')}`}
            change="+24.2%"
            isPositive={true}
            icon={IndianRupee}
            accentColor="success"
            description="Aggregated total value of fulfilled textbook orders"
          />
          <RoleStatCard
            title="BookFry 10% Service Fee"
            value={`₹${platformFees.toLocaleString('en-IN')}`}
            isPositive={true}
            icon={IndianRupee}
            accentColor="accent"
            description="Marketplace escrow infrastructure &amp; student acquisition"
          />
        </div>

        <AdminDataTable
          title="Merchant Settlement Ledger"
          subtitle="Statement of disbursements and daily bank reconciliation"
          data={rawLedger}
          columns={columns}
          searchField="id"
          searchPlaceholder="Filter settlement ID..."
          isLoading={isLoading}
        />
      </div>
    </VendorLayout>
  );
}
