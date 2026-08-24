'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Category } from '@bookmarket/types';
import { Layers, Plus, Trash2, ShieldAlert, Eye, Pencil, RefreshCw } from 'lucide-react';
import {
  AdminDialog,
  AdminDetailRow,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';

export default function AdminCategoriesPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
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
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </AdminLayout>
    );
  }

  const columns: Column<Category>[] = [
    {
      header: 'Category Name',
      cell: (cat) => (
        <div className="font-sans">
          <p className="font-bold text-text-primary">{cat.name}</p>
          {cat.description && <p className="text-[11px] text-text-muted">{cat.description}</p>}
        </div>
      ),
    },
    {
      header: 'URL Slug',
      cell: (cat) => <span className="font-mono text-xs text-brand">{cat.slug}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (cat) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCat(cat);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Category */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCat(cat);
              setEditForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Category"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCat(cat);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
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
      {/* Hero Header */}
      <AdminHero
        title="Category Taxonomy Manager"
        subtitle="Organize subject categories, academic syllabus tracks, and textbook classifications."
        badgeText="Storefront Taxonomy Engine"
        stats={[
          { label: "Total Categories", value: categories.length, badge: "Taxonomy Size", isPositive: true },
          { label: "Top-Level Branches", value: categories.filter((c) => !c.parentId).length, badge: "Root Branches", isPositive: true },
          { label: "Sub-Categories", value: categories.filter((c) => !!c.parentId).length, badge: "Child Branches", isPositive: true },
          { label: "Taxonomy Status", value: "Active", badge: "Engine Online", isPositive: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Create Category Form Card */}
        <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
            <Plus className="h-5 w-5 text-brand" />
            <span>Add New Category</span>
          </h2>

          {errorMsg && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded text-xs font-semibold text-danger">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Artificial Intelligence & ML"
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of books in this subject..."
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Parent Category (Optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
              >
                <option value="">None (Top-Level Subject)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-all shadow text-xs uppercase tracking-wider"
            >
              {createMutation.isPending ? 'Creating Category...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2">
          {isError ? (
            <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
              <p className="text-sm font-bold text-danger">Failed to load categories catalog.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
              >
                Retry
              </button>
            </div>
          ) : (
            <AdminDataTable
              title={`Existing Categories (${categories.length})`}
              subtitle="Live marketplace taxonomy hierarchy"
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
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedCat(null);
          }}
          size="md"
          title={selectedCat.name}
          subtitle={`Category ID: ${selectedCat.id}`}
          icon={<Layers className="h-5 w-5 text-secondary" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary border border-primary/20">
              Active Taxonomy
            </span>
          }
          headerActions={
            <button
              onClick={() => {
                setViewModalOpen(false);
                setEditForm({
                  name: selectedCat.name,
                  description: selectedCat.description || '',
                  parentId: selectedCat.parentId || '',
                });
                setEditModalOpen(true);
              }}
              className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold mr-2"
              title="Edit Category"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted font-mono">
                Slug: <span className="font-bold text-text-primary">/{selectedCat.slug}</span>
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedCat(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
              <AdminDetailRow label="Category Name" value={selectedCat.name} />
              <AdminDetailRow label="URL Slug" value={`/books?category=${selectedCat.slug}`} copyable />
              <AdminDetailRow label="Taxonomy ID" value={selectedCat.id} copyable />
              {selectedCat.description && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold uppercase text-text-muted block mb-1">
                    Editorial Description:
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-background p-3 rounded-xl border border-border">
                    {selectedCat.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </AdminDialog>
      )}

      {/* EDIT CATEGORY FORM MODAL */}
      {selectedCat && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCat(null);
          }}
          size="md"
          title="Edit Category"
          subtitle={`Modifying taxonomy for ${selectedCat.name}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedCat(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-category-form"
                disabled={editMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Category Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Category marketing description..."
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </form>
        </AdminDialog>
      )}

      {/* DELETE CATEGORY DANGER DIALOG */}
      {selectedCat && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedCat(null);
          }}
          onConfirm={() => deleteMutation.mutate(selectedCat.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Delete Category"
          entityName={selectedCat.name}
          description={
            <span>
              Are you sure you want to remove category <strong>{selectedCat.name}</strong>?
            </span>
          }
          impacts={[
            'The category will be removed from navigation and filter sidebars.',
            'Books assigned to this category will become unassigned until categorized again.',
          ]}
          confirmText="Delete Category"
        />
      )}
    </AdminLayout>
  );
}
