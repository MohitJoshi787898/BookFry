'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Order } from '@bookmarket/types';
import {
  Package,
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
  Store,
} from 'lucide-react';
import {
  AdminDialog,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from './admin-dialog';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/30',
    icon: <RefreshCw className="h-3 w-3 animate-spin" />,
    variant: 'warning',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-primary/10 text-primary border-primary/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'info',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
    icon: <Truck className="h-3 w-3" />,
    variant: 'default',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success/10 text-success border-success/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'success',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <XCircle className="h-3 w-3" />,
    variant: 'danger',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <RotateCcw className="h-3 w-3" />,
    variant: 'danger',
  },
  return_requested: {
    label: 'Return Requested',
    className: 'bg-warning/10 text-warning border-warning/30',
    icon: <RotateCcw className="h-3 w-3" />,
    variant: 'warning',
  },
  return_approved: {
    label: 'Return Approved',
    className: 'bg-success/10 text-success border-success/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'success',
  },
  return_rejected: {
    label: 'Return Rejected',
    className: 'bg-danger/10 text-danger border-danger/30',
    icon: <XCircle className="h-3 w-3" />,
    variant: 'danger',
  },
};

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');
  const [resolveAction, setResolveAction] = useState<'approve' | 'reject' | null>(null);

  const statusCfg = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    className: 'bg-muted text-text-secondary border-border',
    icon: null,
    variant: 'default',
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
    <AdminDialog
      isOpen={true}
      onClose={onClose}
      size="2xl"
      title={`Order #${order.orderNumber}`}
      subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      icon={<Package className="h-5 w-5 text-secondary" />}
      badge={
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${statusCfg.className}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-text-muted font-mono">
            Payment Ref: <span className="font-bold text-text-primary">{order.paymentRef || 'N/A'}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
          >
            Close Order
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStatBadge
            label="Gross Total"
            value={`₹${order.total.toFixed(2)}`}
            variant="default"
          />
          <AdminStatBadge
            label="Payment Status"
            value={order.paymentStatus.toUpperCase()}
            variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
          />
          <AdminStatBadge
            label="Items Count"
            value={`${order.items.reduce((acc, it) => acc + it.quantity, 0)} Items`}
            variant="info"
          />
          <AdminStatBadge
            label="Fulfillment"
            value={statusCfg.label.toUpperCase()}
            variant={statusCfg.variant}
          />
        </div>

        {/* Ordered Line Items */}
        <AdminDetailSection
          title="Purchased Books & Sub-Order Breakdown"
          icon={<Package className="h-4 w-4" />}
        >
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-text-muted">
                    <span className="font-semibold">Qty: {item.quantity}</span>
                    <span>&bull;</span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-text-secondary font-medium">
                      {item.condition.replace('_', ' ')}
                    </span>
                    {item.sellerId && (
                      <>
                        <span>&bull;</span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <Store className="h-3 w-3" /> Seller: {item.sellerId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-sm sm:text-base text-text-primary">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <p className="text-[11px] text-text-muted">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </AdminDetailSection>

        {/* 2-Column Split: Payment Telemetry & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminDetailSection
            title="Financial & Payment Telemetry"
            icon={<CreditCard className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border"
          >
            <div className="space-y-2">
              <AdminDetailRow label="Subtotal" value={`₹${order.subtotal.toFixed(2)}`} />
              <AdminDetailRow
                label="Shipping Fee"
                value={order.shippingFee === 0 ? 'Free Delivery' : `₹${order.shippingFee.toFixed(2)}`}
              />
              <AdminDetailRow label="Total Order Value" value={`₹${order.total.toFixed(2)}`} />
              <AdminDetailRow label="Payment Gateway Status" value={order.paymentStatus.toUpperCase()} />
              {order.paymentRef && (
                <AdminDetailRow label="Razorpay / Provider Ref" value={order.paymentRef} copyable />
              )}
            </div>
          </AdminDetailSection>

          <AdminDetailSection
            title="Customer & Shipping Destination"
            icon={<MapPin className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border"
          >
            <div className="space-y-2">
              <AdminDetailRow label="Buyer User ID" value={order.buyerId} copyable />
              <AdminDetailRow
                label="Street Address"
                value={order.shippingAddress.street}
              />
              <AdminDetailRow
                label="City & State"
                value={`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`}
              />
              <AdminDetailRow label="Country" value={order.shippingAddress.country} />
            </div>
          </AdminDetailSection>
        </div>

        {/* Operational Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <AdminDetailSection
            title="Order Lifecycle Timeline"
            icon={<Clock className="h-4 w-4" />}
          >
            <div className="relative pl-5 border-l border-border/80 space-y-3.5 ml-2 pt-1">
              {[...order.timeline].reverse().map((event, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full bg-secondary border-2 border-background ring-2 ring-secondary/20" />
                  <p className="text-xs font-bold text-text-primary capitalize">
                    {event.status.replace(/_/g, ' ')}
                  </p>
                  {event.note && (
                    <p className="text-xs text-text-secondary mt-0.5">{event.note}</p>
                  )}
                  <span className="text-[11px] text-text-muted block mt-0.5 font-medium">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </AdminDetailSection>
        )}

        {/* Return Dispute Resolution Section */}
        {order.returnRequest && (
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <h3 className="font-bold text-sm text-text-primary">Buyer Return Dispute</h3>
              <span
                className={`ml-auto text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
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

            <div className="p-3.5 bg-card rounded-xl border border-border space-y-1">
              <p className="text-[11px] font-bold uppercase text-text-muted">
                Buyer&apos;s Return Explanation
              </p>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                &quot;{order.returnRequest.reason}&quot;
              </p>
            </div>

            {order.returnRequest.status === 'pending' && (
              <div className="space-y-3 pt-2 border-t border-warning/20">
                <label className="block text-xs font-bold text-text-primary">
                  Admin Resolution Note:
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional fulfillment note or reason for decision..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-secondary/40 outline-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setResolveAction('approve')}
                    disabled={resolveMutation.isPending}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      resolveAction === 'approve'
                        ? 'bg-success text-white border-success'
                        : 'border-success/40 text-success hover:bg-success/10'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                    Approve Return & Refund
                  </button>
                  <button
                    onClick={() => setResolveAction('reject')}
                    disabled={resolveMutation.isPending}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      resolveAction === 'reject'
                        ? 'bg-danger text-white border-danger'
                        : 'border-danger/40 text-danger hover:bg-danger/10'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5 inline mr-1" />
                    Decline Return
                  </button>
                </div>

                {resolveAction && (
                  <button
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {resolveMutation.isPending ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Confirm:{' '}
                    {resolveAction === 'approve' ? 'Approve Return' : 'Decline Return'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminDialog>
  );
}

export default OrderDetailModal;
