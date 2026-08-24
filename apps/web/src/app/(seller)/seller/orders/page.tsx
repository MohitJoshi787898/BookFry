'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
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
  const [dispatchModalData, setDispatchModalData] = useState<{
    orderId: string;
    subOrderId?: string;
    orderNumber: string;
  } | null>(null);
  const [carrier, setCarrier] = useState('India Post');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(3);

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
      subOrderId,
      status,
      note,
      carrier: carrierParam,
      trackingNumber: trackingParam,
      estimatedDays: daysParam,
    }: {
      orderId: string;
      subOrderId?: string;
      status: OrderStatus;
      note?: string;
      carrier?: string;
      trackingNumber?: string;
      estimatedDays?: number;
    }) => {
      if (subOrderId) {
        return apiClient(`/orders/${orderId}/sub-orders/${subOrderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            note,
            carrier: carrierParam,
            trackingNumber: trackingParam,
            estimatedDays: daysParam,
          }),
        });
      }
      return apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
    },
    onMutate: () => {
      setSuccessMsg(null);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setSuccessMsg(`Package updated to status: ${data.status}`);
      setDispatchModalData(null);
      setTrackingNumber('');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleStatusUpdate = (
    orderId: string,
    subOrderId: string | undefined,
    status: OrderStatus,
    customNote?: string
  ) => {
    setUpdatingId(orderId);
    let note = customNote || '';
    if (status === 'shipped') note = note || 'Items dispatched with courier tracking.';
    if (status === 'delivered') note = note || 'Courier confirmed item delivered to destination.';
    if (status === 'cancelled') note = note || 'Package cancelled by seller.';

    statusMutation.mutate({
      orderId,
      subOrderId,
      status,
      note,
      carrier: status === 'shipped' ? carrier : undefined,
      trackingNumber: status === 'shipped' ? trackingNumber : undefined,
      estimatedDays: status === 'shipped' ? estimatedDays : undefined,
    });
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
                        Your Items in this package
                      </h3>
                      {order.subOrders?.[0]?.shippingDetails?.carrier && (
                        <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                          🚚 {order.subOrders[0].shippingDetails.carrier} — Tracking: {order.subOrders[0].shippingDetails.trackingNumber || 'N/A'}
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background-subtle">
                      {sellerItems.map((item, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-sm bg-surface font-sans">
                          <div className="font-sans">
                            <p className="font-semibold text-text-primary font-sans">{item.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5 font-sans">
                              Qty: {item.quantity} • {item.condition.replace('_', ' ')}
                            </p>
                          </div>
                          <span className="font-bold text-text-primary font-sans font-mono">
                            ₹{(item.price * item.quantity).toFixed(2)}
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
                              onClick={() => {
                                const subId = order.subOrders?.[0]?.id;
                                setDispatchModalData({
                                  orderId: order.id,
                                  subOrderId: subId,
                                  orderNumber: order.subOrders?.[0]?.subOrderNumber || order.orderNumber,
                                });
                              }}
                              disabled={updatingId === order.id}
                              className="px-3.5 py-1.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover flex items-center gap-1.5 disabled:opacity-50 font-sans shadow-xs transition-all"
                            >
                              <Truck className="h-3.5 w-3.5" />
                              <span>Dispatch Package</span>
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, order.subOrders?.[0]?.id, 'delivered')}
                              disabled={updatingId === order.id}
                              className="px-3.5 py-1.5 bg-success text-white text-xs font-bold rounded-xl hover:bg-success/90 flex items-center gap-1.5 disabled:opacity-50 font-sans shadow-xs transition-all"
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
                            onClick={() => handleStatusUpdate(order.id, order.subOrders?.[0]?.id, 'cancelled')}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 border border-danger text-danger text-xs font-semibold rounded-xl hover:bg-danger/5 disabled:opacity-50 font-sans transition-all"
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

        {/* Dispatch Package Modal */}
        {dispatchModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-primary">Dispatch Package</h3>
                  <p className="text-xs font-mono text-brand font-bold mt-0.5">#{dispatchModalData.orderNumber}</p>
                </div>
                <button
                  onClick={() => setDispatchModalData(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-text-primary">Courier / Delivery Method</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary font-medium focus:ring-2 focus:ring-brand outline-none"
                  >
                    <option value="India Post">India Post (Speed Post / Regd. Parcel)</option>
                    <option value="Delhivery">Delhivery Express</option>
                    <option value="DTDC">DTDC Courier</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="Trackon">Trackon Courier</option>
                    <option value="Self / Hand Delivery">Self Pickup / Campus Handover</option>
                    <option value="Other Courier">Other Courier</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-text-primary">Tracking / Consignment Number</label>
                  <input
                    type="text"
                    placeholder="e.g. IN123456789 or AWB-998811"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary font-mono font-medium focus:ring-2 focus:ring-brand outline-none"
                  />
                  <p className="text-[11px] text-text-muted">The buyer will receive this tracking ID and courier alert via email.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-text-primary">Estimated Delivery Days</label>
                  <select
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-text-primary font-medium focus:ring-2 focus:ring-brand outline-none"
                  >
                    <option value={1}>1 Day (Next Day Delivery)</option>
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days (Standard Express)</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (Economy Postal)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDispatchModalData(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(
                      dispatchModalData.orderId,
                      dispatchModalData.subOrderId,
                      'shipped',
                      `Dispatched via ${carrier} (Tracking: ${trackingNumber || 'N/A'})`
                    );
                  }}
                  disabled={statusMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md disabled:opacity-60"
                >
                  {statusMutation.isPending ? 'Confirming...' : 'Confirm Dispatch'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
