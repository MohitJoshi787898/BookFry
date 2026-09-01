'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { UsedRequestDetailModal } from '@/components/admin/used-request-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { UsedBookRequest } from '@bookmarket/types';
import { Eye, Clock } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  requested: 'Request Sent',
  seller_notified: 'Seller Notified',
  seller_contacted_buyer: 'Seller Contacted You',
  accepted: 'Offer Accepted',
  in_discussion: 'In Discussion',
  completed: 'Deal Closed',
  declined: 'Declined',
  cancelled: 'Cancelled',
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
};

export default function CustomerRequestsPage() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<UsedBookRequest | null>(null);

  const { data: requests = [], isError, refetch } = useQuery<UsedBookRequest[]>({
    queryKey: ['buyer-used-requests', statusFilter],
    queryFn: async () => {
      try {
        const url = statusFilter ? `/used-book-requests/admin?status=${statusFilter}` : '/used-book-requests/admin';
        const res = await apiClient<{ success: boolean; data: UsedBookRequest[] }>(url);
        return res.data || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <RoleEmptyState
        title="Sign In to Track Used Book Inquiries"
        description="Log in to view seller responses and negotiation updates."
        mascotVariant="reading"
      />
    );
  }

  const rawRequests = requests || [];
  const filteredRequests = rawRequests.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterChips = [
    { id: '', label: 'All Requests', count: rawRequests.length },
    { id: 'requested', label: 'Awaiting Seller', count: rawRequests.filter((r) => r.status === 'requested' || r.status === 'seller_notified').length },
    { id: 'in_discussion', label: 'In Discussion', count: rawRequests.filter((r) => r.status === 'in_discussion' || r.status === 'seller_contacted_buyer').length },
    { id: 'completed', label: 'Deals Completed', count: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length },
  ];

  return (
    <div className="space-y-6">
      <RoleHero
        title="My Used Book Requests &amp; P2P Inquiries"
        subtitle="Track direct seller offers for second-hand textbooks, negotiable deals, and verified campus handovers."
        badgeText="Student Peer-to-Peer Requests"
        showMascot={true}
        mascotPose="reading"
        stats={[
          { label: 'Total Inquiries', value: rawRequests.length, badge: 'Sent', isPositive: true },
          { label: 'Active Negotiations', value: rawRequests.filter((r) => r.status === 'in_discussion').length, badge: 'Discussion', isPositive: true },
          { label: 'Deals Closed', value: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length, badge: 'Purchased', isPositive: true },
          { label: 'Campus Escrow', value: '100% Safe', badge: 'Protected', isPositive: true },
        ]}
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search book title or request number..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Requests Fetch Error"
          description="Failed to load your P2P textbook requests."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredRequests.length === 0 ? (
        <RoleEmptyState
          title="No Used Book Requests Found"
          description={searchQuery ? 'Try clearing your search term.' : 'Browse the used book section and send direct purchase requests to student sellers.'}
          mascotVariant="searching"
          action={{
            label: 'Browse Used Books',
            onClick: () => window.location.assign('/books?condition=used_good'),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-secondary text-xs">{req.requestNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      STATUS_COLORS[req.status] || 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {STATUS_LABELS[req.status] || req.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <h3 className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                  {req.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Offered Price: <span className="font-mono font-extrabold text-foreground">₹{req.price}</span> • Target Condition: <span className="capitalize font-bold text-foreground">{req.condition.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Used Request Detail Modal */}
      <UsedRequestDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
