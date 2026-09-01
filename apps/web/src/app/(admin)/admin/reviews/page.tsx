'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { Star, Eye, Pencil, Trash2, MessageSquare, Flag, CheckCircle2 } from 'lucide-react';
import {
  AdminModal,
  AdminDetailRow,
  AdminStatBadge,
  AdminDetailSection,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to moderate student reviews."
          mascotVariant="reading"
        />
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

  const handleDelete = () => {
    if (!selectedReview) return;
    setReviews(reviews.filter((r) => r.id !== selectedReview.id));
    setDeleteModalOpen(false);
    setSelectedReview(null);
  };

  const handleQuickStatus = (review: BookReview, newStatus: 'approved' | 'flagged') => {
    setReviews(
      reviews.map((r) =>
        r.id === review.id ? { ...r, status: newStatus } : r
      )
    );
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !searchQuery.trim() ||
      r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterChips = [
    { id: '', label: 'All Reviews', count: reviews.length },
    { id: 'approved', label: 'Approved Feedback', count: reviews.filter((r) => r.status === 'approved').length },
    { id: 'flagged', label: 'Flagged for Review', count: reviews.filter((r) => r.status === 'flagged').length },
  ];

  const columns: Column<BookReview>[] = [
    {
      header: 'Textbook & Reviewer',
      cell: (r) => (
        <div className="font-sans">
          <p className="font-bold text-foreground line-clamp-1">{r.bookTitle}</p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Student: <span className="font-semibold text-foreground">{r.reviewerName}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Student Rating',
      cell: (r) => (
        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{r.rating}.0 / 5.0</span>
        </div>
      ),
    },
    {
      header: 'Commentary Snippet',
      cell: (r) => (
        <p className="text-xs text-muted-foreground font-sans line-clamp-1 max-w-sm">
          &quot;{r.comment}&quot;
        </p>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            r.status === 'approved'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
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
          <button
            onClick={() => { setSelectedReview(r); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Full Review"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedReview(r);
              setEditForm({ rating: r.rating, comment: r.comment, status: r.status });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit / Moderate"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {r.status === 'flagged' ? (
            <button
              onClick={() => handleQuickStatus(r, 'approved')}
              className="p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              title="Approve Review"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleQuickStatus(r, 'flagged')}
              className="p-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              title="Flag Review"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => { setSelectedReview(r); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Delete Review"
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
        title="Student Reviews & Feedback"
        subtitle="Ensure authentic peer book ratings, moderate reported feedback, and maintain trusted campus testimonials."
        badgeText="Community Trust"
        stats={[
          { label: 'Total Reviews', value: reviews.length, badge: 'Ratings', isPositive: true },
          { label: 'Approved Feedback', value: reviews.filter((r) => r.status === 'approved').length, badge: 'Live', isPositive: true },
          { label: 'Flagged for Review', value: reviews.filter((r) => r.status === 'flagged').length, badge: 'Queue', isPositive: false },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search textbook title, reviewer name, or keywords..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      <AdminDataTable
        title="Verified Student Book Reviews"
        subtitle="Peer feedback submitted after confirmed orders"
        data={filteredReviews}
        columns={columns}
        searchField="bookTitle"
        searchPlaceholder="Search review title..."
      />

      {/* VIEW REVIEW DETAILS MODAL */}
      {selectedReview && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedReview(null); }}
          size="md"
          title={selectedReview.bookTitle}
          subtitle={`Reviewed by ${selectedReview.reviewerName}`}
          icon={<MessageSquare className="h-5 w-5 text-secondary" />}
          badge={
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                selectedReview.status === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {selectedReview.status}
            </span>
          }
          footer={
            <div className="flex items-center justify-end w-full">
              <button
                onClick={() => { setViewModalOpen(false); setSelectedReview(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 font-sans">
            <div className="grid grid-cols-2 gap-3">
              <AdminStatBadge
                label="Student Rating"
                value={`${selectedReview.rating}.0 / 5.0`}
                variant="warning"
              />
              <AdminStatBadge
                label="Trust Score"
                value="Verified Buyer"
                variant="success"
              />
            </div>

            <AdminDetailSection title="Review Content" icon={<MessageSquare className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <p className="text-xs text-foreground leading-relaxed font-medium bg-card p-3 rounded-xl border border-border/70">
                  &quot;{selectedReview.comment}&quot;
                </p>
                <div className="pt-2">
                  <AdminDetailRow label="Review Date" value={selectedReview.createdAt} />
                  <AdminDetailRow label="Reviewer Name" value={selectedReview.reviewerName} />
                </div>
              </div>
            </AdminDetailSection>
          </div>
        </AdminModal>
      )}

      {/* EDIT / MODERATE REVIEW MODAL */}
      {selectedReview && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedReview(null); }}
          size="md"
          title="Moderate Review Entry"
          subtitle={`Adjust feedback for ${selectedReview.bookTitle}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedReview(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-review-form"
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Save Review
              </button>
            </div>
          }
        >
          <form id="edit-review-form" onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Rating (1 to 5 Stars) *</label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={editForm.rating}
                onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Review Comment *</label>
              <textarea
                rows={3}
                required
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Moderation Status *</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'approved' | 'flagged' })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              >
                <option value="approved">Approved &amp; Visible on Storefront</option>
                <option value="flagged">Flagged / Hidden for Inspection</option>
              </select>
            </div>
          </form>
        </AdminModal>
      )}

      {/* DELETE DANGER MODAL */}
      {selectedReview && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedReview(null); }}
          onConfirm={handleDelete}
          title="Confirm Delete Review"
          entityName={`Review on "${selectedReview.bookTitle}"`}
          description={<span>Are you sure you want to permanently delete this student review by <strong>{selectedReview.reviewerName}</strong>?</span>}
          impacts={[
            'The review score will be removed from the book average rating calculation.',
            'This action cannot be undone.',
          ]}
          confirmText="Delete Review Entry"
        />
      )}
    </AdminLayout>
  );
}
