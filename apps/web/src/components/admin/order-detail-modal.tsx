'use client';

import React from 'react';
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
  Store,
} from 'lucide-react';
import {
  AdminModal,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from './admin-modal';
import { OrderReturnResolver } from './order-return-resolver';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  pending: { label: 'Pending Payment', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: <RefreshCw className="h-3 w-3 animate-spin" />, variant: 'warning' },
  confirmed: { label: 'Confirmed', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'info' },
  shipped: { label: 'In Transit / Shipped', className: 'bg-secondary/15 text-secondary border-secondary/30', icon: <Truck className="h-3 w-3" />, variant: 'default' },
  delivered: { label: 'Delivered to Campus', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'success' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: <XCircle className="h-3 w-3" />, variant: 'danger' },
  refunded: { label: 'Refunded to Source', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: <RotateCcw className="h-3 w-3" />, variant: 'danger' },
  return_requested: { label: 'Return Requested', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: <RotateCcw className="h-3 w-3" />, variant: 'warning' },
  return_approved: { label: 'Return Approved', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'success' },
  return_rejected: { label: 'Return Declined', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: <XCircle className="h-3 w-3" />, variant: 'danger' },
};

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const statusCfg = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    className: 'bg-muted text-muted-foreground border-border',
    icon: null,
    variant: 'default',
  };

  return (
    <AdminModal
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
        <div className="flex items-center justify-between w-full font-sans">
          <p className="text-xs text-muted-foreground font-mono">
            Payment Ref: <span className="font-bold text-foreground">{order.paymentRef || 'N/A'}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
          >
            Close Order
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStatBadge label="Gross Value" value={`₹${order.total.toFixed(2)}`} variant="default" />
          <AdminStatBadge label="Escrow Payment" value={order.paymentStatus.toUpperCase()} variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} />
          <AdminStatBadge label="Items Volume" value={`${order.items.reduce((acc, it) => acc + it.quantity, 0)} Items`} variant="info" />
          <AdminStatBadge label="Fulfillment Stage" value={statusCfg.label.toUpperCase()} variant={statusCfg.variant} />
        </div>

        {/* Ordered Line Items */}
        <AdminDetailSection title="Purchased Books &amp; Sub-Order Breakdown" icon={<Package className="h-4 w-4" />}>
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80 shadow-xs gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Qty: {item.quantity}</span>
                    <span>&bull;</span>
                    <span className="capitalize px-2 py-0.5 rounded-lg bg-secondary/10 text-secondary font-bold text-[10px]">
                      {item.condition.replace('_', ' ')}
                    </span>
                    {item.sellerId && (
                      <>
                        <span>&bull;</span>
                        <span className="text-muted-foreground font-semibold flex items-center gap-1">
                          <Store className="h-3 w-3 text-secondary" /> Seller: {item.sellerId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-base text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <p className="text-[11px] text-muted-foreground">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </AdminDetailSection>

        {/* 2-Column Split: Payment Telemetry & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminDetailSection
            title="Financial &amp; Escrow Telemetry"
            icon={<CreditCard className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border/80"
          >
            <div className="space-y-2">
              <AdminDetailRow label="Items Subtotal" value={`₹${order.subtotal.toFixed(2)}`} />
              <AdminDetailRow label="Campus Delivery Fee" value={order.shippingFee === 0 ? 'Free Shipping' : `₹${order.shippingFee.toFixed(2)}`} />
              <AdminDetailRow label="Net Order Value" value={`₹${order.total.toFixed(2)}`} />
              <AdminDetailRow label="Payment Gateway" value={order.paymentStatus.toUpperCase()} />
              {order.paymentRef && <AdminDetailRow label="Transaction Hash" value={order.paymentRef} copyable />}
            </div>
          </AdminDetailSection>

          <AdminDetailSection
            title="Customer &amp; Shipping Address"
            icon={<MapPin className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border/80"
          >
            <div className="space-y-2">
              <AdminDetailRow label="Buyer User Account" value={order.buyerId} copyable />
              <AdminDetailRow label="Street / Hostel" value={order.shippingAddress.street} />
              <AdminDetailRow label="City &amp; Postal Area" value={`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`} />
              <AdminDetailRow label="Country Region" value={order.shippingAddress.country} />
            </div>
          </AdminDetailSection>
        </div>

        {/* Operational Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <AdminDetailSection title="Order Fulfillment Stepper" icon={<Clock className="h-4 w-4" />}>
            <div className="relative pl-5 border-l-2 border-secondary/30 space-y-4 ml-2 pt-1">
              {[...order.timeline].reverse().map((event, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-card shadow-xs" />
                  <p className="text-xs font-bold text-foreground capitalize">{event.status.replace(/_/g, ' ')}</p>
                  {event.note && <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>}
                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-medium">
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
          <OrderReturnResolver
            orderId={order.id}
            returnRequest={order.returnRequest}
            onResolved={onClose}
          />
        )}
      </div>
    </AdminModal>
  );
}

export default OrderDetailModal;
