'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { UsedRequestDetailModal } from '@/components/admin/used-request-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { UsedBookRequest } from '@bookmarket/types';
import { Eye } from 'lucide-react';

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
  requested: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  seller_notified: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  seller_contacted_buyer: 'bg-primary/10 text-primary border-primary/20',
  accepted: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  in_discussion: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  declined: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  cancelled: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  expired: 'bg-muted text-muted-foreground border-border',
};

export default function AdminUsedRequestsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to monitor P2P used book requests."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const rawRequests = requests || [];
  const filteredRequests = searchQuery.trim()
    ? rawRequests.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.buyerContact?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawRequests;

  const filterChips = [
    { id: '', label: 'All Requests', count: rawRequests.length },
    { id: 'requested', label: 'Requested', count: rawRequests.filter((r) => r.status === 'requested' || r.status === 'seller_notified').length },
    { id: 'in_discussion', label: 'In Discussion', count: rawRequests.filter((r) => r.status === 'in_discussion' || r.status === 'seller_contacted_buyer').length },
    { id: 'completed', label: 'Completed', count: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length },
  ];

  const columns: Column<UsedBookRequest>[] = [
    {
      header: 'Request Ref',
      cell: (r) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-secondary text-xs">{r.requestNumber}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {new Date(r.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      ),
    },
    {
      header: 'Book Title',
      cell: (r) => (
        <div className="font-sans">
          <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">{r.title}</p>
          <span className="text-[11px] text-muted-foreground capitalize font-medium">
            Condition: {r.condition.replace('_', ' ')}
          </span>
        </div>
      ),
    },
    {
      header: 'Buyer Info',
      cell: (r) => (
        <div className="text-xs font-sans">
          <p className="font-bold text-foreground">{r.buyerContact?.name || 'Student Buyer'}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{r.buyerContact?.email}</p>
        </div>
      ),
    },
    {
      header: 'Asking Price',
      cell: (r) => (
        <span className="font-extrabold font-mono text-xs sm:text-sm text-foreground">
          ₹{r.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
            STATUS_COLORS[r.status] || 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {STATUS_LABELS[r.status] || r.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5 font-sans">
          <button
            onClick={() => setSelectedRequest(r)}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Used Book Direct Requests (P2P Leads)"
        subtitle="Monitor buyer-seller interest requests for used books, track seller response rates, and ensure safe campus communication."
        badgeText="P2P Used Book Marketplace"
        stats={[
          { label: 'Total Requests', value: rawRequests.length, badge: 'All Time', isPositive: true },
          { label: 'Pending Seller', value: rawRequests.filter((r) => r.status === 'requested' || r.status === 'seller_notified').length, badge: 'Awaiting Action', isPositive: false },
          { label: 'In Discussion', value: rawRequests.filter((r) => r.status === 'seller_contacted_buyer' || r.status === 'in_discussion').length, badge: 'Active', isPositive: true },
          { label: 'Completed', value: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length, badge: 'Successful', isPositive: true },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search request number, title, or buyer..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <AdminEmptyState
          title="Requests Fetch Error"
          description="Failed to load used book requests from the backend database."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : (
        <AdminDataTable
          title="Used Book Requests Log"
          subtitle="Peer-to-peer textbook interest request ledger"
          data={filteredRequests}
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
