'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ReturnRequest } from '@bookmarket/types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export interface OrderReturnResolverProps {
  orderId: string;
  returnRequest: ReturnRequest;
  onResolved: () => void;
}

export function OrderReturnResolver({
  orderId,
  returnRequest,
  onResolved,
}: OrderReturnResolverProps) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');
  const [resolveAction, setResolveAction] = useState<'approve' | 'reject' | null>(null);

  const resolveMutation = useMutation({
    mutationFn: ({ action, note }: { action: 'approve' | 'reject'; note?: string }) =>
      apiClient(`/admin/orders/${orderId}/return/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action, adminNote: note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      onResolved();
    },
  });

  const handleResolve = () => {
    if (!resolveAction) return;
    resolveMutation.mutate({ action: resolveAction, note: adminNote });
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/8 p-5 space-y-4 font-sans">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <h3 className="font-bold text-sm text-foreground">Buyer 7-Day Return Dispute</h3>
        <span
          className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            returnRequest.status === 'pending'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : returnRequest.status === 'approved'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          {returnRequest.status}
        </span>
      </div>

      <div className="p-4 bg-card rounded-2xl border border-border/80 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          Student&apos;s Return Reason:
        </p>
        <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">
          &quot;{returnRequest.reason}&quot;
        </p>
      </div>

      {returnRequest.status === 'pending' && (
        <div className="space-y-3 pt-2 border-t border-amber-500/20">
          <label className="block text-xs font-bold text-foreground">
            Resolution Guidance / Seller Note:
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Optional notes or instructions for the student..."
            rows={2}
            className="w-full text-xs p-3 rounded-2xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary/40 outline-none resize-none"
          />

          <div className="flex gap-2.5">
            <button
              onClick={() => setResolveAction('approve')}
              disabled={resolveMutation.isPending}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                resolveAction === 'approve'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Return &amp; Refund</span>
            </button>
            <button
              onClick={() => setResolveAction('reject')}
              disabled={resolveMutation.isPending}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                resolveAction === 'reject'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                  : 'border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <XCircle className="h-4 w-4" />
              <span>Decline Return</span>
            </button>
          </div>

          {resolveAction && (
            <button
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
              className="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-secondary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resolveMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm &amp; Finalize Dispute</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderReturnResolver;
