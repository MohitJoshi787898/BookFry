'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface ReturnRequestModalProps {
  orderId: string;
  orderNumber: string;
  returnWindowDays?: number;
  onClose: () => void;
}

export function ReturnRequestModal({
  orderId,
  orderNumber,
  returnWindowDays = 7,
  onClose,
}: ReturnRequestModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient(`/orders/${orderId}/return`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });

  const isSubmitting = mutation.isPending;
  const isSuccess = mutation.isSuccess;
  const canSubmit = reason.trim().length >= 10 && confirmed && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSuccess ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background-subtle">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-4.5 w-4.5 text-warning" />
            <h2
              id="return-modal-title"
              className="font-serif font-bold text-text-primary text-base"
            >
              Request a Return
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-border/50 transition-colors text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="h-14 w-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-text-primary">
                  Return Request Submitted
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Your return request for{' '}
                  <span className="font-mono font-bold text-brand">{orderNumber}</span> has been
                  received. Our team will review it within 1–2 business days.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-hover transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Return Policy Summary */}
              <div className="p-4 rounded-xl bg-brand/5 border border-brand/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand flex-shrink-0" />
                  <p className="text-xs font-bold text-brand uppercase tracking-wide">
                    BookFry Return Policy
                  </p>
                </div>
                <ul className="text-xs text-text-secondary space-y-1.5 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand mt-0.5">•</span>
                    Returns accepted within{' '}
                    <strong className="text-text-primary">{returnWindowDays} days</strong> of
                    delivery
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand mt-0.5">•</span>
                    Book must be in the same condition as received
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand mt-0.5">•</span>
                    Refund is processed within 5–7 business days after approval
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand mt-0.5">•</span>
                    Damaged or heavily annotated books are not eligible
                  </li>
                </ul>
              </div>

              {/* Order reference */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background-subtle border border-border/60">
                <span className="text-[10px] font-bold text-text-muted uppercase">Order</span>
                <span className="font-mono text-sm font-bold text-text-primary">{orderNumber}</span>
              </div>

              {/* Reason field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="return-reason"
                  className="text-xs font-bold text-text-primary block"
                >
                  Why are you returning this order?{' '}
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  id="return-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your reason for returning (e.g. wrong edition, damaged pages, received wrong book...)"
                  rows={4}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background-subtle text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:outline-none resize-none transition-colors"
                />
                <div className="flex justify-between items-center">
                  <p
                    className={`text-[10px] ${
                      reason.trim().length < 10 && reason.length > 0
                        ? 'text-danger'
                        : 'text-text-muted'
                    }`}
                  >
                    Minimum 10 characters
                  </p>
                  <p className="text-[10px] text-text-muted">{reason.trim().length} / 500</p>
                </div>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  id="return-confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-brand h-3.5 w-3.5 flex-shrink-0"
                />
                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                  I confirm that I have read the return policy and the book is in its original
                  received condition.
                </span>
              </label>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary">
                  Once submitted, you cannot edit this return request. Our team will contact you
                  via email with further instructions.
                </p>
              </div>

              {/* Error state */}
              {mutation.isError && (
                <p className="text-xs text-danger font-semibold text-center">
                  Failed to submit return request. Please try again.
                </p>
              )}

              {/* Submit */}
              <button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit}
                className="w-full py-3 rounded-xl text-sm font-bold bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReturnRequestModal;
