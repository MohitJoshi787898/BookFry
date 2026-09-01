'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order } from '@bookmarket/types';
import { Eye, Clock } from 'lucide-react';

export default function VendorOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isError, refetch } = useQuery<Order[]>({
    queryKey: ['vendor-orders', statusFilter],
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

  if (!isAuthenticated) {
    return (
      <VendorLayout>
        <RoleEmptyState
          title="Sign In to Manage Vendor Orders"
          description="View and fulfill commercial high-volume student textbook orders."
          mascotVariant="reading"
        />
      </VendorLayout>
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
    { id: '', label: 'All Shipments', count: rawOrders.length },
    { id: 'confirmed', label: 'To Pack', count: rawOrders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length },
    { id: 'shipped', label: 'In-Transit', count: rawOrders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: rawOrders.filter((o) => o.status === 'delivered').length },
  ];

  return (
    <VendorLayout>
      <RoleHero
        title="Commercial Orders &amp; Logistics Dispatch"
        subtitle="Manage bulk campus book fulfillments, generate shipping manifests, and track DTDC &amp; India Post delivery AWBs."
        badgeText="Logistics &amp; Dispatch Engine"
        stats={[
          { label: 'Total Orders', value: rawOrders.length, badge: 'All Time', isPositive: true },
          { label: 'To Dispatch', value: rawOrders.filter((o) => o.status === 'confirmed' || o.status === 'pending').length, badge: 'Pack Today', isPositive: false },
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
          description="Failed to load merchant orders from the database."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredOrders.length === 0 ? (
        <RoleEmptyState
          title="No Orders Found"
          description="When students purchase your commercial book catalog, shipments will appear here for packing."
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
                  className="px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </VendorLayout>
  );
}
