'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { ReturnRequestModal } from '@/components/shared/return-request-modal';
import { apiClient } from '@/lib/api-client';
import { Order } from '@bookmarket/types';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Calendar,
  Truck,
  AlertCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  InfoIcon,
} from 'lucide-react';
import Link from 'next/link';

const RETURN_WINDOW_DAYS = 7;

function isWithinReturnWindow(order: Order): boolean {
  if (order.status !== 'delivered') return false;
  const deliveredEvent = [...order.timeline].reverse().find((e) => e.status === 'delivered');
  const deliveredAt = deliveredEvent ? new Date(deliveredEvent.timestamp) : new Date(order.updatedAt);
  const windowMs = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - deliveredAt.getTime() <= windowMs;
}

function daysLeftInReturnWindow(order: Order): number {
  const deliveredEvent = [...order.timeline].reverse().find((e) => e.status === 'delivered');
  const deliveredAt = deliveredEvent ? new Date(deliveredEvent.timestamp) : new Date(order.updatedAt);
  const elapsed = Date.now() - deliveredAt.getTime();
  const remaining = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000 - elapsed;
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-brand/10 text-brand border-brand/20',
  shipped: 'bg-accent/10 text-accent border-accent/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
  refunded: 'bg-danger/10 text-danger border-danger/20',
  return_requested: 'bg-warning/10 text-warning border-warning/20',
  return_approved: 'bg-success/10 text-success border-success/20',
  return_rejected: 'bg-danger/10 text-danger border-danger/20',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  return_requested: 'Return Requested',
  return_approved: 'Return Approved',
  return_rejected: 'Return Rejected',
};

export default function CustomerOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [policyExpanded, setPolicyExpanded] = useState(false);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['buyer-orders'],
    queryFn: () => apiClient('/orders'),
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-brand" />
          My Orders
        </h1>
        <p className="text-sm text-text-secondary mb-6 font-sans">
          Track your purchases, view details, and manage returns.
        </p>

        {/* Return Policy Banner */}
        <div className="mb-6 rounded-xl border border-brand/20 bg-brand/5 overflow-hidden">
          <button
            onClick={() => setPolicyExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand/10 transition-colors"
            aria-expanded={policyExpanded}
            aria-controls="return-policy-content"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="text-sm font-bold text-brand">
                BookFry {RETURN_WINDOW_DAYS}-Day Return Policy
              </span>
              <span className="hidden sm:inline text-xs text-text-secondary">
                — क्योंकि.. पढ़ाई रुकनी नहीं चाहिए
              </span>
            </div>
            {policyExpanded ? (
              <ChevronUp className="h-4 w-4 text-brand flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-brand flex-shrink-0" />
            )}
          </button>

          {policyExpanded && (
            <div
              id="return-policy-content"
              className="px-4 pb-4 pt-1 border-t border-brand/10 font-sans"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-secondary">
                {[
                  {
                    icon: <Clock className="h-4 w-4 text-brand" />,
                    title: '7-Day Return Window',
                    desc: 'Return requests must be raised within 7 days of delivery.',
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
                    title: 'Same Condition',
                    desc: 'Book must be returned in the same condition as received.',
                  },
                  {
                    icon: <RotateCcw className="h-4 w-4 text-accent" />,
                    title: 'Refund Timeline',
                    desc: 'Refunds are credited within 5–7 business days after approval.',
                  },
                  {
                    icon: <XCircle className="h-4 w-4 text-danger" />,
                    title: 'Not Eligible',
                    desc: 'Heavily annotated, damaged, or incomplete books cannot be returned.',
                  },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border/60">
                    <div className="mt-0.5 flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 border border-border bg-surface rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-xl">
            <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load order history
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-xl space-y-6">
            <ShoppingBag className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                No orders placed yet
              </h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You haven&apos;t placed any orders. Browse our curated book catalog to start
                purchasing!
              </p>
            </div>
            <Link
              href="/books"
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover font-sans text-sm"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const withinWindow = isWithinReturnWindow(order);
              const daysLeft = order.status === 'delivered' ? daysLeftInReturnWindow(order) : 0;
              const hasReturnRequest = !!order.returnRequest;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="border border-border bg-surface rounded-xl overflow-hidden hover:shadow-sm transition-all duration-120"
                >
                  {/* Order Summary Row */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-background-subtle transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                        Order Number
                      </p>
                      <p className="font-mono text-sm font-bold text-text-primary">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm font-sans">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Date
                        </span>
                        <p className="font-semibold text-text-primary text-xs">{formattedDate}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-text-muted">Total</span>
                        <p className="font-bold text-text-primary font-mono text-sm">
                          ₹{order.total.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[order.status] ?? 'bg-surface text-text-secondary border-border'}`}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-border bg-background-subtle p-5 space-y-6">
                      {/* Items */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
                          Items in Order
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm p-3 bg-surface border border-border rounded-lg"
                            >
                              <div>
                                <p className="font-semibold text-text-primary">{item.title}</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  Qty: {item.quantity} &bull;{' '}
                                  <span className="capitalize">
                                    {item.condition.replace('_', ' ')}
                                  </span>
                                </p>
                              </div>
                              <span className="font-bold text-text-primary font-mono">
                                ₹{(item.price * item.quantity).toFixed(0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Order Timeline
                        </h4>
                        <div className="relative pl-5 border-l border-border space-y-5 ml-1 pt-1">
                          {order.timeline.map((event, idx) => {
                            const eventDate = new Date(event.timestamp).toLocaleDateString(
                              'en-IN',
                              { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                            );
                            return (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-background-subtle" />
                                <p className="text-xs font-semibold capitalize text-text-primary">
                                  {event.status.replace(/_/g, ' ')}
                                </p>
                                {event.note && (
                                  <p className="text-[11px] text-text-secondary mt-0.5">
                                    {event.note}
                                  </p>
                                )}
                                <span className="text-[10px] text-text-muted block mt-0.5">
                                  {eventDate}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="border-t border-border pt-4">
                        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" /> Delivery Address
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed pl-1">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                          {order.shippingAddress.country}
                        </p>
                      </div>

                      {/* Return Section */}
                      <div className="border-t border-border pt-4 space-y-3">
                        <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" /> Returns
                        </h4>

                        {/* Existing return request status */}
                        {hasReturnRequest && order.returnRequest && (
                          <div
                            className={`p-3 rounded-lg border text-xs ${
                              order.returnRequest.status === 'pending'
                                ? 'bg-warning/5 border-warning/20'
                                : order.returnRequest.status === 'approved'
                                ? 'bg-success/5 border-success/20'
                                : 'bg-danger/5 border-danger/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="font-bold text-text-primary">Return Request</p>
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
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
                            <p className="text-text-secondary">{order.returnRequest.reason}</p>
                            {order.returnRequest.adminNote && (
                              <div className="mt-2 pt-2 border-t border-border/60">
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">
                                  BookFry Note
                                </p>
                                <p className="text-text-secondary">{order.returnRequest.adminNote}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Return action / policy info */}
                        {!hasReturnRequest && order.status === 'delivered' && (
                          <>
                            {withinWindow ? (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border/60">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                  <InfoIcon className="h-3.5 w-3.5 text-brand flex-shrink-0" />
                                  <span>
                                    Return window closes in{' '}
                                    <strong className="text-text-primary">
                                      {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                    </strong>
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReturnModalOrder(order);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-warning/40 text-warning rounded-lg hover:bg-warning/10 transition-colors"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Request Return
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-background-subtle border border-border/60 text-xs text-text-muted">
                                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                The {RETURN_WINDOW_DAYS}-day return window for this order has
                                expired.
                              </div>
                            )}
                          </>
                        )}

                        {!hasReturnRequest &&
                          order.status !== 'delivered' &&
                          !['cancelled', 'refunded', 'return_approved', 'return_rejected'].includes(
                            order.status
                          ) && (
                            <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                              <InfoIcon className="h-3.5 w-3.5" />
                              Returns can only be requested after delivery.
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Return Request Modal */}
      {returnModalOrder && (
        <ReturnRequestModal
          orderId={returnModalOrder.id}
          orderNumber={returnModalOrder.orderNumber}
          returnWindowDays={RETURN_WINDOW_DAYS}
          onClose={() => setReturnModalOrder(null)}
        />
      )}
    </div>
  );
}
