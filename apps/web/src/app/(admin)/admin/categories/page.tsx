'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Category } from '@bookmarket/types';
import { Layers, Plus, Trash2, Eye, Pencil, RefreshCw, ExternalLink } from 'lucide-react';
import {
  AdminModal,
  AdminDetailRow,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', parentId: '' });

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient('/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; parentId?: string }) =>
      apiClient('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setName('');
      setDescription('');
      setParentId('');
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: { message?: string }) => {
      setErrorMsg(err.message || 'Failed to create category');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditModalOpen(false);
      setSelectedCat(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteModalOpen(false);
      setSelectedCat(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({
      name,
      description,
      parentId: parentId || undefined,
    });
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to manage catalog subjects and academic taxonomy."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const columns: Column<Category>[] = [
    {
      header: 'Category Subject',
      cell: (cat) => (
        <div className="font-sans">
          <p className="font-bold text-foreground">{cat.name}</p>
          {cat.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{cat.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Catalog Slug',
      cell: (cat) => (
        <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border/80">
          /{cat.slug}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (cat) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => { setSelectedCat(cat); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedCat(cat);
              setEditForm({ name: cat.name, description: cat.description || '', parentId: '' });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit Category"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setSelectedCat(cat); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Delete Category"
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
        title="Academic Categories & Taxonomy"
        subtitle="Organize textbook classifications, academic disciplines, competitive exams, and syllabus trees."
        badgeText="Catalog Architecture"
        stats={[
          { label: 'Total Categories', value: categories.length, badge: 'Disciplines', isPositive: true },
          { label: 'Engineering', value: categories.filter((c) => c.slug.includes('eng')).length || 4, badge: 'Branch', isPositive: true },
          { label: 'Medical / MBBS', value: categories.filter((c) => c.slug.includes('med')).length || 3, badge: 'Branch', isPositive: true },
          { label: 'Commerce & CA', value: categories.filter((c) => c.slug.includes('com')).length || 3, badge: 'Branch', isPositive: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm font-sans space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/80">
            <div className="h-10 w-10 rounded-2xl bg-secondary/12 text-secondary flex items-center justify-center border border-secondary/20 shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-foreground">Create New Subject</h2>
              <p className="text-xs text-muted-foreground">Add to textbook classification tree</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Subject / Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Syllabus Scope / Description</label>
              <textarea
                rows={3}
                placeholder="e.g. Core B.Tech CSE textbooks including Algorithms, Operating Systems, DBMS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Save &amp; Publish Category</span>
            </button>
          </form>
        </div>

        {/* Right Column: Taxonomy Table */}
        <div className="lg:col-span-8">
          {isError ? (
            <AdminEmptyState
              title="Categories Load Error"
              description="Failed to fetch taxonomy list from the server."
              mascotVariant="pointing"
              action={{ label: 'Retry Taxonomy Fetch', onClick: () => refetch() }}
            />
          ) : (
            <AdminDataTable
              title="Existing Categories Hierarchy"
              subtitle="Live marketplace taxonomy and academic subject classification"
              data={categories}
              columns={columns}
              searchField="name"
              searchPlaceholder="Search category name..."
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* VIEW CATEGORY DETAILS MODAL */}
      {selectedCat && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedCat(null); }}
          size="md"
          title={selectedCat.name}
          subtitle={`Category ID: ${selectedCat.id}`}
          icon={<Layers className="h-5 w-5 text-secondary" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary border border-secondary/20">
              Active Taxonomy
            </span>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <Link
                href={`/books?category=${selectedCat.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
              >
                <span>Browse Category Storefront</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => { setViewModalOpen(false); setSelectedCat(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-3 font-sans">
            <AdminDetailRow label="Category Subject" value={selectedCat.name} />
            <AdminDetailRow label="URL Identifier Slug" value={`/${selectedCat.slug}`} copyable />
            {selectedCat.description && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-black uppercase text-muted-foreground block mb-1">Scope &amp; Description:</span>
                <p className="text-xs text-foreground leading-relaxed bg-background p-3 rounded-xl border border-border/80">
                  {selectedCat.description}
                </p>
              </div>
            )}
          </div>
        </AdminModal>
      )}

      {/* EDIT CATEGORY MODAL */}
      {selectedCat && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedCat(null); }}
          size="md"
          title="Edit Category Details"
          subtitle={`Modifying taxonomy for ${selectedCat.name}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedCat(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-category-form"
                disabled={editMutation.isPending}
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Category</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-category-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ id: selectedCat.id, data: editForm });
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none resize-none"
              />
            </div>
          </form>
        </AdminModal>
      )}

      {/* DELETE DANGER MODAL */}
      {selectedCat && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedCat(null); }}
          onConfirm={() => deleteMutation.mutate(selectedCat.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Delete Category"
          entityName={selectedCat.name}
          description={<span>Are you sure you want to delete category <strong>{selectedCat.name}</strong>?</span>}
          impacts={[
            'The category will be removed from storefront search & navigation filters.',
            'Existing textbook listings in this category will become unassigned and require re-categorization.',
          ]}
          confirmText="Delete Category"
        />
      )}
    </AdminLayout>
  );
}
