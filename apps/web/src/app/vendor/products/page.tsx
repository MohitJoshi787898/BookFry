'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorLayout } from '@/components/vendor/vendor-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { RoleFilterBar } from '@/components/shared/role-filter-bar';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { AdminDialog } from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Book } from '@bookmarket/types';
import {
  PlusCircle,
  ExternalLink,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function VendorProductsPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', price: 0, stock: 10, condition: 'new' });

  const {
    data: listingsRaw,
    isError,
    refetch,
  } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['vendor-products-page', statusFilter],
    queryFn: () => apiClient(`/seller/listings?page=1&limit=100&status=${statusFilter}`),
    enabled: isAuthenticated,
  });

  const listings: Book[] = Array.isArray(listingsRaw)
    ? listingsRaw
    : listingsRaw?.listings || [];

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products-page'] });
      setEditModalOpen(false);
      setSelectedBook(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/books/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products-page'] });
      setDeleteModalOpen(false);
      setSelectedBook(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <VendorLayout>
        <RoleEmptyState
          title="Sign In to Manage Commercial Products"
          description="View, edit, and restock your merchant book catalog."
          mascotVariant="reading"
        />
      </VendorLayout>
    );
  }

  const rawListings = listings || [];
  const filteredListings = rawListings.filter((b) => {
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterChips = [
    { id: '', label: 'All SKUs', count: rawListings.length },
    { id: 'active', label: 'Active Live', count: rawListings.filter((b) => b.status === 'active').length },
    { id: 'pending', label: 'Pending Review', count: rawListings.filter((b) => b.status === 'pending').length },
    { id: 'archived', label: 'Archived', count: rawListings.filter((b) => b.status === 'archived').length },
  ];

  return (
    <VendorLayout>
      <RoleHero
        title="Commercial Products Catalog &amp; SKUs"
        subtitle="Manage new and publisher-verified textbook editions, adjust wholesale pricing, and track SKU inventory."
        badgeText="Merchant Catalog Control"
        stats={[
          { label: 'Total SKUs', value: rawListings.length, badge: 'Titles', isPositive: true },
          { label: 'Active Live', value: rawListings.filter((b) => b.status === 'active').length, badge: 'Live on Store', isPositive: true },
          { label: 'Total Units', value: rawListings.reduce((sum, b) => sum + (b.stock || 1), 0), badge: 'Warehouse Stock', isPositive: true },
          { label: 'Catalog Status', value: 'Verified', badge: 'Published', isPositive: true },
        ]}
        actions={
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-wider shadow-md shadow-secondary/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New SKU</span>
          </Link>
        }
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search product SKU, title, or author..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Catalog Fetch Error"
          description="Failed to load your merchant products."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredListings.length === 0 ? (
        <RoleEmptyState
          title="No Products Found"
          description={searchQuery ? 'Try clearing your search query.' : 'Add your commercial textbook catalog to start fulfilling orders across India.'}
          mascotVariant="searching"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          {filteredListings.map((book) => (
            <div
              key={book.id}
              className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      book.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : book.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {book.status}
                  </span>
                  <span className="text-xs font-bold capitalize text-muted-foreground">
                    Edition: <span className="text-foreground">{book.condition?.replace('_', ' ') || 'New'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">by {book.author}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Selling Price</span>
                    <span className="font-mono font-extrabold text-base text-foreground">₹{book.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Inventory Available</span>
                    <span className={`font-mono font-bold ${book.stock > 0 ? 'text-foreground' : 'text-rose-500'}`}>
                      {book.stock} units in stock
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs">
                <Link
                  href={`/books/${book.slug}`}
                  target="_blank"
                  className="text-muted-foreground hover:text-secondary font-bold inline-flex items-center gap-1"
                >
                  <span>Storefront</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setEditForm({ title: book.title, price: book.price, stock: book.stock || 10, condition: book.condition || 'new' });
                      setEditModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
                    title="Edit Product"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setSelectedBook(book); setDeleteModalOpen(true); }}
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                    title="Archive Product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {selectedBook && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedBook(null); }}
          size="md"
          title="Update Product SKU"
          subtitle={`Modifying ${selectedBook.title}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => { setEditModalOpen(false); setSelectedBook(null); }} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl">Cancel</button>
              <button type="submit" form="edit-vendor-product-form" disabled={editMutation.isPending} className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-vendor-product-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ id: selectedBook.id, data: editForm });
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Product Title *</label>
              <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Selling Price (₹) *</label>
                <input type="number" required min={0} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Warehouse Units *</label>
                <input type="number" required min={0} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none" />
              </div>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* ARCHIVE DANGER DIALOG */}
      {selectedBook && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedBook(null); }}
          onConfirm={() => archiveMutation.mutate(selectedBook.id)}
          isPending={archiveMutation.isPending}
          title="Confirm Archive Product"
          entityName={selectedBook.title}
          description={<span>Are you sure you want to archive <strong>{selectedBook.title}</strong>?</span>}
          impacts={['The product SKU will be delisted from buyer search.', 'Warehouse stock will be set to 0.']}
          confirmText="Archive Product"
        />
      )}
    </VendorLayout>
  );
}
