'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  BookOpen,
  EyeOff,
  CheckCircle,
  ExternalLink,
  AlertOctagon,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  AdminModal,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';
import { AdminDecisionModal } from '@/components/admin/admin-decision-modal';
import Link from 'next/link';

interface AdminListing {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  condition?: string;
  rejectionReason?: string;
}

export default function AdminListingsPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', price: 0, stock: 0, status: 'active', condition: 'good' });

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminListing[]>({
    queryKey: ['admin-listings', statusFilter],
    queryFn: () => apiClient(`/admin/listings?limit=100&status=${statusFilter}`),
    enabled: isAuthenticated && isAdmin,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) =>
      apiClient(`/admin/listings/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setRejectModalOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setEditModalOpen(false);
      setSelectedListing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setDeleteModalOpen(false);
      setSelectedListing(null);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Admin Access Restricted"
          description="Super Administrator role required to moderate textbook marketplace inventory."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const rawListings = responseData || [];
  const listings = searchQuery.trim()
    ? rawListings.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawListings;

  const filterChips = [
    { id: '', label: 'All Listings', count: rawListings.length },
    { id: 'pending', label: 'Needs Moderation', count: rawListings.filter((l) => l.status === 'pending').length },
    { id: 'active', label: 'Active Storefront', count: rawListings.filter((l) => l.status === 'active').length },
    { id: 'rejected', label: 'Rejected', count: rawListings.filter((l) => l.status === 'rejected').length },
  ];

  const columns: Column<AdminListing>[] = [
    {
      header: 'Textbook Details',
      cell: (l) => (
        <div className="font-sans">
          <p className="font-bold text-foreground line-clamp-1">{l.title}</p>
          <p className="text-[11px] text-muted-foreground">
            by <span className="text-foreground">{l.author}</span> • <span className="capitalize">{l.category}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Condition',
      cell: (l) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary/15 text-secondary border border-secondary/30">
          {(l.condition || 'good').replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Offer Price',
      cell: (l) => <span className="font-mono text-xs font-bold text-foreground">₹{l.price}</span>,
    },
    {
      header: 'Inventory',
      cell: (l) => (
        <span
          className={`font-mono text-xs font-bold ${
            l.stock === 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {l.stock} units
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (l) => {
        const badgeColors: Record<string, string> = {
          active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          rejected: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          sold: 'bg-muted text-muted-foreground border-border',
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              badgeColors[l.status] || 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {l.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (l) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => { setSelectedListing(l); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Inspect Listing"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedListing(l);
              setEditForm({
                title: l.title,
                price: l.price,
                stock: l.stock,
                status: l.status,
                condition: l.condition || 'good',
              });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit Parameters"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {l.status === 'pending' && (
            <button
              onClick={() => moderateMutation.mutate({ id: l.id, status: 'active' })}
              className="p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              title="Approve Listing"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          {l.status === 'pending' && (
            <button
              onClick={() => { setSelectedListing(l); setRejectModalOpen(true); }}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              title="Reject Listing"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => { setSelectedListing(l); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Soft Delete Listing"
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
        title="Listing & Moderation Queue"
        subtitle="Review student and bookstore submissions, approve verified conditions, and safeguard marketplace quality."
        badgeText="Storefront Moderation"
        stats={[
          { label: 'Total Catalog Items', value: rawListings.length, badge: 'Listings', isPositive: true },
          { label: 'Active Storefront', value: rawListings.filter((l) => l.status === 'active').length, badge: 'Live', isPositive: true },
          { label: 'Awaiting Review', value: rawListings.filter((l) => l.status === 'pending').length, badge: 'Queue', isPositive: false },
          { label: 'Flagged / Rejected', value: rawListings.filter((l) => l.status === 'rejected').length, badge: 'Rejections', isPositive: false },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search textbook title, author, or discipline..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <AdminEmptyState
          title="Failed to Load Inventory"
          description="Error querying textbook listings from the central database."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : (
        <AdminDataTable
          title="Marketplace Listings"
          subtitle="Review submitted textbook conditions and inventory"
          data={listings}
          columns={columns}
          searchField="title"
          searchPlaceholder="Search title, author..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW LISTING INSPECTOR SHEET */}
      {selectedListing && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedListing(null); }}
          size="sheet"
          title={selectedListing.title}
          subtitle={`by ${selectedListing.author}`}
          icon={<BookOpen className="h-5 w-5 text-secondary" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary border border-secondary/20">
              {selectedListing.status}
            </span>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                href={`/books/${selectedListing.slug || selectedListing.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
              >
                <span>View Storefront Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => { setViewModalOpen(false); setSelectedListing(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AdminStatBadge label="Offer Price" value={`₹${selectedListing.price}`} variant="default" />
              <AdminStatBadge label="Inventory" value={`${selectedListing.stock} Units`} variant={selectedListing.stock > 0 ? 'success' : 'danger'} />
              <AdminStatBadge label="Quality Grade" value={(selectedListing.condition || 'good').replace('_', ' ').toUpperCase()} variant="info" />
              <AdminStatBadge label="Store Status" value={selectedListing.status.toUpperCase()} variant={selectedListing.status === 'active' ? 'success' : 'warning'} />
            </div>

            {selectedListing.status === 'rejected' && selectedListing.rejectionReason && (
              <div className="p-4 bg-rose-500/12 border border-rose-500/25 rounded-2xl flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Moderator Rejection Feedback:</p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-1 leading-relaxed">&quot;{selectedListing.rejectionReason}&quot;</p>
                </div>
              </div>
            )}

            <AdminDetailSection title="Catalog Metadata" icon={<BookOpen className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <AdminDetailRow label="Textbook Title" value={selectedListing.title} />
                <AdminDetailRow label="Author / Writer" value={selectedListing.author} />
                <AdminDetailRow label="Academic Category" value={selectedListing.category} />
                <AdminDetailRow label="Catalog Slug" value={selectedListing.slug || 'N/A'} copyable />
              </div>
            </AdminDetailSection>

            <AdminDetailSection title="Seller Listing Parameters" icon={<Tag className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <AdminDetailRow label="Reported Condition" value={(selectedListing.condition || 'good').replace('_', ' ').toUpperCase()} />
                <AdminDetailRow label="Available Quantity" value={`${selectedListing.stock} in stock`} />
                <AdminDetailRow label="Seller Asking Price" value={`₹${selectedListing.price}`} />
              </div>
            </AdminDetailSection>
          </div>
        </AdminModal>
      )}

      {/* EDIT LISTING FORM MODAL */}
      {selectedListing && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedListing(null); }}
          size="md"
          title="Edit Listing Parameters"
          subtitle={`Adjusting parameters for ${selectedListing.title}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedListing(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-listing-form"
                disabled={editMutation.isPending}
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Listing</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-listing-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ id: selectedListing.id, data: editForm });
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Book Title *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Stock Units *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {/* REJECTION REASON DECISION MODAL */}
      {selectedListing && (
        <AdminDecisionModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Book Listing Submission"
          subtitle="Provide structured feedback so the seller can correct and re-submit."
          entityName={selectedListing.title}
          entityCategory={selectedListing.category}
          actionType="reject"
          isPending={moderateMutation.isPending}
          onConfirm={(reason) => {
            moderateMutation.mutate({ id: selectedListing.id, status: 'rejected', rejectionReason: reason });
          }}
        />
      )}

      {/* SOFT DELETE DANGER MODAL */}
      {selectedListing && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedListing(null); }}
          onConfirm={() => deleteMutation.mutate(selectedListing.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Soft Delete Listing"
          entityName={selectedListing.title}
          description={<span>Are you sure you want to remove listing <strong>{selectedListing.title}</strong>?</span>}
          impacts={[
            'The listing will be immediately removed from marketplace search and storefront.',
            'Available stock units will be set to 0.',
            'Existing customer orders containing this item will remain recorded in history.',
          ]}
          confirmText="Soft Delete Listing"
        />
      )}
    </AdminLayout>
  );
}
