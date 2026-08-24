'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { Star, ShieldAlert, Trash2, Eye, Pencil, Check } from 'lucide-react';
import {
  AdminDialog,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';

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

      {/* VIEW REVIEW DETAILS MODAL */}
      {selectedReview && (
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedReview(null);
          }}
          size="md"
          title={`Review for ${selectedReview.bookTitle}`}
          subtitle={`By ${selectedReview.reviewerName} • ${selectedReview.createdAt}`}
          icon={<Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
          badge={
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                selectedReview.status === 'approved'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-warning/10 text-warning border border-warning/20'
              }`}
            >
              {selectedReview.status}
            </span>
          }
          headerActions={
            <button
              onClick={() => {
                setViewModalOpen(false);
                setEditForm({
                  rating: selectedReview.rating,
                  comment: selectedReview.comment,
                  status: selectedReview.status,
                });
                setEditModalOpen(true);
              }}
              className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold mr-2"
              title="Edit Review"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted">
                Rating: <span className="font-bold text-amber-500">{selectedReview.rating} / 5 Stars</span>
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedReview(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close Summary
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Stat Badges */}
            <div className="grid grid-cols-2 gap-3">
              <AdminStatBadge
                label="Customer Rating"
                value={`${selectedReview.rating} / 5 Stars`}
                variant="default"
              />
              <AdminStatBadge
                label="Moderation State"
                value={selectedReview.status.toUpperCase()}
                variant={selectedReview.status === 'approved' ? 'success' : 'warning'}
              />
            </div>

            {/* Information Rows */}
            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
              <AdminDetailRow label="Target Book" value={selectedReview.bookTitle} />
              <AdminDetailRow label="Reviewer Name" value={selectedReview.reviewerName} />
              <AdminDetailRow label="Submission Date" value={selectedReview.createdAt} />
              <AdminDetailRow label="Review ID" value={selectedReview.id} copyable />
            </div>

            {/* Comment Body */}
            <div>
              <p className="font-bold text-text-muted uppercase text-[11px] tracking-wider mb-1.5">
                Review Feedback & Commentary
              </p>
              <div className="p-4 bg-background border border-border rounded-2xl text-text-primary italic leading-relaxed text-xs">
                &quot;{selectedReview.comment}&quot;
              </div>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* EDIT REVIEW FORM MODAL */}
      {selectedReview && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedReview(null);
          }}
          size="md"
          title="Edit Customer Review"
          subtitle={`Adjusting moderation status or comment text`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-review-form"
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          }
        >
          <form id="edit-review-form" onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Star Rating (1 to 5 Stars) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Commentary & Feedback <span className="text-danger">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                className="w-full p-3 border border-border rounded-xl bg-background text-text-primary text-xs leading-relaxed focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Moderation Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'approved' | 'flagged' })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
              >
                <option value="approved">Approved (Publicly Displayed on Marketplace)</option>
                <option value="flagged">Flagged (Hidden Pending Review)</option>
              </select>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* DELETE REVIEW DANGER DIALOG */}
      {selectedReview && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedReview(null);
          }}
          onConfirm={() => handleDeleteReview(selectedReview.id)}
          title="Confirm Delete Review"
          entityName={`Review by ${selectedReview.reviewerName}`}
          description={
            <span>
              Are you sure you want to remove this review for{' '}
              <strong>{selectedReview.bookTitle}</strong>?
            </span>
          }
          impacts={[
            'The review will be permanently deleted from the marketplace storefront.',
            "The book's aggregate rating will be automatically recalculated.",
          ]}
          confirmText="Delete Review"
        />
      )}
    </AdminLayout>
  );
}
