'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
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
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    confirmed: 'bg-brand/10 text-brand border-brand/20',
    shipped: 'bg-accent/10 text-accent border-accent/20',
    delivered: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
    refunded: 'bg-danger/10 text-danger border-danger/20',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <ShoppingBag className="h-8 w-8 text-brand" />
          <span>My Orders</span>
        </h1>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load order history
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
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
              className="inline-block px-6 py-2.5 bg-brand text-white font-semibold rounded hover:bg-brand-hover font-sans text-sm"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-6 font-sans">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="border border-border bg-surface rounded-md overflow-hidden hover:shadow-sm transition-all duration-120"
                >
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-background-subtle transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider font-sans">
                        Order Number
                      </p>
                      <p className="font-mono text-sm font-bold text-text-primary">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm font-sans">
                      <div className="space-y-0.5">
                        <span className="text-xs text-text-muted flex items-center gap-1 font-sans">
                          <Calendar className="h-3.5 w-3.5" /> Date
                        </span>
                        <p className="font-semibold text-text-primary font-sans">{formattedDate}</p>
                      </div>
                      <div className="space-y-0.5 font-sans">
                        <span className="text-xs text-text-muted font-sans">Total</span>
                        <p className="font-bold text-text-primary font-sans">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 font-sans">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize font-sans ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-background-subtle p-6 space-y-6 font-sans">
                      <div className="space-y-3 font-sans">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
                          Items in Order
                        </h4>
                        <div className="space-y-2 font-sans">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm p-3 bg-surface border border-border rounded font-sans"
                            >
                              <div className="font-sans">
                                <p className="font-semibold text-text-primary font-sans">
                                  {item.title}
                                </p>
                                <p className="text-xs text-text-secondary mt-0.5 font-sans">
                                  Qty: {item.quantity} • {item.condition.replace('_', ' ')}
                                </p>
                              </div>
                              <span className="font-bold text-text-primary font-sans">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 font-sans">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1 font-sans">
                          <Clock className="h-3.5 w-3.5" /> Order Timeline
                        </h4>
                        <div className="relative pl-6 border-l border-border space-y-6 ml-2 pt-2 font-sans">
                          {order.timeline.map((event, idx) => {
                            const eventDate = new Date(event.timestamp).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            );

                            return (
                              <div key={idx} className="relative font-sans">
                                <span className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-background-subtle" />
                                <div className="text-sm font-sans">
                                  <p className="font-semibold capitalize text-text-primary font-sans">
                                    {event.status}
                                  </p>
                                  {event.note && (
                                    <p className="text-xs text-text-secondary mt-0.5 font-sans">
                                      {event.note}
                                    </p>
                                  )}
                                  <span className="text-[10px] text-text-muted block mt-1 font-sans">
                                    {eventDate}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 text-sm font-sans">
                        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1 font-sans">
                          <Truck className="h-3.5 w-3.5" /> Delivery Address
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed pl-1 font-sans">
                          {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                          {order.shippingAddress.country}
                        </p>
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
    </div>
  );
}
