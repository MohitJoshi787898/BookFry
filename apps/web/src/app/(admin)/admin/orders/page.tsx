'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order, OrderStatus } from '@bookmarket/types';
import {
  ShoppingBag,
  ShieldAlert,
  Filter,
  CheckCircle2,
  Truck,
  RefreshCw,
  Eye,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'return_requested',
  'return_approved',
  'return_rejected',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: 'bg-success/10 text-success border-success/20',
    shipped: 'bg-accent/10 text-accent border-accent/20',
    confirmed: 'bg-brand/10 text-brand border-brand/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    cancelled: 'bg-danger/10 text-danger border-danger/20',
    refunded: 'bg-danger/10 text-danger border-danger/20',
    return_requested: 'bg-warning/10 text-warning border-warning/20',
    return_approved: 'bg-success/10 text-success border-success/20',
    return_rejected: 'bg-danger/10 text-danger border-danger/20',
  };

  const iconMap: Record<string, React.ReactNode> = {
    delivered: <CheckCircle2 className="h-3 w-3" />,
    shipped: <Truck className="h-3 w-3" />,
    confirmed: <CheckCircle2 className="h-3 w-3" />,
    pending: <RefreshCw className="h-3 w-3 animate-spin" />,
    cancelled: <XCircle className="h-3 w-3" />,
    refunded: <RotateCcw className="h-3 w-3" />,
    return_requested: <RotateCcw className="h-3 w-3" />,
    return_approved: <CheckCircle2 className="h-3 w-3" />,
    return_rejected: <XCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[status] ?? 'bg-surface text-text-secondary border-border'}`}
    >
      {iconMap[status]}
      {STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}

function InlineStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(currentStatus);

  const mutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => {
      setValue(currentStatus); // revert on error
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setValue(newStatus);
    mutation.mutate(newStatus);
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <select
        value={value}
        onChange={handleChange}
        disabled={mutation.isPending}
        aria-label={`Change status for order`}
        className="text-[10px] font-bold uppercase px-2 py-1 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-brand focus:outline-none disabled:opacity-50 cursor-pointer hover:border-brand/50 transition-colors pr-6 appearance-none"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {mutation.isPending && (
        <RefreshCw className="h-3 w-3 text-brand animate-spin flex-shrink-0" />
      )}
      {mutation.isError && (
        <span className="text-[9px] text-danger font-bold">Failed</span>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    data: ordersData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      try {
        const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
        const res = await apiClient<unknown>(url);
        if (Array.isArray(res)) return res as Order[];
        const resData = res as Record<string, unknown>;
        if ('data' in resData && Array.isArray(resData.data)) return resData.data as Order[];
        return [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && isAdmin,
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </AdminLayout>
    );
  }

  const pendingReturns = ordersData.filter(
    (o) => o.returnRequest?.status === 'pending'
  ).length;

  const columns: Column<Order>[] = [
    {
      header: 'Order Ref',
      cell: (o) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-brand text-xs">{o.orderNumber}</span>
          <p className="text-[10px] text-text-muted mt-0.5">
            {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (o) => (
        <span className="text-xs font-medium text-text-primary">
          {o.items?.length > 0 ? o.items[0].title : 'Book Purchase'}
          {o.items?.length > 1 && (
            <span className="text-text-muted"> +{o.items.length - 1} more</span>
          )}
        </span>
      ),
    },
    {
      header: 'Total',
      cell: (o) => (
        <span className="font-bold font-mono text-xs text-text-primary">
          ₹{(o.total || 0).toFixed(0)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (o) => (
        <div className="flex flex-col gap-1.5">
          <StatusBadge status={o.status} />
          {o.returnRequest?.status === 'pending' && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-warning uppercase">
              <AlertTriangle className="h-2.5 w-2.5" /> Return Pending
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Change Status',
      cell: (o) => <InlineStatusSelect orderId={o.id} currentStatus={o.status} />,
    },
    {
      header: 'Actions',
      cell: (o) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold border border-brand/40 text-brand rounded-lg hover:bg-brand/5 transition-colors"
          aria-label={`View order ${o.orderNumber}`}
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-brand" />
            Marketplace Orders
            {pendingReturns > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {pendingReturns} Return{pendingReturns > 1 ? 's' : ''} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Monitor purchases, update shipment status, and manage return requests.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load orders.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Orders Ledger"
          subtitle="Real-time transaction & shipping management"
          data={ordersData}
          columns={columns}
          searchField="orderNumber"
          searchPlaceholder="Search order number..."
          isLoading={isLoading}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
