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
    data: ledger = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Transaction[]>({
    queryKey: ['seller-earnings'],
    queryFn: () => apiClient('/seller/earnings'),
    enabled: isAuthenticated,
  });

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
      </main>

      <Footer />
    </div>
  );
}
