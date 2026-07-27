'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Order } from '@bookmarket/types';
import {
  X,
  Package,
  User,
  MapPin,
  Clock,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/30',
    icon: <RefreshCw className="h-3 w-3 animate-spin" />,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-brand/10 text-brand border-brand/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-accent/10 text-accent border-accent/30',
    icon: <Truck className="h-3 w-3" />,
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success/10 text-success border-success/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <XCircle className="h-3 w-3" />,
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <RotateCcw className="h-3 w-3" />,
  },
  return_requested: {
    label: 'Return Requested',
    className: 'bg-warning/10 text-warning border-warning/30',
    icon: <RotateCcw className="h-3 w-3" />,
  },
  return_approved: {
    label: 'Return Approved',
    className: 'bg-success/10 text-success border-success/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  return_rejected: {
    label: 'Return Rejected',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');
  const [resolveAction, setResolveAction] = useState<'approve' | 'reject' | null>(null);

  const statusCfg = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    className: 'bg-surface text-text-secondary border-border',
    icon: null,
  };

  const resolveMutation = useMutation({
    mutationFn: ({ action, note }: { action: 'approve' | 'reject'; note?: string }) =>
      apiClient(`/admin/orders/${order.id}/return/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action, adminNote: note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      onClose();
    },
  });

  const handleResolve = () => {
    if (!resolveAction) return;
    resolveMutation.mutate({ action: resolveAction, note: adminNote });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-brand" />
            <div>
              <h2
                id="order-detail-title"
                className="font-serif font-bold text-text-primary text-lg leading-none"
              >
                Order Details
              </h2>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusCfg.className}`}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-border/50 transition-colors text-text-muted hover:text-text-primary"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Items */}
          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Items Ordered
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-background-subtle border border-border/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Qty: {item.quantity} &bull; Condition:{' '}
                      <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <span className="font-bold font-mono text-sm text-text-primary">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Financials */}
          <section className="grid grid-cols-3 gap-3">
            {[
              { label: 'Subtotal', value: `₹${order.subtotal.toFixed(0)}` },
              { label: 'Shipping', value: order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee.toFixed(0)}` },
              { label: 'Total', value: `₹${order.total.toFixed(0)}`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className={`rounded-lg p-3 border text-center ${highlight ? 'bg-brand/5 border-brand/20' : 'bg-background-subtle border-border/60'}`}
              >
                <p className="text-[10px] text-text-muted font-bold uppercase">{label}</p>
                <p className={`font-bold font-mono text-sm mt-0.5 ${highlight ? 'text-brand' : 'text-text-primary'}`}>
                  {value}
                </p>
              </div>
            ))}
          </section>

          {/* Payment + Buyer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="p-4 rounded-lg bg-background-subtle border border-border/60">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Payment
              </h3>
              <p className="text-xs font-semibold text-text-primary capitalize">
                {order.paymentStatus}
              </p>
              {order.paymentRef && (
                <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">
                  Ref: {order.paymentRef}
                </p>
              )}
            </section>

            <section className="p-4 rounded-lg bg-background-subtle border border-border/60">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Buyer
              </h3>
              <p className="text-[11px] text-text-muted font-mono truncate">
                ID: {order.buyerId}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </section>
          </div>

          {/* Shipping Address */}
          <section className="p-4 rounded-lg bg-background-subtle border border-border/60">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Delivery Address
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
              {order.shippingAddress.country}
            </p>
          </section>

          {/* Order Timeline */}
          {order.timeline.length > 0 && (
            <section>
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Timeline
              </h3>
              <div className="relative pl-5 border-l border-border/60 space-y-4 ml-1">
                {[...order.timeline].reverse().map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand border-2 border-surface ring-1 ring-brand/40" />
                    <p className="text-xs font-semibold text-text-primary capitalize">
                      {event.status.replace(/_/g, ' ')}
                    </p>
                    {event.note && (
                      <p className="text-[11px] text-text-secondary mt-0.5">{event.note}</p>
                    )}
                    <span className="text-[10px] text-text-muted block mt-0.5">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Return Request Section */}
          {order.returnRequest && (
            <section className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                <h3 className="font-bold text-sm text-text-primary">Return Request</h3>
                <span
                  className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    order.returnRequest.status === 'pending'
                      ? 'bg-warning/10 text-warning border-warning/30'
                      : order.returnRequest.status === 'approved'
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-danger/10 text-danger border-danger/30'
                  }`}
                >
                  {order.returnRequest.status}
                </span>
              </div>

              <div className="p-3 bg-surface rounded-lg border border-border/60">
                <p className="text-[10px] font-bold uppercase text-text-muted mb-1">
                  Buyer&apos;s Reason
                </p>
                <p className="text-sm text-text-primary">{order.returnRequest.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted">
                <span>
                  Requested:{' '}
                  <span className="font-semibold text-text-secondary">
                    {new Date(order.returnRequest.requestedAt).toLocaleDateString('en-IN')}
                  </span>
                </span>
                {order.returnRequest.resolvedAt && (
                  <span>
                    Resolved:{' '}
                    <span className="font-semibold text-text-secondary">
                      {new Date(order.returnRequest.resolvedAt).toLocaleDateString('en-IN')}
                    </span>
                  </span>
                )}
              </div>

              {order.returnRequest.adminNote && (
                <div className="p-3 bg-surface rounded-lg border border-border/60">
                  <p className="text-[10px] font-bold uppercase text-text-muted mb-1">
                    Admin Note
                  </p>
                  <p className="text-sm text-text-secondary">{order.returnRequest.adminNote}</p>
                </div>
              )}

              {/* Resolution controls — only when pending */}
              {order.returnRequest.status === 'pending' && (
                <div className="space-y-3 pt-1 border-t border-warning/20">
                  <p className="text-[11px] font-semibold text-text-secondary">
                    Resolve this return request:
                  </p>

                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add an admin note (optional)..."
                    rows={2}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background-subtle text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setResolveAction('approve')}
                      disabled={resolveMutation.isPending}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        resolveAction === 'approve'
                          ? 'bg-success text-white border-success'
                          : 'border-success/40 text-success hover:bg-success/10'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                      Approve Return
                    </button>
                    <button
                      onClick={() => setResolveAction('reject')}
                      disabled={resolveMutation.isPending}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        resolveAction === 'reject'
                          ? 'bg-danger text-white border-danger'
                          : 'border-danger/40 text-danger hover:bg-danger/10'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5 inline mr-1" />
                      Reject Return
                    </button>
                  </div>

                  {resolveAction && (
                    <button
                      onClick={handleResolve}
                      disabled={resolveMutation.isPending}
                      className="w-full py-2.5 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {resolveMutation.isPending ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      Confirm:{' '}
                      {resolveAction === 'approve' ? 'Approve Return' : 'Reject Return'}
                    </button>
                  )}

                  {resolveMutation.isError && (
                    <p className="text-[11px] text-danger font-semibold text-center">
                      Failed to resolve. Please try again.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
