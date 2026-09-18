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
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertOctagon,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Store,
  ImageIcon,
  History,
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
import Image from 'next/image';

interface AdminListing {
  id: string;
  title: string;
  slug: string;
  author: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  description?: string;
  catalogImages?: Array<{ url: string; publicId?: string }>;
  price: number;
  discountPrice?: number;
  stock: number;
  status: string;
  category: string;
  condition?: string;
  conditionNotes?: string;
  images?: Array<{ url: string; publicId?: string }>;
  city?: string;
  state?: string;
  pincode?: string;
  campusName?: string;
  rejectionReason?: string;
  moderationHistory?: Array<{ status: string; notes?: string; timestamp: string }>;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    storeName?: string;
    rating?: number;
    verificationStatus?: string;
  };
  createdAt?: string;
}

export default function AdminListingsPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

      {/* VIEW LISTING INSPECTOR WORKSPACE */}
      {selectedListing && (() => {
        const listingPhotos = (selectedListing.images || []).map((img) => ({
          url: img.url,
          label: 'Seller Condition Photo',
          source: 'seller' as const,
        }));
        const catalogPhotos = (selectedListing.catalogImages || []).map((img) => ({
          url: img.url,
          label: 'Official Catalog Cover',
          source: 'catalog' as const,
        }));
        const allMedia = [...listingPhotos, ...catalogPhotos];
        const activeMedia = allMedia[activeImageIndex] || allMedia[0] || null;

        return (
          <AdminModal
            isOpen={viewModalOpen}
            onClose={() => { setViewModalOpen(false); setSelectedListing(null); }}
            size="2xl"
            title={selectedListing.title}
            subtitle={`by ${selectedListing.author} • ${selectedListing.category}`}
            icon={<BookOpen className="h-5 w-5 text-secondary" />}
            badge={
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  selectedListing.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : selectedListing.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : selectedListing.status === 'rejected'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {selectedListing.status}
              </span>
            }
            headerActions={
              <div className="flex items-center gap-2">
                {selectedListing.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() =>
                      moderateMutation.mutate(
                        { id: selectedListing.id, status: 'active' },
                        {
                          onSuccess: () => {
                            setSelectedListing((prev) => prev ? { ...prev, status: 'active', rejectionReason: undefined } : null);
                          },
                        }
                      )
                    }
                    disabled={moderateMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                )}
                {selectedListing.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            }
            footer={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/books/${selectedListing.slug || selectedListing.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline"
                  >
                    <span>View Storefront Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setEditForm({
                        title: selectedListing.title,
                        price: selectedListing.price,
                        stock: selectedListing.stock,
                        status: selectedListing.status,
                        condition: selectedListing.condition || 'good',
                      });
                      setEditModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Quick Edit</span>
                  </button>
                </div>
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
              {/* Stat Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <AdminStatBadge label="Asking Price" value={`₹${selectedListing.price}`} variant="default" />
                <AdminStatBadge label="Stock Copies" value={`${selectedListing.stock} Units`} variant={selectedListing.stock > 0 ? 'success' : 'danger'} />
                <AdminStatBadge label="Condition Grade" value={(selectedListing.condition || 'good').replace('_', ' ').toUpperCase()} variant="info" />
                <AdminStatBadge label="Campus Node" value={selectedListing.campusName || selectedListing.city || 'National Delivery'} variant="default" />
              </div>

              {/* Rejection Alert */}
              {selectedListing.status === 'rejected' && selectedListing.rejectionReason && (
                <div className="p-4 bg-rose-500/12 border border-rose-500/25 rounded-2xl flex items-start gap-3">
                  <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Moderator Rejection Feedback:</p>
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">&quot;{selectedListing.rejectionReason}&quot;</p>
                  </div>
                </div>
              )}

              {/* 2-Column Split: Visual Photos Inspection (Left) + Seller & Metadata (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Media Gallery (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-border/80 bg-muted/30 flex items-center justify-center group shadow-inner">
                    {activeMedia ? (
                      <Image
                        src={activeMedia.url}
                        alt={selectedListing.title}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 350px"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mx-auto opacity-40" />
                        <p className="text-xs font-medium">No photos uploaded for this listing</p>
                      </div>
                    )}
                    {activeMedia && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          activeMedia.source === 'seller'
                            ? 'bg-amber-500 text-white'
                            : 'bg-secondary text-white'
                        }`}>
                          {activeMedia.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {allMedia.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {allMedia.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative h-14 w-11 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            activeImageIndex === idx ? 'border-secondary ring-2 ring-secondary/30 scale-105' : 'border-border/80 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image src={m.url} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Condition Notes Callout */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Seller Condition Notes &amp; Defect Notes
                    </span>
                    <p className="text-xs text-foreground font-medium italic leading-relaxed">
                      &quot;{selectedListing.conditionNotes || 'No specific condition defects reported by seller.'}&quot;
                    </p>
                  </div>
                </div>

                {/* Seller & Catalog Metadata (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  {/* Seller Identity Card */}
                  <AdminDetailSection title="Seller Identity & Accountability" icon={<Store className="h-4 w-4" />}>
                    <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2.5">
                      <AdminDetailRow
                        label="Store Name"
                        value={selectedListing.seller?.storeName || 'Independent Student Seller'}
                      />
                      <AdminDetailRow
                        label="Seller Contact"
                        value={selectedListing.seller?.name || selectedListing.sellerId}
                      />
                      <AdminDetailRow
                        label="Email Address"
                        value={selectedListing.seller?.email || 'N/A'}
                        copyable
                      />
                      {selectedListing.seller?.phone && (
                        <AdminDetailRow
                          label="Phone Number"
                          value={selectedListing.seller.phone}
                          copyable
                        />
                      )}
                      <AdminDetailRow
                        label="Campus / Location"
                        value={`${selectedListing.campusName || 'Main Campus'}${selectedListing.city ? ` • ${selectedListing.city}, ${selectedListing.state || ''} ${selectedListing.pincode || ''}` : ''}`}
                      />
                      <AdminDetailRow
                        label="Seller Verification"
                        value={
                          selectedListing.seller?.verificationStatus === 'approved'
                            ? 'VERIFIED CAMPUS SELLER'
                            : selectedListing.seller?.verificationStatus?.toUpperCase() || 'UNVERIFIED'
                        }
                      />
                    </div>
                  </AdminDetailSection>

                  {/* Catalog Metadata */}
                  <AdminDetailSection title="Book Catalog & Publishing Specs" icon={<BookOpen className="h-4 w-4" />}>
                    <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2.5">
                      <AdminDetailRow label="ISBN Code" value={selectedListing.isbn || 'N/A'} copyable />
                      <AdminDetailRow label="Publisher" value={selectedListing.publisher || 'N/A'} />
                      <AdminDetailRow label="Edition" value={selectedListing.edition || 'N/A'} />
                      <AdminDetailRow label="Category" value={selectedListing.category} />
                      {selectedListing.description && (
                        <div className="pt-2 border-t border-border/60">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                            Book Description
                          </span>
                          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                            {selectedListing.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </AdminDetailSection>

                  {/* Moderation History Audit Trail */}
                  {selectedListing.moderationHistory && selectedListing.moderationHistory.length > 0 && (
                    <AdminDetailSection title="Moderation Audit Trail" icon={<History className="h-4 w-4" />}>
                      <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                        {selectedListing.moderationHistory.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-border/40 last:border-0">
                            <div>
                              <span className="font-bold text-foreground uppercase tracking-wider">{item.status}</span>
                              {item.notes && <p className="text-muted-foreground text-[11px] mt-0.5">{item.notes}</p>}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AdminDetailSection>
                  )}
                </div>
              </div>
            </div>
          </AdminModal>
        );
      })()}

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
