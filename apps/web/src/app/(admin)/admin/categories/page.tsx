'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Category } from '@bookmarket/types';
import { Layers, Plus, Trash2, ShieldAlert, Eye, Pencil, X, RefreshCw } from 'lucide-react';

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <Layers className="h-7 w-7 text-brand" />
            <span>Category Taxonomy Manager</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Organize subject categories, syllabus tracks, and textbook classifications.
          </p>
        </div>
      </div>

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

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Layers className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Category Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">Category ID:</span> <span className="font-mono text-text-primary">{selectedCat.id}</span></p>
                <p><span className="font-bold text-text-muted">Category Name:</span> <span className="font-bold text-text-primary">{selectedCat.name}</span></p>
                <p><span className="font-bold text-text-muted">URL Slug:</span> <span className="font-mono text-brand">{selectedCat.slug}</span></p>
                {selectedCat.description && <p><span className="font-bold text-text-muted">Description:</span> <span className="text-text-primary">{selectedCat.description}</span></p>}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-4">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editModalOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Pencil className="h-6 w-6 text-accent" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Category</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate({ id: selectedCat.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-text-primary hover:bg-background-subtle font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90 flex items-center space-x-1"
                >
                  {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Delete Category</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to delete category <span className="font-bold text-text-primary">{selectedCat.name}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedCat.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {deleteMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
