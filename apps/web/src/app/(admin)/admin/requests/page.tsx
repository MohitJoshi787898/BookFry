'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { UsedRequestDetailModal } from '@/components/admin/used-request-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { UsedBookRequest } from '@bookmarket/types';
import { ShieldAlert, Filter, Eye } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  seller_notified: 'Seller Notified',
  seller_contacted_buyer: 'Seller Contacted Buyer',
  accepted: 'Accepted',
  in_discussion: 'In Discussion',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-info/10 text-info border-info/20',
  seller_notified: 'bg-info/10 text-info border-info/20',
  seller_contacted_buyer: 'bg-primary/10 text-primary border-primary/20',
  accepted: 'bg-success/10 text-success border-success/20',
  in_discussion: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  declined: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
  expired: 'bg-muted text-text-muted border-border',
};

export default function AdminUsedRequestsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<UsedBookRequest | null>(null);

  const { data: requests = [], isLoading, isError, refetch } = useQuery<UsedBookRequest[]>({
    queryKey: ['admin-used-requests', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/used-book-requests/admin?status=${statusFilter}` : '/used-book-requests/admin';
      const res = await apiClient<{ success: boolean; data: UsedBookRequest[] }>(url);
      return res.data || [];
    },
    enabled: !!isAdmin,
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border bg-card rounded-2xl font-sans space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </AdminLayout>
    );
  }

  const columns: Column<UsedBookRequest>[] = [
    {
      header: 'Request Ref',
      cell: (r) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-secondary text-xs">{r.requestNumber}</span>
          <p className="text-[11px] text-text-muted mt-0.5">
            {new Date(r.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Book Title',
      cell: (r) => (
        <div className="font-sans">
          <p className="text-xs sm:text-sm font-bold text-text-primary line-clamp-1">{r.title}</p>
          <span className="text-[11px] text-text-muted capitalize">Condition: {r.condition.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Buyer Info',
      cell: (r) => (
        <div className="text-xs font-sans">
          <p className="font-bold text-text-primary">{r.buyerContact?.name}</p>
          <p className="text-[11px] text-text-muted">{r.buyerContact?.email}</p>
        </div>
      ),
    },
    {
      header: 'Seller Info',
      cell: (r) => (
        <div className="text-xs font-sans">
          <p className="font-bold text-primary">{r.sellerName || 'Verified Seller'}</p>
          {r.sellerCity && <p className="text-[11px] text-text-muted">{r.sellerCity}, {r.sellerState}</p>}
        </div>
      ),
    },
    {
      header: 'Asking Price',
      cell: (r) => (
        <span className="font-bold font-mono text-xs sm:text-sm text-text-primary">
          ₹{r.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${
            STATUS_COLORS[r.status] || 'bg-muted text-text-secondary border-border'
          }`}
        >
          {STATUS_LABELS[r.status] || r.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1.5 font-sans">
          <button
            onClick={() => setSelectedRequest(r)}
            className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
            title="View Request Details"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Used Book Direct Requests Operations"
        subtitle="Monitor buyer-seller interest requests for used books, track seller response rates, and ensure abuse-free marketplace communication."
        badgeText="P2P Used Book Marketplace"
        stats={[
          { label: "Total Requests", value: requests.length, badge: "All Time", isPositive: true },
          { label: "Pending Seller Contact", value: requests.filter((r) => r.status === "requested" || r.status === "seller_notified").length, badge: "Awaiting Action", isPositive: false },
          { label: "Contact Initiated", value: requests.filter((r) => r.status === "seller_contacted_buyer" || r.status === "in_discussion").length, badge: "In Discussion", isPositive: true },
          { label: "Completed Handovers", value: requests.filter((r) => r.status === "completed" || r.status === "accepted").length, badge: "Successful P2P", isPositive: true },
        ]}
      />

      <div className="flex items-center justify-between pb-4 font-sans">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-secondary" />
          <span className="text-xs font-bold text-text-muted">Filter Requests:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-border rounded-xl bg-card text-text-primary focus:ring-2 focus:ring-secondary/40 shadow-2xs"
          >
            <option value="">All Requests ({requests.length})</option>
            {Object.keys(STATUS_LABELS).map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center border border-border bg-card rounded-2xl font-sans space-y-3 shadow-xs">
          <p className="text-sm font-bold text-danger">Failed to load used book requests.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Used Book Requests Directory"
          subtitle="Peer-to-peer textbook interest request log"
          data={requests}
          columns={columns}
          searchField="title"
          searchPlaceholder="Search book title..."
          isLoading={isLoading}
        />
      )}

      {/* OPERATIONAL USED REQUEST DETAILS MODAL */}
      <UsedRequestDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </AdminLayout>
  );
}
