'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { apiClient } from '@/lib/api-client';
import { UsedBookRequest, UsedBookRequestStatus } from '@bookmarket/types';
import {
  MessageSquare, Phone, Mail, CheckCircle2, XCircle, ArrowLeft, MessageCircle
} from 'lucide-react';
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

export default function SellerUsedRequestsPage() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: requests = [], isLoading, isError, refetch } = useQuery<UsedBookRequest[]>({
    queryKey: ['seller-used-requests'],
    queryFn: async () => {
      const res = await apiClient<{ success: boolean; data: UsedBookRequest[] }>('/used-book-requests/seller');
      return res.data || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: UsedBookRequestStatus; note?: string }) =>
      apiClient(`/used-book-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-used-requests'] });
      setSuccessMsg(`Status updated to: ${data.data?.status || 'updated'}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/used-book-requests/${id}/accept`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-used-requests'] });
      setSuccessMsg('Request accepted! Buyer contact unlocked.');
      setTimeout(() => setSuccessMsg(null), 3500);
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient(`/used-book-requests/${id}/decline`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-used-requests'] });
      setSuccessMsg('Request declined.');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleAccept = (id: string) => {
    setUpdatingId(id);
    acceptMutation.mutate(id);
  };

  const handleDecline = (id: string) => {
    setUpdatingId(id);
    declineMutation.mutate({ id, reason: 'Book no longer available or price mismatch.' });
  };

  const handleUpdateStatus = (id: string, status: UsedBookRequestStatus, note?: string) => {
    setUpdatingId(id);
    statusMutation.mutate({ id, status, note });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Seller Dashboard</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-brand" />
              <span>Used Book Buyer Requests</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Buyers interested in your used books. Accept requests to unlock direct WhatsApp & contact coordinates.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-semibold flex items-center space-x-2 mb-6">
            <CheckCircle2 className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 border border-border bg-card rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center border border-border bg-card rounded-2xl space-y-3">
            <XCircle className="h-10 w-10 text-danger mx-auto" />
            <p className="text-sm font-bold text-text-primary">Failed to load buyer requests.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-brand text-white font-bold text-xs rounded-xl">
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center border border-border bg-card rounded-3xl space-y-4">
            <MessageSquare className="h-12 w-12 text-text-muted mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">No Buyer Requests Yet</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Requests submitted by buyers interested in your used book listings will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isLocked = req.buyerContact?.isContactUnlocked === false && req.status === 'requested';
              const whatsappNumber = req.buyerContact?.whatsappPhone || req.buyerContact?.phone;
              const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : null;

              return (
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
                        Received on {new Date(req.createdAt).toLocaleDateString()}
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
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-text-primary">{req.title}</h3>
                      <p className="text-sm font-extrabold text-brand font-mono">Total Asking: ₹{(req.totalAskingPrice || req.price).toFixed(2)}</p>
                      
                      {/* Multi-item breakdown if present */}
                      {req.items && req.items.length > 0 ? (
                        <div className="mt-2 space-y-1.5 bg-muted/40 p-2.5 rounded-xl border border-border/70">
                          <p className="text-[11px] font-bold text-text-secondary uppercase">Books in Request ({req.items.length})</p>
                          {req.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-text-primary">
                              <span className="truncate max-w-[200px]">{it.title}</span>
                              <span className="font-mono font-bold">₹{it.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted capitalize">Condition: {req.condition.replace(/_/g, ' ')}</p>
                      )}
                    </div>

                    {/* Buyer Contact Details Panel (Privacy-Aware) */}
                    <div className="p-4 bg-muted/60 rounded-2xl border border-border space-y-2.5 text-xs">
                      <span className="font-bold text-text-primary uppercase tracking-wider text-[10px] block border-b border-border pb-1">
                        Buyer Details & Privacy
                      </span>
                      
                      {isLocked ? (
                        <div className="space-y-3 py-2">
                          <p className="font-bold text-text-primary text-sm">{req.buyerContact?.name || 'Verified Buyer'}</p>
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                            🔒 <strong>Contact Locked:</strong> Buyer&apos;s phone & WhatsApp are protected. Click <strong>&quot;Accept Request&quot;</strong> below to reveal contact coordinates.
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(req.id)}
                              disabled={updatingId === req.id}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs"
                            >
                              Accept Request (Unlock Contact)
                            </button>
                            <button
                              onClick={() => handleDecline(req.id)}
                              disabled={updatingId === req.id}
                              className="px-3 py-2 border border-danger text-danger font-bold rounded-xl hover:bg-danger/10 text-xs"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-text-primary text-sm">{req.buyerContact?.name}</p>
                          <p className="text-text-secondary flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-brand" /> {req.buyerContact?.email}
                          </p>
                          {req.buyerContact?.phone && (
                            <p className="text-text-secondary flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-brand" /> {req.buyerContact?.phone}
                            </p>
                          )}
                          {req.buyerContact?.note && (
                            <p className="text-text-muted italic bg-background p-2 rounded-xl border border-border/80">
                              &quot;{req.buyerContact.note}&quot;
                            </p>
                          )}

                          {/* WhatsApp / Email Quick Action */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            {cleanWhatsapp && (
                              <a
                                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                                  `Hi ${req.buyerContact?.name}, I accepted your BookFry used book request for "${req.title}". Let's arrange handover!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleUpdateStatus(req.id, 'seller_contacted_buyer', 'Seller initiated WhatsApp conversation')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Buyer
                              </a>
                            )}
                            <a
                              href={`mailto:${req.buyerContact?.email}?subject=${encodeURIComponent(
                                `BookFry Request #${req.requestNumber} - ${req.title}`
                              )}`}
                              onClick={() => handleUpdateStatus(req.id, 'seller_contacted_buyer', 'Seller sent email to buyer')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                            >
                              <Mail className="h-3.5 w-3.5" /> Email Buyer
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Seller Status Actions */}
                  {!isLocked && (
                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-text-secondary">Update Request Status:</span>
                      <div className="flex flex-wrap gap-2">
                        {req.status !== 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted', 'Seller accepted request.')}
                            disabled={updatingId === req.id}
                            className="px-3 py-1.5 bg-success text-white font-bold rounded-xl hover:bg-success/90 disabled:opacity-50"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'in_discussion', 'In discussion regarding handover.')}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 bg-warning text-white font-bold rounded-xl hover:bg-warning/90 disabled:opacity-50"
                        >
                          In Discussion
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'completed', 'Transaction completed.')}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 border border-danger text-danger font-bold rounded-xl hover:bg-danger/10 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
