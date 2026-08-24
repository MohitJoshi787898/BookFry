'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  BookOpen,
  ShieldAlert,
  EyeOff,
  CheckCircle,
  ExternalLink,
  Filter,
  AlertOctagon,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  AdminDialog,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';
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
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    price: 0,
    stock: 0,
    status: 'active',
    condition: 'good',
  });

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminListing[]>({
    queryKey: ['admin-listings', page, statusFilter],
    queryFn: () =>
      apiClient(`/admin/listings?page=${page}&limit=100&status=${statusFilter}`),
    enabled: isAuthenticated && isAdmin,
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: string;
      rejectionReason?: string;
    }) =>
      apiClient(`/admin/listings/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setRejectModalOpen(false);
      setRejectionReason('');
      setRejectError(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setEditModalOpen(false);
      setSelectedListing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/listings/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setDeleteModalOpen(false);
      setSelectedListing(null);
    },
  });

  const handleApprove = (id: string) => {
    moderateMutation.mutate({ id, status: 'active' });
  };

  const handleRejectClick = (listing: AdminListing) => {
    setSelectedListing(listing);
    setRejectionReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const listings = responseData || [];

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

  const columns: Column<AdminListing>[] = [
    {
      header: 'Book Title & Author',
      cell: (b) => (
        <div className="font-sans">
          <Link
            href={`/books/${b.slug}`}
            target="_blank"
            className="font-bold text-text-primary hover:text-brand transition-colors inline-flex items-center space-x-1"
          >
            <span>{b.title}</span>
            <ExternalLink className="h-3 w-3 text-text-muted shrink-0" />
          </Link>
          <p className="text-[11px] text-text-muted font-medium">by {b.author}</p>
          {b.status === 'rejected' && b.rejectionReason && (
            <p className="text-[10px] text-danger font-medium mt-1">
              Rejection Reason: {b.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (b) => (
        <span className="text-xs font-semibold text-text-secondary capitalize">
          {b.category ? b.category.replace('-', ' ') : 'General'}
        </span>
      ),
    },
    {
      header: 'Price',
      cell: (b) => (
        <span className="font-bold font-mono text-text-primary">₹{b.price.toFixed(0)}</span>
      ),
    },
    {
      header: 'Stock',
      cell: (b) => (
        <span className={`font-mono font-bold ${b.stock > 0 ? 'text-text-primary' : 'text-danger'}`}>
          {b.stock} copies
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (b) => {
        let badgeColor = 'bg-warning/10 text-warning border-warning/20';
        if (b.status === 'active') badgeColor = 'bg-success/10 text-success border border-success/20';
        if (b.status === 'rejected' || b.status === 'removed') badgeColor = 'bg-danger/10 text-danger border border-danger/20';
        if (b.status === 'archived') badgeColor = 'bg-text-muted/10 text-text-muted border border-text-muted/20';
        if (b.status === 'draft') badgeColor = 'bg-background-subtle text-text-secondary border border-border';

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}
          >
            {b.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (b) => (
        <div className="flex items-center justify-end gap-1.5 font-sans">
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedListing(b);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Listing Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Listing Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedListing(b);
              setEditForm({
                title: b.title,
                price: b.price,
                stock: b.stock,
                status: b.status,
                condition: b.condition || 'good',
              });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Listing"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Moderate Approve */}
          {b.status !== 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(b.id);
              }}
              disabled={moderateMutation.isPending}
              className="p-1.5 text-xs font-bold rounded bg-success hover:bg-success/90 text-white flex items-center shadow-sm transition-all"
              title="Approve Listing"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Moderate Reject */}
          {b.status !== 'rejected' && b.status !== 'archived' && b.status !== 'removed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRejectClick(b);
              }}
              disabled={moderateMutation.isPending}
              className="p-1.5 text-xs font-bold rounded bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20 flex items-center transition-all"
              title="Reject Listing"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Soft Delete Listing Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedListing(b);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
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
      {/* Hero Header */}
      <AdminHero
        title="Book Catalog Moderation"
        subtitle="Approve, reject, or flag seller submitted book titles across India."
        badgeText="Catalog Quality Control"
        stats={[
          { label: "Total Titles", value: listings.length, badge: "Catalog Size", isPositive: true },
          { label: "Pending Review", value: listings.filter((l) => l.status === "pending").length, badge: "Moderation Queue", isPositive: false },
          { label: "Approved Active", value: listings.filter((l) => l.status === "active").length, badge: "Live Storefront", isPositive: true },
          { label: "Rejected/Flagged", value: listings.filter((l) => l.status === "rejected").length, badge: "Quality Filter", isPositive: false },
        ]}
      />

      {/* Filter Dropdown Row */}
      <div className="flex items-center justify-between pb-4 font-sans">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-secondary" />
          <span className="text-xs font-bold text-muted-foreground">Filter Queue:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-xs font-bold border border-border/80 rounded-2xl bg-card text-foreground focus:ring-2 focus:ring-secondary/40 shadow-sm"
          >
            <option value="">All Catalog Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="active">Approved / Active</option>
            <option value="rejected">Rejected Listings</option>
            <option value="archived">Archived Listings</option>
            <option value="draft">Drafts</option>
            <option value="removed">Removed / Deleted</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      {isError ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load administrative listings catalog.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry Catalog Fetch
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Submitted Book Listings"
          subtitle="Real-time moderation portal"
          data={listings}
          columns={columns}
          searchField="title"
          searchPlaceholder="Search title or author..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW LISTING DETAILS MODAL */}
      {selectedListing && (
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedListing(null);
          }}
          size="xl"
          title={selectedListing.title}
          subtitle={`Listing ID: ${selectedListing.id}`}
          icon={<BookOpen className="h-5 w-5 text-secondary" />}
          badge={
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                selectedListing.status === 'active'
                  ? 'bg-success/10 text-success border border-success/25'
                  : selectedListing.status === 'rejected'
                  ? 'bg-danger/10 text-danger border border-danger/25'
                  : 'bg-warning/10 text-warning border border-warning/25'
              }`}
            >
              {selectedListing.status}
            </span>
          }
          headerActions={
            <div className="flex items-center gap-1.5 mr-2">
              {selectedListing.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      moderateMutation.mutate({
                        id: selectedListing.id,
                        status: 'active',
                      });
                      setViewModalOpen(false);
                      setSelectedListing(null);
                    }}
                    className="p-1.5 bg-success/10 hover:bg-success/20 text-success rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                    title="Approve Listing"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      setRejectModalOpen(true);
                    }}
                    className="p-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                    title="Reject Listing"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              <Link
                href={`/books/${selectedListing.slug || selectedListing.id}`}
                target="_blank"
                className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                title="View on Public Marketplace"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted font-mono">
                Category: <span className="capitalize font-bold text-text-primary">{selectedListing.category}</span>
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedListing(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close Details
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AdminStatBadge
                label="Offer Price"
                value={`₹${selectedListing.price}`}
                variant="default"
              />
              <AdminStatBadge
                label="Available Stock"
                value={`${selectedListing.stock} Copies`}
                variant={selectedListing.stock > 0 ? 'success' : 'danger'}
              />
              <AdminStatBadge
                label="Book Condition"
                value={(selectedListing.condition || 'good').replace('_', ' ').toUpperCase()}
                variant="info"
              />
              <AdminStatBadge
                label="Status"
                value={selectedListing.status.toUpperCase()}
                variant={
                  selectedListing.status === 'active'
                    ? 'success'
                    : selectedListing.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
              />
            </div>

            {/* Rejection Alert Banner if rejected */}
            {selectedListing.status === 'rejected' && selectedListing.rejectionReason && (
              <div className="p-3.5 bg-danger/10 border border-danger/25 rounded-2xl flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-danger uppercase tracking-wider">
                    Moderator Rejection Reason:
                  </p>
                  <p className="text-xs text-danger font-medium mt-0.5">
                    &quot;{selectedListing.rejectionReason}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Catalog & Listing Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminDetailSection
                title="Catalog Information"
                icon={<BookOpen className="h-4 w-4" />}
                className="bg-muted/30 p-4 rounded-2xl border border-border"
              >
                <div className="space-y-2">
                  <AdminDetailRow label="Book Title" value={selectedListing.title} />
                  <AdminDetailRow label="Author" value={selectedListing.author} />
                  <AdminDetailRow label="Category" value={selectedListing.category} />
                  <AdminDetailRow label="Slug" value={selectedListing.slug || 'N/A'} copyable />
                </div>
              </AdminDetailSection>

              <AdminDetailSection
                title="Seller Listing Parameters"
                icon={<Tag className="h-4 w-4" />}
                className="bg-muted/30 p-4 rounded-2xl border border-border"
              >
                <div className="space-y-2">
                  <AdminDetailRow
                    label="Condition"
                    value={(selectedListing.condition || 'good').replace('_', ' ').toUpperCase()}
                  />
                  <AdminDetailRow label="Stock Count" value={`${selectedListing.stock} in stock`} />
                  <AdminDetailRow label="Unit Price" value={`₹${selectedListing.price}`} />
                  <AdminDetailRow label="Listing ID" value={selectedListing.id} copyable />
                </div>
              </AdminDetailSection>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* EDIT LISTING FORM MODAL */}
      {selectedListing && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedListing(null);
          }}
          size="md"
          title="Edit Listing Details"
          subtitle={`Adjusting listing parameters for ${selectedListing.title}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedListing(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-listing-form"
                disabled={editMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Book Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Price (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Stock Units <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Moderation & Listing Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
              >
                <option value="pending">Pending Review</option>
                <option value="active">Active (Published on Storefront)</option>
                <option value="rejected">Rejected (Flagged by Admin)</option>
                <option value="archived">Archived</option>
                <option value="removed">Removed (Soft Deleted)</option>
              </select>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* SOFT DELETE DANGER DIALOG */}
      {selectedListing && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedListing(null);
          }}
          onConfirm={() => deleteMutation.mutate(selectedListing.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Soft Delete Listing"
          entityName={selectedListing.title}
          description={
            <span>
              Are you sure you want to remove listing <strong>{selectedListing.title}</strong> from
              the marketplace?
            </span>
          }
          impacts={[
            'The listing will be immediately delisted from search, category pages, and home carousels.',
            'Customers who currently have this item in their cart will be alerted that stock is unavailable.',
            'The seller will receive a status notification update in their seller inventory dashboard.',
            'Listing record will remain in the operational archive and can be restored if necessary.',
          ]}
          confirmText="Soft Delete Listing"
        />
      )}

      {/* REJECTION REASON PRESET DANGER DIALOG */}
      {selectedListing && (
        <AdminDangerDialog
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setRejectionReason('');
            setRejectError(null);
          }}
          onConfirm={() => {
            if (!rejectionReason.trim()) {
              setRejectError('Please select or specify a valid reason for rejection.');
              return;
            }
            moderateMutation.mutate({
              id: selectedListing.id,
              status: 'rejected',
              rejectionReason,
            });
            setRejectModalOpen(false);
            setRejectionReason('');
          }}
          isPending={moderateMutation.isPending}
          title="Reject Book Listing"
          entityName={selectedListing.title}
          description={
            <span>
              Rejecting this listing will decline seller submission for{' '}
              <strong>{selectedListing.title}</strong> and send an automated explanation.
            </span>
          }
          impacts={[
            'Listing status will transition to "Rejected".',
            'Listing will not appear in the marketplace catalog.',
            'The seller will be notified with your rejection explanation to correct and re-submit.',
          ]}
          reasonPrompt={{
            label: 'Explanation / Rejection Reason',
            placeholder: 'Choose a preset below or type custom feedback for the seller...',
            value: rejectionReason,
            onChange: (val) => {
              setRejectionReason(val);
              if (val.trim()) setRejectError(null);
            },
            required: true,
            error: rejectError,
          }}
          confirmText="Decline & Reject Listing"
        />
      )}
    </AdminLayout>
  );
}
