'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Book } from '@bookmarket/types';
import {
  BookOpen,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Archive,
  Edit2,
  AlertOctagon,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerListingsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch seller's own listings
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['seller-listings', statusFilter],
    queryFn: () => apiClient(`/seller/listings?page=1&limit=100&status=${statusFilter}`),
    enabled: isAuthenticated,
  });

  // Mutation to archive listing
  const archiveMutation = useMutation({
    mutationFn: (bookId: string) =>
      apiClient(`/books/${bookId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'archived' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
      setSuccessMsg('Listing archived successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const handleArchive = (bookId: string) => {
    if (confirm('Are you sure you want to archive this listing? It will no longer be visible to buyers.')) {
      archiveMutation.mutate(bookId);
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-background-subtle text-text-muted border-border',
    pending: 'bg-warning/10 text-warning border-warning/20',
    active: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-danger/10 text-danger border-danger/20',
    archived: 'bg-text-muted/10 text-text-muted border-text-muted/20',
    sold: 'bg-brand/10 text-brand border-brand/20',
    removed: 'bg-danger/10 text-danger border-danger/20',
  };

  // Safe listings extraction
  const listings: Book[] = Array.isArray(responseData)
    ? responseData
    : responseData?.listings || [];

  // Filter listings locally by search query
  const filteredListings = listings.filter((listing) => {
    if (!searchTerm.trim()) return true;
    const titleMatch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const authorMatch = listing.author.toLowerCase().includes(searchTerm.toLowerCase());
    const isbnMatch = (listing.isbn || '').includes(searchTerm);
    return titleMatch || authorMatch || isbnMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <Link
          href="/seller/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Seller Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-brand" />
              <span>My Book Listings</span>
            </h1>
            <p className="text-text-secondary text-sm font-sans mt-1">
              View and manage listings, see approval statuses, and handle rejections.
            </p>
          </div>
          <Link
            href="/sell"
            className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Post a Book</span>
          </Link>
        </div>

        {/* Success toast message */}
        {successMsg && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-md text-success text-sm font-semibold flex items-center space-x-2 font-sans animate-scale">
            <CheckCircle2 className="h-5 w-5 animate-pulse" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-border bg-surface rounded-md font-sans">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search title, author, isbn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-brand"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Approved / Active</option>
              <option value="rejected">Rejected Listings</option>
              <option value="archived">Archived Listings</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Main listings list */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 border border-border bg-surface rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border border-border bg-surface rounded-md">
            <AlertOctagon className="h-12 w-12 text-danger mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
              Failed to load listings
            </h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold font-sans animate-pulse"
            >
              Retry
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md space-y-6">
            <BookOpen className="h-12 w-12 text-text-muted mx-auto" />
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">No listings found</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mt-2 font-sans">
                {searchTerm || statusFilter
                  ? 'No book matches your search query or filter criteria.'
                  : 'Start selling by posting your first textbook on the BookFry marketplace!'}
              </p>
            </div>
            {!searchTerm && !statusFilter && (
              <Link
                href="/sell"
                className="inline-flex px-5 py-2.5 bg-brand text-white font-bold rounded text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors"
              >
                Post Your First Book
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6 font-sans">
            {filteredListings.map((book) => (
              <div
                key={book.id}
                className="border border-border bg-surface rounded-md overflow-hidden p-6 space-y-4 shadow-sm relative transition-all hover:shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Book cover info */}
                  <div className="flex gap-4">
                    <div className="h-24 w-16 bg-background-subtle rounded border border-border overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.images?.[0]?.url || 'https://placehold.co/120x180/16523d/ffffff?text=Book'}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-text-primary text-base font-serif hover:text-brand leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-xs text-text-secondary font-medium">by {book.author}</p>
                      <div className="flex flex-wrap gap-2 pt-1.5 text-[10px] font-bold">
                        <span className="bg-background-subtle border border-border px-2 py-0.5 rounded text-text-secondary capitalize">
                          {book.condition.replace('_', ' ')}
                        </span>
                        <span className="bg-background-subtle border border-border px-2 py-0.5 rounded text-text-secondary">
                          Stock: {book.stock}
                        </span>
                        <span className="font-mono text-brand font-bold text-xs pl-1">
                          ₹{book.price.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 w-full md:w-auto md:shrink-0 justify-end md:self-stretch">
                    <span
                      className={`inline-flex items-center border px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[book.status] || 'bg-background-subtle text-text-secondary border-border'}`}
                    >
                      {book.status === 'active' ? 'Approved' : book.status === 'pending' ? 'Pending Review' : book.status}
                    </span>

                    <div className="flex items-center gap-2 mt-auto">
                      {/* View listing detail if active */}
                      {book.status === 'active' && (
                        <Link
                          href={`/books/${book.slug}`}
                          className="px-2.5 py-1.5 border border-border rounded text-text-secondary hover:text-brand text-xs font-semibold flex items-center space-x-1"
                          title="View detail page"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Listing</span>
                        </Link>
                      )}

                      {/* Edit option */}
                      {(book.status === 'rejected' || book.status === 'draft' || book.status === 'active') && (
                        <Link
                          href={`/sell?slug=${book.slug}`}
                          className="px-2.5 py-1.5 bg-brand/10 hover:bg-brand hover:text-white border border-brand/20 text-brand rounded text-xs font-bold flex items-center space-x-1 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{book.status === 'rejected' ? 'Edit & Resubmit' : 'Edit Listing'}</span>
                        </Link>
                      )}

                      {/* Archive Listing */}
                      {book.status !== 'archived' && book.status !== 'sold' && book.status !== 'removed' && (
                        <button
                          onClick={() => handleArchive(book.id)}
                          className="px-2.5 py-1.5 border border-danger/20 hover:bg-danger hover:text-white text-danger rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          <span>Archive</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Alert Callout */}
                {book.status === 'rejected' && book.rejectionReason && (
                  <div className="mt-4 p-4 border border-danger/20 bg-danger/5 rounded-md flex items-start gap-3 animate-scale">
                    <AlertOctagon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-danger">Listing Rejected by Moderator</p>
                      <p className="text-text-primary font-medium leading-relaxed italic">
                        &quot;{book.rejectionReason}&quot;
                      </p>
                      <p className="text-text-secondary text-[10px] pt-1">
                        Please review the reason, make updates to your listing using the <strong>Edit & Resubmit</strong> button above, and post it for re-moderation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
