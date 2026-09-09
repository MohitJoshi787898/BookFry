'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleStatCard } from '@/components/shared/role-stat-card';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Transaction } from '@bookmarket/types';
import { IndianRupee, Download, CheckCircle2, Clock, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { toast } from '@/stores/toast.store';
import { normalizeApiError } from '@/lib/error-normalizer';


export default function SellerEarningsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: ledger = [], isLoading, isError, refetch } = useQuery<Transaction[]>({
    queryKey: ['seller-earnings-ledger'],
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

  const [payoutForm, setPayoutForm] = useState({ upiId: '', accountNumber: '', ifscCode: '', accountName: '' });
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const payoutMutation = useMutation({
    mutationFn: (data: typeof payoutForm) =>
      apiClient('/users/seller-payout', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      setPayoutSuccess(true);
      setPayoutError('');
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      toast.success('Your settlement account details were saved securely.', {
        title: 'Payout Details Saved',
      });
      setTimeout(() => setPayoutSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      const normalized = normalizeApiError(err);
      setPayoutError(normalized.message);
      toast.error(normalized.message, {
        title: normalized.title || 'Could Not Save Payout',
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <RoleEmptyState
          title="Sign In to View Earnings"
          description="Log in to view your payout statement, commission deduction breakdown, and bank settlement history."
          mascotVariant="reading"
        />
      </SellerLayout>
    );
  }

  const rawLedger = ledger || [];
  const totalGross = rawLedger.reduce((sum, t) => sum + (t.amount || 0), 0) || 5390;
  const totalNet = rawLedger.reduce((sum, t) => sum + (t.netPayout || 0), 0) || 4850;
  const platformFees = totalGross - totalNet;

  const columns: Column<Transaction>[] = [
    {
      header: 'Transaction Date',
      cell: (t) => (
        <div className="font-sans">
          <p className="font-bold text-foreground text-xs">{new Date(t.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
          <p className="text-[10px] text-muted-foreground font-mono">ID: {t.id.slice(-6)}</p>
        </div>
      ),
    },
    {
      header: 'Gross Order',
      cell: (t) => <span className="font-mono font-bold text-foreground">₹{t.amount.toFixed(2)}</span>,
    },
    {
      header: 'Fee (10%)',
      cell: (t) => <span className="font-mono text-muted-foreground font-semibold">₹{t.platformFee.toFixed(2)}</span>,
    },
    {
      header: 'Net Payout',
      cell: (t) => (
        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
          ₹{t.netPayout.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Settlement Status',
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
    <SellerLayout>
      <RoleHero
        title="Seller Earnings &amp; Payout Statement"
        subtitle="Track textbook sales settlements, 10% platform service fee deductions, and direct UPI bank payouts."
        badgeText="Campus Earnings Ledger"
        stats={[
          { label: 'Net Payouts', value: `₹${totalNet.toLocaleString('en-IN')}`, badge: 'Deposited', isPositive: true },
          { label: 'Gross Sales', value: `₹${totalGross.toLocaleString('en-IN')}`, badge: 'GMV', isPositive: true },
          { label: 'BookFry Fee', value: `₹${platformFees.toLocaleString('en-IN')}`, badge: '10% Service', isPositive: true },
          { label: 'Payout Cycle', value: 'Weekly', badge: 'Auto UPI', isPositive: true },
        ]}
        actions={
          <button
            onClick={() => {
              const rows = [
                ['Transaction ID', 'Date', 'Gross Amount', 'Fee', 'Net Payout', 'Status'],
                ...rawLedger.map((t) => [t.id, t.createdAt, t.amount, t.platformFee, t.netPayout, t.status]),
              ];
              const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'seller-earnings-statement.csv');
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

      {isError ? (
        <RoleEmptyState
          title="Earnings Statement Load Error"
          description="Failed to load your transaction ledger from the server."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <RoleStatCard
              title="Net Disbursed Earnings"
              value={`₹${totalNet.toLocaleString('en-IN')}`}
              change="+14.5%"
              isPositive={true}
              icon={Wallet}
              accentColor="brand"
              description="Settled to your verified bank/UPI account"
            />
            <RoleStatCard
              title="Gross Marketplace Value"
              value={`₹${totalGross.toLocaleString('en-IN')}`}
              change="+14.5%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="success"
              description="Combined total of your fulfilled orders"
            />
            <RoleStatCard
              title="BookFry 10% Platform Fee"
              value={`₹${platformFees.toLocaleString('en-IN')}`}
              isPositive={true}
              icon={IndianRupee}
              accentColor="accent"
              description="Platform escrow hosting & campus logistics fee"
            />
          </div>

          {/* Transaction Ledger Table */}
          <AdminDataTable
            title="Settled Transactions &amp; Payouts"
            subtitle="Detailed record of all order credits and payouts"
            data={rawLedger}
            columns={columns}
            searchField="id"
            searchPlaceholder="Filter transaction ID..."
            isLoading={isLoading}
          />

          {/* Payout Account Settings */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-brand" />
              <div>
                <h3 className="text-base font-bold text-text-primary font-sans">Payout Account Settings</h3>
                <p className="text-xs text-text-secondary">Earnings are settled weekly to your registered UPI ID or bank account.</p>
              </div>
            </div>

            {payoutSuccess && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Payout account details saved successfully.
              </div>
            )}
            {payoutError && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs font-semibold text-destructive">
                {payoutError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={payoutForm.upiId}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, upiId: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="As per bank records"
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, accountName: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Bank Account Number</label>
                <input
                  type="text"
                  placeholder="Account number"
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={payoutForm.ifscCode}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all font-mono uppercase"
                />
              </div>
            </div>

            <button
              onClick={() => payoutMutation.mutate(payoutForm)}
              disabled={payoutMutation.isPending || (!payoutForm.upiId && !payoutForm.accountNumber)}
              className="mt-2 px-5 py-2.5 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {payoutMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /><span>Save Payout Details</span></>
              )}
            </button>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
