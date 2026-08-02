'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { Star, ShieldAlert, Trash2, Eye, Pencil, X, Check } from 'lucide-react';

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
        <div className="text-center py-16 border border-border/80 bg-card rounded-3xl font-sans space-y-4 shadow-xl my-8">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You must have Administrative privileges to manage customer book reviews and ratings.
          </p>
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

  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const flaggedCount = reviews.filter((r) => r.status === 'flagged').length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const columns: Column<BookReview>[] = [
    {
      header: 'Book & Reviewer',
      cell: (r) => (
        <div className="font-sans">
          <p className="font-bold text-foreground text-xs sm:text-sm">{r.bookTitle}</p>
          <p className="text-[11px] text-muted-foreground font-medium">by {r.reviewerName} • {r.createdAt}</p>
        </div>
      ),
    },
    {
      header: 'Rating',
      cell: (r) => (
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Review Comment',
      cell: (r) => <p className="text-xs text-muted-foreground line-clamp-2 max-w-sm font-medium">{r.comment}</p>,
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            r.status === 'approved'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
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
        <div className="flex items-center justify-end space-x-2 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setViewModalOpen(true);
            }}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-xs"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Edit Review */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setEditForm({ rating: r.rating, comment: r.comment, status: r.status });
              setEditModalOpen(true);
            }}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-secondary transition-all active:scale-95 shadow-xs"
            title="Edit Review"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(r);
              setDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xs"
            title="Soft Delete / Remove Review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Brand Hero Section Header */}
      <AdminHero
        title="Book Reviews & Content Moderation"
        subtitle="Moderate student book reviews, verify buyer ratings, and purge spam comments across BookFry."
        badgeText="Community Trust & Safety"
        stats={[
          { label: "Total Reviews", value: reviews.length, badge: "Buyer Feedback", isPositive: true },
          { label: "Approved Reviews", value: approvedCount, badge: "Live Storefront", isPositive: true },
          { label: "Flagged / Spam", value: flaggedCount, badge: "Moderation Queue", isPositive: false },
          { label: "Average Score", value: `${avgRating} ★`, badge: "Platform Average", isPositive: true },
        ]}
      />

      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl font-sans">
        <AdminDataTable
          title="Student Book Reviews"
          subtitle="Verified customer feedback stream across India"
          data={reviews}
          columns={columns}
          searchField="bookTitle"
          searchPlaceholder="Search title or reviewer..."
        />
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Review Summary</h3>
                <p className="text-xs text-muted-foreground">Buyer feedback details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2">
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Book Title:</span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">{selectedReview.bookTitle}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Reviewer:</span>
                  <span className="text-foreground font-semibold">{selectedReview.reviewerName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Date:</span>
                  <span className="text-foreground font-mono">{selectedReview.createdAt}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Rating:</span>
                  <span className="font-bold text-amber-500">{selectedReview.rating} / 5 Stars</span>
                </p>
              </div>

              <div>
                <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1.5">Review Comment</p>
                <p className="p-4 bg-background border border-border/80 rounded-2xl text-foreground italic leading-relaxed text-xs">
                  &quot;{selectedReview.comment}&quot;
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 bg-[#F26522] text-white text-xs font-bold rounded-2xl hover:bg-[#D64E0F] transition-all shadow-sm active:scale-95"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Edit Review</h3>
                <p className="text-xs text-muted-foreground">Modify moderation status or text</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Star Rating (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Comment Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Moderation Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'approved' | 'flagged' })}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium"
                >
                  <option value="approved">Approved (Published)</option>
                  <option value="flagged">Flagged (Hidden / Moderation)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 border border-border/80 rounded-2xl text-muted-foreground hover:bg-muted font-bold active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl flex items-center space-x-1.5 active:scale-95 shadow-md shadow-[#F26522]/20"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Delete Review</h3>
                <p className="text-xs text-muted-foreground">Remove feedback from storefront</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this review for <span className="font-bold text-foreground">{selectedReview.bookTitle}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-border/80 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 active:scale-95 shadow-md shadow-rose-600/20"
              >
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
