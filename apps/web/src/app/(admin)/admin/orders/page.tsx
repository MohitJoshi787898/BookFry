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
  Pencil,
  Trash2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  X,
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

  const mutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  return (
    <select
      value={currentStatus}
      onChange={(e) => mutation.mutate(e.target.value)}
      disabled={mutation.isPending}
      className="px-2 py-1 text-xs border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-brand font-medium"
      onClick={(e) => e.stopPropagation()}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

export default function AdminOrdersPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: 'confirmed', note: '' });

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
    enabled: !!isAdmin,
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setEditModalOpen(false);
      setSelectedOrder(null);
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled', note: 'Soft deleted by administrator' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setDeleteModalOpen(false);
      setSelectedOrder(null);
    },
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

  const returnRequestsCount = ordersData.filter(
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
        <div className="flex items-center space-x-1.5 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(o);
            }}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Order Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Order */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(o);
              setEditForm({ status: o.status, note: '' });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Order"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Soft Delete Order */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(o);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
            title="Soft Delete Order"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <ShoppingBag className="h-7 w-7 text-brand" />
            <span>Marketplace Order Operations</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track customer textbook fulfillments, process shipping status updates, and manage buyer return requests.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-brand"
          >
            <option value="">All Orders ({ordersData.length})</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {returnRequestsCount > 0 && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-center justify-between font-sans">
          <div className="flex items-center space-x-3 text-warning">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">Action Required: {returnRequestsCount} Buyer Return Requests Pending</p>
              <p className="text-[11px] text-text-secondary">Click on any order flagged with Return Pending to inspect buyer notes and proof images.</p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('return_requested')}
            className="px-3 py-1 bg-warning text-white font-bold text-xs rounded hover:bg-warning/90 transition-colors"
          >
            Review Returns
          </button>
        </div>
      )}

      {/* Main Data Table */}
      {isError ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load marketplace orders.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry Orders Fetch
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Marketplace Orders Directory"
          subtitle="Real-time fulfillment and buyer transaction pipeline"
          data={ordersData}
          columns={columns}
          searchField="orderNumber"
          searchPlaceholder="Search order number..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && !editModalOpen && !deleteModalOpen && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* EDIT ORDER MODAL */}
      {editModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Pencil className="h-6 w-6 text-accent" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Order #{selectedOrder.orderNumber}</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateOrderMutation.mutate({ orderId: selectedOrder.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Order Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary font-medium"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Admin Fulfill Note</label>
                <textarea
                  rows={3}
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="Optional fulfillment tracking notes or shipping status update..."
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-text-primary hover:bg-background-subtle font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateOrderMutation.isPending}
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90 flex items-center space-x-1"
                >
                  {updateOrderMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Update Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Soft Delete / Cancel Order</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to soft delete order <span className="font-bold text-text-primary">#{selectedOrder.orderNumber}</span>? The order status will be updated to <span className="font-bold text-danger">Cancelled</span>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Keep Order
              </button>
              <button
                onClick={() => softDeleteMutation.mutate(selectedOrder.id)}
                disabled={softDeleteMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {softDeleteMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Soft Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
