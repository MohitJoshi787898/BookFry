'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { AdminDialog } from '@/components/admin/admin-dialog';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order } from '@bookmarket/types';
import {
  Truck,
  RefreshCw,
  Eye,
  Clock,
} from 'lucide-react';

export default function SellerOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ status: 'shipped', note: '' });

  const {
    data: orders = [],
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['seller-orders', statusFilter],
    queryFn: async () => {
      try {
        const url = statusFilter ? `/seller/orders?status=${statusFilter}` : '/seller/orders';
        const res = await apiClient<unknown>(url);
        if (Array.isArray(res)) return res as Order[];
        const resData = res as Record<string, unknown>;
        if ('data' in resData && Array.isArray(resData.data)) return resData.data as Order[];
        return [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Record<string, unknown> }) =>
      apiClient(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setTrackingModalOpen(false);
      setSelectedOrder(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <RoleEmptyState
          title="Sign In to Manage Orders"
          description="View and fulfill customer orders placed for your listed books."
          mascotVariant="reading"
        />
      </SellerLayout>
    );
  }

  const rawOrders = orders || [];
  const filteredOrders = rawOrders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items?.some((it) => it.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filterChips = [
    { id: '', label: 'All Orders', count: rawOrders.length },
    { id: 'confirmed', label: 'Pending Dispatch', count: rawOrders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length },
    { id: 'shipped', label: 'In-Transit', count: rawOrders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: rawOrders.filter((o) => o.status === 'delivered').length },
  ];

  return (
    <SellerLayout>
      <RoleHero
        title="Customer Orders & Dispatch Pipeline"
        subtitle="Manage student book orders, dispatch textbooks with tracking IDs, and fulfill sales promptly."
        badgeText="Fulfillment & Dispatch Hub"
        stats={[
          { label: 'Total Orders', value: rawOrders.length, badge: 'All Time', isPositive: true },
          { label: 'To Dispatch', value: rawOrders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length, badge: 'Action', isPositive: false },
          { label: 'In-Transit', value: rawOrders.filter((o) => o.status === 'shipped').length, badge: 'Shipped', isPositive: true },
          { label: 'Delivered', value: rawOrders.filter((o) => o.status === 'delivered').length, badge: 'Settled', isPositive: true },
        ]}
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order number or book title..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Orders Fetch Error"
          description="Failed to load your customer orders."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredOrders.length === 0 ? (
        <RoleEmptyState
          title="No Orders Found"
          description={searchQuery ? 'Try clearing your search term.' : 'When students purchase your listed books, their orders will appear here for fulfillment.'}
          mascotVariant="searching"
        />
      ) : (
        <div className="space-y-3 font-sans">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-secondary text-xs">{ord.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : ord.status === 'shipped'
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                    {ord.items?.[0]?.title || 'Textbook Package'}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Order Value: <span className="font-mono font-extrabold text-foreground">₹{ord.total}</span> • Destination: <span className="font-semibold text-foreground">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 inline mr-1" />
                  <span>View Details</span>
                </button>

                {ord.status !== 'delivered' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(ord);
                      setTrackingForm({ status: 'shipped', note: '' });
                      setTrackingModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW ORDER DETAIL MODAL */}
      {selectedOrder && !trackingModalOpen && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* DISPATCH / TRACKING MODAL */}
      {selectedOrder && trackingModalOpen && (
        <AdminDialog
          isOpen={true}
          onClose={() => { setTrackingModalOpen(false); setSelectedOrder(null); }}
          size="md"
          title={`Dispatch Order #${selectedOrder.orderNumber}`}
          subtitle="Add courier tracking information for the buyer"
          icon={<Truck className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => { setTrackingModalOpen(false); setSelectedOrder(null); }} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl">Cancel</button>
              <button
                type="submit"
                form="dispatch-form"
                disabled={updateStatusMutation.isPending}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {updateStatusMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Mark as Dispatched</span>
              </button>
            </div>
          }
        >
          <form
            id="dispatch-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateStatusMutation.mutate({ orderId: selectedOrder.id, data: trackingForm });
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Courier &amp; AWB Tracking Number *</label>
              <textarea
                rows={3}
                required
                value={trackingForm.note}
                onChange={(e) => setTrackingForm({ ...trackingForm, note: e.target.value })}
                placeholder="e.g. Dispatched via India Post / DTDC with AWB tracking #..."
                className="w-full p-3 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </form>
        </AdminDialog>
      )}
    </SellerLayout>
  );
}
