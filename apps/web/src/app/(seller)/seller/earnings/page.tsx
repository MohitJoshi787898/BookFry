'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Transaction } from '@bookmarket/types';
import { DollarSign, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function SellerEarningsPage() {
  const { isAuthenticated } = useAuthStore();

  const {
    data: ledgerRaw,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data?: Transaction[]; ledger?: Transaction[] } | Transaction[]>({
    queryKey: ['seller-earnings'],
    queryFn: () => apiClient('/seller/earnings'),
    enabled: isAuthenticated,
  });

  const ledger: Transaction[] = Array.isArray(ledgerRaw)
    ? ledgerRaw
    : ledgerRaw?.data || ledgerRaw?.ledger || [];

  const { user } = useAuthStore();
  const [upiId, setUpiId] = React.useState(user?.sellerProfile?.payoutDetails?.upiId || '');
  const [accountName, setAccountName] = React.useState(user?.sellerProfile?.payoutDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = React.useState(user?.sellerProfile?.payoutDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = React.useState(user?.sellerProfile?.payoutDetails?.ifscCode || '');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient('/users/seller-payout', {
        method: 'PATCH',
        body: JSON.stringify({ upiId, accountName, accountNumber, ifscCode }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save payout settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    released: 'bg-success/10 text-success border-success/20',
    withdrawn: 'bg-accent/10 text-accent border-accent/20',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-brand" />
          <span>Earnings Ledger</span>
        </h1>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load transactions ledger
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : ledger.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <DollarSign className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">No transaction history</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You haven&apos;t completed any transaction listings yet. Complete your catalog sales to earn payouts.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-border bg-background-subtle text-xs font-bold uppercase tracking-wider text-text-secondary font-sans">
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4">Gross Sale</th>
                    <th className="p-4">Platform Fee (10%)</th>
                    <th className="p-4">Net Payout</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-sans">
                  {ledger.map((tx) => {
                    const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-background-subtle transition-colors">
                        <td className="p-4 flex items-center space-x-2 font-sans">
                          <Calendar className="h-4 w-4 text-text-muted" />
                          <span>{formattedDate}</span>
                        </td>
                        <td className="p-4 font-semibold text-text-primary">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-danger font-medium">
                          -${tx.platformFee.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold text-success">
                          ${tx.netPayout.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize font-sans ${statusColors[tx.status]}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seller Payout Method Setup Card */}
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-text-primary">Payout Account Settings</h3>
              <p className="text-xs text-text-muted mt-0.5">Configure your UPI ID or Bank Account for automated earnings payouts upon order delivery.</p>
            </div>
            <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
              Active Escrow Payouts
            </span>
          </div>

          <form onSubmit={handleSavePayout} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">UPI VPA Handle (Recommended)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mobile@upi or name@okicici"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="As per bank passbook"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Bank Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter 9–18 digit account number"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Bank IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2 pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Payout Settings'}
              </button>
              {saveSuccess && (
                <span className="text-xs font-bold text-success font-sans">✓ Payout settings saved!</span>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
