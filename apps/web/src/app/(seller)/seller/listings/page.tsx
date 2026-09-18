'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/seller-layout';
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
  AlertOctagon,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Brand New', desc: 'Unused, in perfect condition' },
  { value: 'like_new', label: 'Like New', desc: 'Cover intact, no markings or bent pages' },
  { value: 'good', label: 'Good', desc: 'Light notes/highlighting, all pages intact' },
  { value: 'fair', label: 'Fair', desc: 'Noticeable wear, fully readable' },
];

export default function SellerListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const isSeller = user?.roles?.includes('seller');
  const isAdmin = user?.roles?.includes('admin');
  const hasAccess = isSeller || isAdmin;

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    price: 0,
    stock: 1,
    condition: 'good',
    conditionNotes: '',
  });

  const {
    data: listingsRaw,
    isError,
    refetch,
  } = useQuery<{ listings?: Book[] } | Book[]>({
    queryKey: ['seller-listings-page', statusFilter],
    queryFn: () => apiClient(`/seller/listings?page=1&limit=100&status=${statusFilter}`),
    enabled: isAuthenticated && hasAccess,
  });

  const listings: Book[] = Array.isArray(listingsRaw)
    ? listingsRaw
    : listingsRaw?.listings || [];

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings-page'] });
      setEditModalOpen(false);
      setSelectedBook(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/books/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listings-page'] });
      setDeleteModalOpen(false);
      setSelectedBook(null);
    },
  });

  if (!isAuthenticated) {
    return (
      <SellerLayout>
        <RoleEmptyState
          title="Sign In to Manage Your Catalog"
          description="View, edit, and organize your listed textbook inventory."
          mascotVariant="reading"
        />
      </SellerLayout>
    );
  }

  if (!hasAccess) {
    return (
      <SellerLayout>
        <RoleEmptyState
          title="Become a BookFry Campus Seller"
          description="You are currently signed in as a student buyer. Register as a campus seller to manage textbook inventory, set custom prices, and earn cash."
          mascotVariant="reading"
          action={{
            label: 'Register as Campus Seller',
            onClick: () => router.push('/seller/register'),
          }}
          secondaryAction={{
            label: 'Browse Student Marketplace',
            onClick: () => router.push('/books'),
          }}
        />
      </SellerLayout>
    );
  }

  const rawListings = listings || [];
  const filteredListings = rawListings.filter((b) => {
    const matchesStatus = !statusFilter || b.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.trim().toLowerCase();
    const cleanQ = q.replace(/[^0-9x]/gi, '');
    const cleanIsbn = (b.isbn || '').replace(/[^0-9x]/gi, '').toLowerCase();

    const matchesText =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q);

    const matchesIsbn =
      (cleanQ.length >= 3 && cleanIsbn.includes(cleanQ)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q));

    return matchesText || matchesIsbn;
  });

  const filterChips = [
    { id: '', label: 'All Books', count: rawListings.length },
    { id: 'active', label: 'Active Live', count: rawListings.filter((b) => b.status === 'active').length },
    { id: 'pending', label: 'Pending Review', count: rawListings.filter((b) => b.status === 'pending').length },
    { id: 'archived', label: 'Archived', count: rawListings.filter((b) => b.status === 'archived').length },
  ];

  return (
    <SellerLayout>
      <RoleHero
        title="My Book Listings & Inventory"
        subtitle="Manage your second-hand and new textbook catalog, update stock availability, and adjust pricing anytime."
        badgeText="Seller Inventory Control"
        stats={[
          { label: 'Total Listed', value: rawListings.length, badge: 'Titles', isPositive: true },
          { label: 'Active Live', value: rawListings.filter((b) => b.status === 'active').length, badge: 'Live on Store', isPositive: true },
          { label: 'Pending Moderation', value: rawListings.filter((b) => b.status === 'pending').length, badge: 'Reviewing', isPositive: false },
        ]}
        actions={
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-sm transition-all shadow-xs active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>List a Book</span>
          </Link>
        }
      />

      <RoleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by title, author, or ISBN (e.g. 978-0-13...)"
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <RoleEmptyState
          title="Catalog Fetch Error"
          description="Failed to load your textbook inventory."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : filteredListings.length === 0 ? (
        <RoleEmptyState
          title="No Books Found"
          description={searchQuery ? 'Try clearing your search query.' : 'You haven’t listed any books in this category yet.'}
          mascotVariant="searching"
          action={{
            label: 'List Your First Book',
            onClick: () => window.location.assign('/sell'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          {filteredListings.map((book) => (
            <div
              key={book.id}
              className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card hover:border-secondary/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      book.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : book.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : book.status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {book.status}
                  </span>
                  <span className="text-xs font-bold capitalize text-muted-foreground">
                    Condition: <span className="text-foreground">{book.condition?.replace('_', ' ') || 'Good'}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="relative h-24 w-18 shrink-0 rounded-2xl overflow-hidden border border-border/80 bg-muted/30">
                    {book.images?.[0]?.url ? (
                      <Image
                        src={book.images[0].url}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">by {book.author}</p>
                    {book.conditionNotes && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                        &quot;{book.conditionNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {book.status === 'rejected' && (
                  <div className="p-3 bg-rose-500/12 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-xs">
                    <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-rose-700 dark:text-rose-300">Submission Rejected by Moderator</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {book.rejectionReason || 'Please review book condition and photos.'}
                      </p>
                      <Link
                        href={`/sell?slug=${book.slug}`}
                        className="inline-block pt-0.5 font-extrabold text-secondary hover:underline"
                      >
                        Fix and Resubmit in Listing Studio &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Listing Price</span>
                    <span className="font-mono font-extrabold text-base text-foreground">₹{book.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Available Stock</span>
                    <span className={`font-mono font-bold ${book.stock > 0 ? 'text-foreground' : 'text-rose-500'}`}>
                      {book.stock} {book.stock === 1 ? 'copy' : 'copies'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  <Link
                    href={`/sell?slug=${book.slug}`}
                    className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
                    title="Open in Full Listing Studio"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setEditForm({
                        title: book.title,
                        price: book.price,
                        stock: book.stock || 1,
                        condition: book.condition || 'good',
                        conditionNotes: book.conditionNotes || '',
                      });
                      setEditModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
                    title="Quick Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setSelectedBook(book); setDeleteModalOpen(true); }}
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                    title="Archive Book"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT BOOK MODAL */}
      {selectedBook && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedBook(null); }}
          size="md"
          title="Update Book Listing"
          subtitle={`Adjust parameters for ${selectedBook.title}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                href={`/sell?slug=${selectedBook.slug}`}
                className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
              >
                <span>Full Studio Editor</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setEditModalOpen(false); setSelectedBook(null); }} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" form="edit-book-form" disabled={editMutation.isPending} className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                  {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          }
        >
          <form
            id="edit-book-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ id: selectedBook.id, data: editForm });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Book Title *</label>
              <input type="text" required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Price (₹) *</label>
                <input type="number" required min={0} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Stock Copies *</label>
                <input type="number" required min={0} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })} className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Book Quality Grade *</label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITION_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, condition: c.value })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      editForm.condition === c.value
                        ? 'border-secondary bg-secondary/10 text-foreground'
                        : 'border-border/80 bg-background text-muted-foreground hover:border-border'
                    }`}
                  >
                    <p className="font-bold text-xs">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Condition Notes &amp; Defects</label>
              <textarea
                rows={2}
                placeholder="Mention any highlights, annotations, or wear on the textbook cover"
                value={editForm.conditionNotes}
                onChange={(e) => setEditForm({ ...editForm, conditionNotes: e.target.value })}
                className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
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
          title="Confirm Archive Listing"
          entityName={selectedBook.title}
          description={<span>Are you sure you want to archive <strong>{selectedBook.title}</strong>?</span>}
          impacts={['The book will be delisted from search and storefront.', 'You can reactivate the listing at any time from your catalog.']}
          confirmText="Archive Book"
        />
      )}
    </SellerLayout>
  );
}
