'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order, OrderStatus } from '@bookmarket/types';
import {
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
} from 'lucide-react';
import { AdminDialog } from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';

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
      {/* Hero Header */}
      <AdminHero
        title="Marketplace Order Operations"
        subtitle="Track customer textbook fulfillments, process shipping status updates, and manage buyer return requests."
        badgeText="Escrow Payment Operations"
        stats={[
          { label: "Total Orders", value: ordersData.length, badge: "All Time", isPositive: true },
          { label: "Pending Fulfillment", value: ordersData.filter((o) => o.status === "pending" || o.status === "confirmed").length, badge: "Action Required", isPositive: false },
          { label: "Shipped & In-Transit", value: ordersData.filter((o) => o.status === "shipped").length, badge: "On The Way", isPositive: true },
          { label: "Delivered Complete", value: ordersData.filter((o) => o.status === "delivered").length, badge: "Escrow Settled", isPositive: true },
        ]}
      />

      {/* Filter Bar */}
      <div className="flex items-center justify-between pb-4 font-sans">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-secondary" />
          <span className="text-xs font-bold text-muted-foreground">Filter Orders:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-border/80 rounded-2xl bg-card text-foreground focus:ring-2 focus:ring-secondary/40 shadow-sm"
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
      {selectedOrder && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
          }}
          size="md"
          title={`Edit Order #${selectedOrder.orderNumber}`}
          subtitle={`Adjusting fulfillment lifecycle and carrier notes`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-order-form"
                disabled={updateOrderMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
              >
                {updateOrderMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Update Order</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-order-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateOrderMutation.mutate({ orderId: selectedOrder.id, data: editForm });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Fulfillment & Dispatch Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Admin Fulfillment / Carrier Tracking Note
              </label>
              <textarea
                rows={3}
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="e.g. Dispatched via India Post / DTDC with AWB #..."
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </form>
        </AdminDialog>
      )}

      {/* SOFT DELETE / CANCEL ORDER DANGER DIALOG */}
      {selectedOrder && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedOrder(null);
          }}
          onConfirm={() => softDeleteMutation.mutate(selectedOrder.id)}
          isPending={softDeleteMutation.isPending}
          title="Confirm Order Cancellation"
          entityName={`Order #${selectedOrder.orderNumber} (₹${selectedOrder.total})`}
          description={
            <span>
              Are you sure you want to cancel order <strong>#{selectedOrder.orderNumber}</strong>?
            </span>
          }
          impacts={[
            'The order lifecycle status will transition to "Cancelled".',
            'If payment was processed online, a refund reconciliation trigger will be initiated.',
            'Reserved item stocks will be restored to seller inventory.',
            'The buyer and seller will receive email status notifications.',
          ]}
          confirmText="Cancel & Soft Delete Order"
        />
      )}
    </AdminLayout>
  );
}
