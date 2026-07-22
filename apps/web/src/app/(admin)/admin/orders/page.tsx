'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { ShoppingBag, ShieldAlert, Filter, CheckCircle2, Truck, RefreshCw } from 'lucide-react';

interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string | { name: string; email: string };
  sellerId: string | { name: string; email: string };
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [statusFilter, setStatusFilter] = useState('');

  const {
    data: ordersData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      try {
        const res = await apiClient<unknown>(`/admin/dashboard`);
        if (Array.isArray(res)) return res as Order[];
        const resData = res as Record<string, unknown>;
        if ('data' in resData && Array.isArray(resData.data)) return resData.data as Order[];
        if ('recentOrders' in resData && Array.isArray(resData.recentOrders)) return resData.recentOrders as Order[];
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

  const filteredOrders = ordersData.filter((o) => (!statusFilter ? true : o.status === statusFilter));

  const columns: Column<Order>[] = [
    {
      header: 'Order Reference',
      cell: (o) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-brand">{o.orderNumber}</span>
          <p className="text-[11px] text-text-muted">{new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
        </div>
      ),
    },
    {
      header: 'Purchased Items',
      cell: (o) => (
        <span className="font-medium text-text-primary">
          {o.items?.length > 0 ? o.items[0].title : 'Textbook Purchase'}
          {o.items?.length > 1 && ` (+${o.items.length - 1} more)`}
        </span>
      ),
    },
    {
      header: 'Total Paid',
      cell: (o) => (
        <span className="font-bold font-mono text-text-primary">₹{(o.total || 0).toFixed(0)}</span>
      ),
    },
    {
      header: 'Payment Gateway',
      cell: (o) => (
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-background-subtle border border-border rounded text-text-secondary">
          {o.paymentMethod || 'UPI'} • {o.paymentStatus || 'paid'}
        </span>
      ),
    },
    {
      header: 'Order Status',
      cell: (o) => (
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            o.status === 'delivered'
              ? 'bg-success/10 text-success border border-success/20'
              : o.status === 'shipped'
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'bg-brand/10 text-brand border border-brand/20'
          }`}
        >
          {o.status === 'delivered' ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : o.status === 'shipped' ? (
            <Truck className="h-3 w-3" />
          ) : (
            <RefreshCw className="h-3 w-3 animate-spin" />
          )}
          <span>{o.status}</span>
        </span>
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
            <span>Marketplace Orders & Escrow Refunds</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Monitor buyer purchases, track campus shipments, and manage dispute refund overrides.
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
            <option value="">All Order Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="shipped">Shipped</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Escrow</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load marketplace orders log.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry Orders Fetch
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Marketplace Orders Ledger"
          subtitle="Real-time transaction & shipping tracking"
          data={filteredOrders}
          columns={columns}
          searchField="orderNumber"
          searchPlaceholder="Search order number..."
          isLoading={isLoading}
        />
      )}
    </AdminLayout>
  );
}
