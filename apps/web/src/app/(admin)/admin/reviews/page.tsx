'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { Star, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

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

  const handleToggleStatus = (id: string) => {
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, status: r.status === 'approved' ? 'flagged' : 'approved' } : r
      )
    );
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(r.id);
          }}
          className={`px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 ml-auto transition-all ${
            r.status === 'approved'
              ? 'bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20'
              : 'bg-success hover:bg-success/90 text-white'
          }`}
        >
          {r.status === 'approved' ? (
            <>
              <Trash2 className="h-3 w-3" />
              <span>Flag Review</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>Approve Review</span>
            </>
          )}
        </button>
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
    </AdminLayout>
  );
}
