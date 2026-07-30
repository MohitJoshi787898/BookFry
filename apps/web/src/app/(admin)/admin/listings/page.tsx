'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
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
  X,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
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
  const [rejectBookId, setRejectBookId] = useState<string | null>(null);
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
      setRejectBookId(null);
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

  const handleRejectClick = (id: string) => {
    setRejectBookId(id);
    setRejectionReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Please provide a reason for rejecting this listing');
      return;
    }
    if (rejectBookId) {
      moderateMutation.mutate({
        id: rejectBookId,
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      });
    }
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
                handleRejectClick(b.id);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-brand" />
            <span>Book Catalog Moderation</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Approve, reject, or flag seller submitted book titles across India.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-brand"
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

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <BookOpen className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Listing Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">Listing ID:</span> <span className="font-mono text-text-primary">{selectedListing.id}</span></p>
                <p><span className="font-bold text-text-muted">Book Title:</span> <span className="font-bold text-text-primary">{selectedListing.title}</span></p>
                <p><span className="font-bold text-text-muted">Author:</span> <span className="text-text-primary">{selectedListing.author}</span></p>
                <p><span className="font-bold text-text-muted">Category:</span> <span className="capitalize text-text-primary">{selectedListing.category}</span></p>
                <p><span className="font-bold text-text-muted">Price:</span> <span className="font-mono font-bold text-brand">₹{selectedListing.price}</span></p>
                <p><span className="font-bold text-text-muted">Stock Copies:</span> <span className="font-mono font-bold">{selectedListing.stock}</span></p>
                <p><span className="font-bold text-text-muted">Status:</span> <span className="uppercase font-bold text-accent">{selectedListing.status}</span></p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-4">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LISTING MODAL */}
      {editModalOpen && selectedListing && (
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
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Listing Details</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate({ id: selectedListing.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Listing Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                  <option value="removed">Removed (Soft Deleted)</option>
                </select>
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
                  disabled={editMutation.isPending}
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90 flex items-center space-x-1"
                >
                  {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Soft Delete Listing</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to soft delete <span className="font-bold text-text-primary">{selectedListing.title}</span>? Its status will be updated to <span className="font-bold text-danger">removed</span>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedListing.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {deleteMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Soft Delete Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in font-sans p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full shadow-2xl p-6 relative animate-scale">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <AlertOctagon className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Provide Rejection Reason</h3>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-4">
              {rejectError && (
                <p className="text-xs font-semibold text-danger bg-danger/10 border border-danger/20 p-2 rounded">
                  {rejectError}
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  Reason for rejection <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (e.target.value.trim()) setRejectError(null);
                  }}
                  placeholder="e.g. Inappropriate images, incorrect price, incomplete description, or fake ISBN..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-danger focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={moderateMutation.isPending}
                  className="px-5 py-2 bg-danger hover:bg-danger-hover text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1"
                >
                  {moderateMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                  <span>Reject Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
