'use client';

import React, { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { OrderTimelineStepper } from '@/components/shared/order-timeline-stepper';
import { ReturnRequestModal } from '@/components/shared/return-request-modal';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { apiClient } from '@/lib/api-client';
import { Order } from '@bookmarket/types';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  Download,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['buyer-order-detail', id],
    queryFn: () => apiClient(`/orders/${id}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 rounded-3xl bg-card border border-border/80" />
        <div className="h-64 rounded-3xl bg-card border border-border/80" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <RoleEmptyState
        title="Order Not Found"
        description="Failed to load details for this order."
        mascotVariant="pointing"
        action={{ label: 'Back to Orders', onClick: () => window.location.assign('/account/orders') }}
      />
    );
  }

  const isDelivered = order.status === 'delivered';
  const canReturn = isDelivered && !order.returnRequest;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Orders</span>
      </Link>

        {/* Hero Header */}
        <RoleHero
          title={`Order #${order.orderNumber}`}
          subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}`}
          badgeText="Verified Shipment"
          showMascot={true}
          mascotPose="reading"
          stats={[
            { label: 'Order Total', value: `₹${order.total.toFixed(0)}`, badge: order.paymentStatus.toUpperCase(), isPositive: true },
            { label: 'Items', value: `${order.items.reduce((s, it) => s + it.quantity, 0)} Books`, badge: 'Package', isPositive: true },
            { label: 'Fulfillment', value: order.status.replace('_', ' ').toUpperCase(), badge: 'Status', isPositive: true },
            { label: 'Protection', value: '7-Day Return', badge: 'Escrow', isPositive: true },
          ]}
          actions={
            <Link
              href={`/invoice/${order.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Invoice</span>
            </Link>
          }
        />

        {/* Step-by-Step Delivery Stepper */}
        <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-secondary" />
            <span>Delivery Tracking Lifecycle</span>
          </h3>

          <OrderTimelineStepper
            currentStatus={order.status}
            timeline={order.timeline || []}
          />
        </div>

        {/* Purchased Books List */}
        <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-secondary" />
            <span>Package Contents</span>
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/80 gap-4"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold">Qty: {item.quantity}</span>
                    <span>&bull;</span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                      {item.condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-sm sm:text-base text-foreground">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Shipping Address & Payment Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-2 text-xs">
            <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
              <MapPin className="h-4 w-4 text-secondary" />
              <span>Campus Delivery Destination</span>
            </h4>
            <p className="font-bold text-foreground">{order.shippingAddress.street}</p>
            <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p className="text-muted-foreground">{order.shippingAddress.country}</p>
          </div>

          <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-2 text-xs">
            <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
              <CreditCard className="h-4 w-4 text-secondary" />
              <span>Payment Breakdown</span>
            </h4>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono font-bold text-foreground">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-mono font-bold text-foreground">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-bold text-sm">
              <span>Total Paid</span>
              <span className="font-mono text-secondary">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Return Guarantee CTA */}
        {canReturn && (
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Need to return this book?</p>
              <p className="text-[11px] text-muted-foreground">Covered under the 7-day student return policy.</p>
            </div>
            <button
              onClick={() => setReturnModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Request Return</span>
            </button>
          </div>
        )}

      {/* Return Request Modal */}
      {returnModalOpen && (
        <ReturnRequestModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          returnWindowDays={7}
          onClose={() => setReturnModalOpen(false)}
        />
      )}
    </div>
  );
}
