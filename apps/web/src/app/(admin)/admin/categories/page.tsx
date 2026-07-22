'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Category } from '@bookmarket/types';
import { Layers, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate(cat.id);
          }}
          disabled={deleteMutation.isPending}
          className="p-1.5 hover:bg-danger/10 text-text-secondary hover:text-danger rounded transition-colors ml-auto block"
          title="Delete Category"
        >
          <Trash2 className="h-4 w-4" />
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
    </AdminLayout>
  );
}
