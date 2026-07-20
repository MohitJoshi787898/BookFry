'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { BookOpen, ShieldAlert, EyeOff, CheckCircle, ExternalLink, Filter } from 'lucide-react';
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
}

export default function AdminListingsPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data: AdminListing[]; meta: { page: number; limit: number; total: number; pages: number } }>({
    queryKey: ['admin-listings', page, statusFilter],
    queryFn: () =>
      apiClient(`/admin/listings?page=${page}&limit=15&status=${statusFilter}`),
    enabled: isAuthenticated && isAdmin,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient(`/admin/listings/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    },
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'removed' ? 'active' : 'removed';
    moderateMutation.mutate({ id, status: nextStatus });
  };

  const listings = responseData?.data || [];

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
      cell: (b) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            b.status === 'active'
              ? 'bg-success/10 text-success border border-success/20'
              : b.status === 'removed'
              ? 'bg-danger/10 text-danger border border-danger/20'
              : 'bg-warning/10 text-warning border border-warning/20'
          }`}
        >
          {b.status}
        </span>
      ),
    },
    {
      header: 'Moderation Action',
      className: 'text-right',
      cell: (b) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(b.id, b.status);
          }}
          disabled={moderateMutation.isPending}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1 ml-auto transition-all shadow-sm ${
            b.status === 'removed'
              ? 'bg-success hover:bg-success/90 text-white'
              : 'bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20'
          }`}
        >
          {b.status === 'removed' ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Approve / Restore</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Reject / Flag</span>
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
            <option value="active">Active Books</option>
            <option value="removed">Removed / Flagged</option>
            <option value="draft">Drafts</option>
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
    </AdminLayout>
  );
}
