'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { OrderDetailModal } from '@/components/admin/order-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Order, OrderStatus } from '@bookmarket/types';
import {
  CheckCircle2,
  Truck,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Package,
  User,
  IndianRupee,
} from 'lucide-react';
import { AdminModal } from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';

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
    delivered: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    shipped: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    confirmed: 'bg-primary/10 text-primary border-primary/20',
    pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    cancelled: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    refunded: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    return_requested: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    return_approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    return_rejected: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
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
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
        map[status] ?? 'bg-muted text-muted-foreground border-border'
      }`}
    >
      {iconMap[status]}
      {STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
      apiClient(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
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
        body: JSON.stringify({ status: 'cancelled', note: 'Cancelled by administrator' }),
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
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to manage customer orders and refunds."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const rawOrders = ordersData || [];
  const orders = searchQuery.trim()
    ? rawOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.items?.some((it) => it.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rawOrders;

  const returnRequestsCount = rawOrders.filter((o) => o.returnRequest?.status === 'pending').length;

  const filterChips = [
    { id: '', label: 'All Orders', count: rawOrders.length },
    { id: 'pending', label: 'Pending', count: rawOrders.filter((o) => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: rawOrders.filter((o) => o.status === 'confirmed').length },
    { id: 'shipped', label: 'In-Transit', count: rawOrders.filter((o) => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: rawOrders.filter((o) => o.status === 'delivered').length },
    { id: 'return_requested', label: 'Returns', count: returnRequestsCount },
  ];

  const columns: Column<Order>[] = [
    {
      header: 'Order Ref',
      cell: (o) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-foreground text-xs">{o.orderNumber}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Purchased Items',
      cell: (o) => (
        <span className="text-xs font-semibold text-foreground">
          {o.items?.length > 0 ? o.items[0].title : 'Textbook Package'}
          {o.items?.length > 1 && <span className="text-muted-foreground"> +{o.items.length - 1} more</span>}
        </span>
      ),
    },
    {
      header: 'Gross Total',
      cell: (o) => <span className="font-extrabold font-mono text-xs text-foreground">₹{(o.total || 0).toFixed(0)}</span>,
    },
    {
      header: 'Fulfillment Status',
      cell: (o) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={o.status} />
          {o.returnRequest?.status === 'pending' && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase">
              <AlertTriangle className="h-2.5 w-2.5" /> Return Dispute
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (o) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => setSelectedOrder(o)}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedOrder(o);
              setEditForm({ status: o.status, note: '' });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-colors cursor-pointer"
            title="Edit Order"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setSelectedOrder(o); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
            title="Cancel Order"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Marketplace Order Operations"
        subtitle="Track customer textbook fulfillments, process shipping status updates, and manage buyer return disputes."
        badgeText="Escrow Payment Operations"
        stats={[
          { label: 'Total Orders', value: rawOrders.length, badge: 'All Time', isPositive: true },
          { label: 'Pending Dispatch', value: rawOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length, badge: 'Action Required', isPositive: false },
          { label: 'In-Transit', value: rawOrders.filter((o) => o.status === 'shipped').length, badge: 'Shipped', isPositive: true },
          { label: 'Delivered', value: rawOrders.filter((o) => o.status === 'delivered').length, badge: 'Settled', isPositive: true },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search order number or book title..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {returnRequestsCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-between font-sans">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Action Required: {returnRequestsCount} Buyer Return Dispute(s) Pending</p>
              <p className="text-[11px] text-muted-foreground">Click on any order to review buyer photos and issue a refund decision.</p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('return_requested')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all"
          >
            Review Returns
          </button>
        </div>
      )}

      {isError ? (
        <AdminEmptyState
          title="Orders Fetch Error"
          description="Failed to load orders from the database."
          mascotVariant="pointing"
          action={{ label: 'Retry Orders Fetch', onClick: () => refetch() }}
        />
      ) : (
        <AdminDataTable
          title="Marketplace Orders Pipeline"
          subtitle="Real-time fulfillment and buyer transaction log"
          data={orders}
          columns={columns}
          searchField="orderNumber"
          searchPlaceholder="Search order number..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && !editModalOpen && !deleteModalOpen && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}      {/* EDIT ORDER MODAL — Status Transition Workspace */}
      {selectedOrder && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedOrder(null); }}
          size="lg"
          title={`Update Order #${selectedOrder.orderNumber}`}
          subtitle="Fulfillment status transition & carrier dispatch notes"
          icon={<Pencil className="h-4 w-4" />}
          loading={updateOrderMutation.isPending}
          footer={
            <>
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedOrder(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl border border-border/70 hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-order-form"
                disabled={updateOrderMutation.isPending}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {updateOrderMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Update Order</span>
              </button>
            </>
          }
        >
          {/* Order Context Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border/60 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono font-bold text-sm text-foreground">#{selectedOrder.orderNumber}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {selectedOrder.items?.length > 0 ? selectedOrder.items[0].title : 'Book Package'}
                {selectedOrder.items?.length > 1 && <span className="ml-1 text-primary font-semibold">+{selectedOrder.items.length - 1} more</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-extrabold text-sm text-foreground">₹{(selectedOrder.total || 0).toFixed(0)}</p>
              <StatusBadge status={selectedOrder.status} />
            </div>
          </div>

          {/* Buyer row */}
          <div className="flex items-center gap-2 px-1 py-1">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              Buyer: <span className="font-semibold text-foreground">
                {(selectedOrder as unknown as Record<string, Record<string, string>>).buyer?.name || 'Customer'}
              </span>
            </span>
            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            <span className="text-xs text-muted-foreground">
              Total: <span className="font-mono font-extrabold text-foreground">₹{(selectedOrder.total || 0).toFixed(0)}</span>
            </span>
          </div>

          <form id="edit-order-form" onSubmit={(e) => { e.preventDefault(); updateOrderMutation.mutate({ orderId: selectedOrder.id, data: editForm }); }} className="space-y-5 pt-1">
            {/* Status Transition Visualizer */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Fulfillment Status Transition</label>
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={selectedOrder.status} />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {editForm.status !== selectedOrder.status ? (
                  <StatusBadge status={editForm.status} />
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">— no change yet —</span>
                )}
              </div>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}
                className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              {/* Per-status consequence hint */}
              {editForm.status === 'shipped' && (
                <p className="mt-2 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-1.5">
                  📦 Buyer will be notified to track their shipment. Add AWB number below.
                </p>
              )}
              {editForm.status === 'delivered' && (
                <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                  ✅ Payment escrow will be released to the seller. This action is final.
                </p>
              )}
              {editForm.status === 'cancelled' && (
                <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
                  ⚠️ Order will be cancelled. Refund will be initiated and stock restored.
                </p>
              )}
              {editForm.status === 'refunded' && (
                <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
                  💸 Full refund will be triggered to the buyer&apos;s original payment method.
                </p>
              )}
              {editForm.status === 'return_approved' && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                  🔄 Return approved. Buyer will receive pickup instructions. Refund pending return receipt.
                </p>
              )}
            </div>

            {/* Carrier Tracking Note */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Carrier Tracking Note</label>
              <textarea
                rows={3}
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="e.g. Dispatched via India Post / DTDC with AWB #..."
                className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </form>
        </AdminModal>
      )}

      {/* CANCEL ORDER DANGER MODAL */}
      {selectedOrder && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedOrder(null); }}
          onConfirm={() => softDeleteMutation.mutate(selectedOrder.id)}
          isPending={softDeleteMutation.isPending}
          title="Cancel This Order?"
          entityName={`Order #${selectedOrder.orderNumber} — ₹${(selectedOrder.total || 0).toFixed(0)}`}
          description={
            <span>
              You are about to cancel order <strong>#{selectedOrder.orderNumber}</strong> placed by the buyer.
              This will stop fulfillment and trigger a refund reconciliation process.
            </span>
          }
          impacts={[
            'Order status will permanently transition to Cancelled.',
            'Payment refund trigger will be queued for reconciliation.',
            'Reserved textbook stock will be restored to seller inventory.',
            'Buyer and seller will receive cancellation email notifications.',
          ]}
          confirmText="Cancel Order"
        />
      )}
    </AdminLayout>
  );
}
