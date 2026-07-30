'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { Star, ShieldAlert, Trash2, Eye, Pencil, X } from 'lucide-react';

interface BookReview {
  id: string;
  bookTitle: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'approved' | 'flagged';
}

const mockReviews: BookReview[] = [
  {
    id: '1',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    reviewerName: 'Priya Sharma',
    rating: 5,
    comment: 'Book came in great condition! Highlighting was minimal and page binding was intact.',
    createdAt: '2026-07-18',
    status: 'approved',
  },
  {
    id: '2',
    bookTitle: 'BD Chaurasia Human Anatomy',
    reviewerName: 'Ananya Roy',
    rating: 5,
    comment: 'Essential for 1st year MBBS. Fast campus delivery in New Delhi!',
    createdAt: '2026-07-15',
    status: 'approved',
  },
  {
    id: '3',
    bookTitle: 'UPSC Indian Polity (Laxmikanth)',
    reviewerName: 'Rahul Verma',
    rating: 4,
    comment: 'Slightly worn cover but complete pages. Good value for money.',
    createdAt: '2026-07-10',
    status: 'approved',
  },
];

export default function AdminReviewsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [reviews, setReviews] = useState<BookReview[]>(mockReviews);

  // Modals state
  const [selectedReview, setSelectedReview] = useState<BookReview | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
    status: 'approved' as 'approved' | 'flagged',
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



  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id
          ? { ...r, rating: editForm.rating, comment: editForm.comment, status: editForm.status }
          : r
      )
    );
    setEditModalOpen(false);
    setSelectedReview(null);
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
    setDeleteModalOpen(false);
    setSelectedReview(null);
  };

  const columns: Column<BookReview>[] = [
    {
      header: 'Book & Reviewer',
      cell: (r) => (
        <div className="font-sans">
          <p className="font-bold text-text-primary">{r.bookTitle}</p>
          <p className="text-[11px] text-text-muted">by {r.reviewerName} • {r.createdAt}</p>
        </div>
      ),
    },
    {
      header: 'Rating',
      cell: (r) => (
        <div className="flex items-center space-x-1 text-accent">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-accent text-accent' : 'text-text-muted'}`}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Review Comment',
      cell: (r) => <p className="text-xs text-text-secondary line-clamp-2 max-w-sm">{r.comment}</p>,
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            r.status === 'approved'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Review */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setEditForm({ rating: r.rating, comment: r.comment, status: r.status });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Review"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
            title="Soft Delete / Remove Review"
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
            <Star className="h-7 w-7 text-brand" />
            <span>Book Reviews & Content Moderation</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Moderate student book reviews, verify customer ratings, and purge spam comments.
          </p>
        </div>
      </div>

      <AdminDataTable
        title="Student Book Reviews"
        subtitle="Verified buyer feedback stream"
        data={reviews}
        columns={columns}
        searchField="bookTitle"
        searchPlaceholder="Search title or reviewer..."
      />

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Star className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Review Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">Book:</span> <span className="font-bold text-text-primary">{selectedReview.bookTitle}</span></p>
                <p><span className="font-bold text-text-muted">Reviewer:</span> <span className="text-text-primary">{selectedReview.reviewerName}</span></p>
                <p><span className="font-bold text-text-muted">Date:</span> <span className="text-text-primary">{selectedReview.createdAt}</span></p>
                <p><span className="font-bold text-text-muted">Rating:</span> <span className="font-bold text-accent">{selectedReview.rating} / 5 Stars</span></p>
              </div>

              <div>
                <p className="font-bold text-text-muted uppercase text-[10px] mb-1">Comment Text</p>
                <p className="p-3 bg-surface border border-border rounded-lg text-text-primary italic">&quot;{selectedReview.comment}&quot;</p>
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

      {/* EDIT REVIEW MODAL */}
      {editModalOpen && selectedReview && (
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
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Review</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Star Rating (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Comment Text</label>
                <textarea
                  rows={4}
                  required
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'approved' | 'flagged' })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                >
                  <option value="approved">Approved</option>
                  <option value="flagged">Flagged</option>
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
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Delete Review</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to soft delete/remove this review for <span className="font-bold text-text-primary">{selectedReview.bookTitle}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
