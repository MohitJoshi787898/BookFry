'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { UsedBookRequest } from '@bookmarket/types';
import { MessageSquare, XCircle, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-info/10 text-info border-info/20',
  seller_notified: 'bg-info/10 text-info border-info/20',
  seller_contacted_buyer: 'bg-brand/10 text-brand border-brand/20',
  accepted: 'bg-success/10 text-success border-success/20',
  in_discussion: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  declined: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
  expired: 'bg-muted text-text-muted border-border',
};

export default function BuyerUsedRequestsPage() {
  const { data: requests = [], isLoading, isError } = useQuery<UsedBookRequest[]>({
    queryKey: ['buyer-used-requests'],
    queryFn: async () => {
      const res = await apiClient<{ success: boolean; data: UsedBookRequest[] }>('/used-book-requests/buyer');
      return res.data || [];
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/account/orders"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Account Orders</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-brand" />
              <span>Used Book Purchase Requests</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Track requests submitted to sellers for used / second-hand books. Sellers contact you directly.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 border border-border bg-card rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center border border-border bg-card rounded-2xl space-y-3">
            <XCircle className="h-10 w-10 text-danger mx-auto" />
            <p className="text-sm font-bold text-text-primary">Failed to load purchase requests.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center border border-border bg-card rounded-3xl space-y-4">
            <MessageSquare className="h-12 w-12 text-text-muted mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">No Used Book Requests</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              When you express interest in used books on BookFry, your direct contact requests will appear here.
            </p>
            <Link
              href="/books?conditionType=used"
              className="inline-flex items-center px-6 py-2.5 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-hover transition-all"
            >
              Browse Used Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-6 border border-border bg-card rounded-3xl space-y-4 shadow-sm hover:border-brand/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider bg-brand/10 px-2.5 py-1 rounded-full border border-brand/20">
                      Request #{req.requestNumber}
                    </span>
                    <p className="text-xs text-text-muted mt-1.5 font-medium">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full border ${
                      STATUS_COLORS[req.status] || 'bg-muted text-text-secondary border-border'
                    }`}
                  >
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-text-primary">{req.title}</h3>
                    <p className="text-sm font-extrabold text-brand font-mono">₹{req.price.toFixed(2)}</p>
                    <p className="text-xs text-text-muted capitalize">Condition: {req.condition.replace(/_/g, ' ')}</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-2xl border border-border space-y-1.5 text-xs">
                    <span className="font-bold text-text-primary flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-brand" /> Seller: {req.sellerName || 'Verified Seller'}
                    </span>
                    {req.sellerCity && (
                      <p className="text-text-secondary">Location: {req.sellerCity}, {req.sellerState}</p>
                    )}
                    <p className="text-text-muted text-[11px]">
                      The seller receives your contact info and will reach out via WhatsApp/email.
                    </p>
                  </div>
                </div>

                {req.timeline && req.timeline.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Latest Activity
                    </span>
                    <p className="text-xs text-text-secondary italic">
                      &quot;{req.timeline[req.timeline.length - 1].note || req.status}&quot; —{' '}
                      {new Date(req.timeline[req.timeline.length - 1].timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
