'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { UsedRequestDetailModal } from '@/components/admin/used-request-detail-modal';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { UsedBookRequest } from '@bookmarket/types';
import { Eye, Phone, Mail, Clock } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  requested: 'New Lead',
  seller_notified: 'Awaiting Your Response',
  seller_contacted_buyer: 'Contacted Buyer',
  accepted: 'Offer Accepted',
  in_discussion: 'In Discussion',
  completed: 'Deal Closed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  seller_notified: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  seller_contacted_buyer: 'bg-primary/10 text-primary border-primary/20',
  accepted: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  in_discussion: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  declined: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  cancelled: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  expired: 'bg-muted text-muted-foreground border-border',
};

export default function SellerRequestsPage() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<UsedBookRequest | null>(null);

  const { data: requests = [], isError, refetch } = useQuery<UsedBookRequest[]>({
    queryKey: ['seller-used-requests', statusFilter],
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
      <SellerLayout>
        <RoleEmptyState
          title="Sign In to View Buyer Leads"
          description="Log in to view incoming buyer inquiries for your second-hand books."
          mascotVariant="reading"
        />
      </SellerLayout>
    );
  }

  const rawRequests = requests || [];
  const filteredRequests = rawRequests.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buyerContact?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterChips = [
    { id: '', label: 'All Leads', count: rawRequests.length },
    { id: 'requested', label: 'New Leads', count: rawRequests.filter((r) => r.status === 'requested' || r.status === 'seller_notified').length },
    { id: 'in_discussion', label: 'In Discussion', count: rawRequests.filter((r) => r.status === 'in_discussion' || r.status === 'seller_contacted_buyer').length },
    { id: 'completed', label: 'Deals Closed', count: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length },
  ];

  return (
    <SellerLayout>
      <RoleHero
        title="Buyer Leads & Used Book Inquiries (P2P)"
        subtitle="Connect directly with verified students looking to purchase your second-hand syllabus books and competitive exam materials."
        badgeText="Student Buyer Leads Pipeline"
        stats={[
          { label: 'Total Inquiries', value: rawRequests.length, badge: 'Leads', isPositive: true },
          { label: 'Action Required', value: rawRequests.filter((r) => r.status === 'requested' || r.status === 'seller_notified').length, badge: 'Urgent', isPositive: false },
          { label: 'In Discussion', value: rawRequests.filter((r) => r.status === 'in_discussion' || r.status === 'seller_contacted_buyer').length, badge: 'Active', isPositive: true },
          { label: 'Deals Closed', value: rawRequests.filter((r) => r.status === 'completed' || r.status === 'accepted').length, badge: 'Sold', isPositive: true },
        ]}
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search book title, lead ref, or student buyer..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Failed to Load Buyer Leads"
          description="Check your internet connection or session login."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredRequests.length === 0 ? (
        <RoleEmptyState
          title="No Buyer Leads Found"
          description={searchQuery ? 'Try clearing your search term.' : 'List more high-demand semester textbooks to attract student buyer leads!'}
          mascotVariant="searching"
        />
      ) : (
        <div className="space-y-3 font-sans">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
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

                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                    {req.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Offered Price: <span className="font-mono font-extrabold text-foreground">₹{req.price}</span> • Condition: <span className="capitalize font-bold text-foreground">{req.condition.replace('_', ' ')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Buyer: {req.buyerContact?.name || 'Student'}</span>
                  {req.buyerContact?.phone && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="h-3 w-3 text-secondary" /> {req.buyerContact.phone}
                    </span>
                  )}
                  {req.buyerContact?.email && (
                    <span className="flex items-center gap-1 font-mono text-[11px] hidden sm:flex">
                      <Mail className="h-3 w-3 text-secondary" /> {req.buyerContact.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Review Lead</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Used Book Request Detail Sheet */}
      <UsedRequestDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </SellerLayout>
  );
}
