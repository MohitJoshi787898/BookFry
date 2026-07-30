'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order, OrderStatus } from '@bookmarket/types';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    data: ordersRaw,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data?: Order[]; orders?: Order[] } | Order[]>({
    queryKey: ['seller-orders'],
    queryFn: () => apiClient('/orders/seller'),
  });

  const orders: Order[] = Array.isArray(ordersRaw)
    ? ordersRaw
    : ordersRaw?.data || ordersRaw?.orders || [];

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      note,
    }: {
      orderId: string;
      status: OrderStatus;
      note?: string;
    }) =>
      apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    onMutate: () => {
      setSuccessMsg(null);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setSuccessMsg(`Order updated to status: ${data.status}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    let note = '';
    if (status === 'shipped') note = 'Items shipped and tracking added.';
    if (status === 'delivered') note = 'Courier confirmed item delivered to destination.';
    if (status === 'cancelled') note = 'Order cancelled by seller.';

    statusMutation.mutate({ orderId, status, note });
  };

  const statusColors: Record<string, string> = {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Seller Dashboard</span>
        </Link>

        <h1 className="font-serif text-3xl font-bold text-text-primary mb-8 flex items-center space-x-3">
          <Package className="h-8 w-8 text-brand" />
          <span>Fulfillment Orders</span>
        </h1>

        {successMsg && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm font-semibold flex items-center space-x-2 mb-6 font-sans animate-scale">
            <CheckCircle2 className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-40 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load sales
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
            <Package className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">No orders found</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                You haven&apos;t received any customer purchases for your listed books yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 font-sans">
            {orders.map((order) => {
              const sellerItems = order.items.filter((item) => item.sellerId === user?.id);
              const sellerSubtotal = sellerItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              if (sellerItems.length === 0) return null;

              return (
                <div
                  key={order.id}
                  className="border border-border bg-surface rounded-md overflow-hidden p-6 space-y-6 shadow-sm"
                >
                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4 font-sans">
                    <div>
                      <p className="font-mono text-sm font-bold text-text-primary">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-6 text-sm font-sans">
                      <div className="space-y-0.5 font-sans">
                        <span className="text-xs text-text-muted font-sans font-medium">
                          Fulfillment Subtotal
                        </span>
                        <p className="font-bold text-brand font-sans">
                          ${sellerSubtotal.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-0.5 font-sans">
                        <span className="text-xs text-text-muted font-sans font-medium">
                          Payment status
                        </span>
                        <p className="font-semibold text-text-primary capitalize font-sans">
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize font-sans ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 font-sans">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
                      Your Items in this order
                    </h3>
                    <div className="divide-y divide-border border border-border rounded overflow-hidden bg-background-subtle">
                      {sellerItems.map((item, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-sm bg-surface font-sans">
                          <div className="font-sans">
                            <p className="font-semibold text-text-primary font-sans">{item.title}</p>
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

                  {/* Shipping/Billing addresses */}
                  <div className="text-sm font-sans flex flex-col md:flex-row gap-8 border-t border-border pt-4 justify-between items-start">
                    <div className="flex-grow font-sans">
                      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1 font-sans">
                        <Truck className="h-3.5 w-3.5" /> Ship To Address
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed pl-1 font-sans">
                        {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                        {order.shippingAddress.country}
                      </p>
                    </div>

                    {/* Fulfill actions */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <div className="shrink-0 flex items-center gap-3 font-sans">
                        <span className="text-xs text-text-secondary font-medium font-sans">
                          Update Status:
                        </span>
                        <div className="flex gap-2 font-sans">
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'shipped')}
                              disabled={updatingId === order.id}
                              className="px-3 py-1.5 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover flex items-center gap-1 disabled:opacity-50 font-sans"
                            >
                              {updatingId === order.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Truck className="h-3.5 w-3.5" />
                              )}
                              <span>Mark Shipped</span>
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              disabled={updatingId === order.id}
                              className="px-3 py-1.5 bg-success text-white text-xs font-bold rounded hover:bg-success/90 flex items-center gap-1 disabled:opacity-50 font-sans"
                            >
                              {updatingId === order.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              <span>Mark Delivered</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 border border-danger text-danger text-xs font-semibold rounded hover:bg-danger/5 disabled:opacity-50 font-sans"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
