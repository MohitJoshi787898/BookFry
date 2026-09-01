'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { OrdersCardItem } from '@/components/orders/orders-card-item';
import { ReturnRequestModal } from '@/components/shared/return-request-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order } from '@bookmarket/types';
import { RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [statusTab, setStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);

  const {
    data: orders = [],
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['buyer-orders-list'],
    queryFn: async () => {
      try {
        const res = await apiClient<unknown>('/orders');
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
      <RoleEmptyState
        title="Sign In to Track Orders"
        description="Log in to view your textbook shipments, delivery status, and invoices."
        mascotVariant="reading"
      />
    );
  }

  const rawOrders = orders || [];
  const inTransitCount = rawOrders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;
  const deliveredCount = rawOrders.filter((o) => o.status === 'delivered').length;
  const returnsCount = rawOrders.filter((o) => ['return_requested', 'return_approved', 'return_rejected'].includes(o.status)).length;

  const filteredOrders = rawOrders.filter((o) => {
    if (statusTab === 'in_transit' && !['pending', 'confirmed', 'shipped'].includes(o.status)) return false;
    if (statusTab === 'delivered' && o.status !== 'delivered') return false;
    if (statusTab === 'returns' && !['return_requested', 'return_approved', 'return_rejected'].includes(o.status)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchTitle = o.items?.some((it) => it.title.toLowerCase().includes(q));
      return matchOrderNum || matchTitle;
    }
    return true;
  });

  const filterChips = [
    { id: 'all', label: 'All Orders', count: rawOrders.length },
    { id: 'in_transit', label: 'In-Transit', count: inTransitCount },
    { id: 'delivered', label: 'Delivered', count: deliveredCount },
    { id: 'returns', label: 'Returns & Refunds', count: returnsCount },
  ];

  return (
    <div className="space-y-6">
      <RoleHero
        title="My Orders &amp; Delivery Tracking"
        subtitle="Track textbook shipments in real-time, view verified delivery proofs, and request hassle-free 7-day returns."
        badgeText="Student Order Pipeline"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'Total Purchases', value: rawOrders.length, badge: 'All Time', isPositive: true },
          { label: 'In-Transit', value: inTransitCount, badge: inTransitCount > 0 ? 'On The Way' : 'Delivered', isPositive: true },
          { label: 'Delivered', value: deliveredCount, badge: 'Completed', isPositive: true },
          { label: 'Return Guarantee', value: '7 Days', badge: '100% Escrow', isPositive: true },
        ]}
      />

      {/* 7-Day Return Policy Guarantee Banner */}
      <div className="p-4 rounded-3xl bg-secondary/10 border border-secondary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-secondary/15 text-secondary shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              BookFry 7-Day Student Return Guarantee
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Every textbook purchase is protected with our doorstep return guarantee. If book condition differs from description, get a 100% refund.
            </p>
          </div>
        </div>
        <Link
          href="/account/requests"
          className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          <span>Used Requests</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order number or book title..."
        filterChips={filterChips}
        activeFilter={statusTab}
        onFilterSelect={setStatusTab}
      />

      {isError ? (
        <RoleEmptyState
          title="Order History Load Issue"
          description="Failed to load your order history."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredOrders.length === 0 ? (
        <RoleEmptyState
          title="No Orders Found"
          description={searchQuery ? 'Try clearing your search query.' : 'Browse our verified textbook marketplace and find the best deals for your semester!'}
          mascotVariant="searching"
          action={{
            label: 'Browse Books',
            onClick: () => window.location.assign('/books'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrdersCardItem
              key={order.id}
              order={order}
              onOpenReturnModal={(ord) => setReturnModalOrder(ord)}
            />
          ))}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOrder && (
        <ReturnRequestModal
          orderId={returnModalOrder.id}
          orderNumber={returnModalOrder.orderNumber}
          returnWindowDays={7}
          onClose={() => setReturnModalOrder(null)}
        />
      )}
    </div>
  );
}
