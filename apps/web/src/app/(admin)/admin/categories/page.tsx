'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Category } from '@bookmarket/types';
import { Layers, Plus, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-2 text-sm text-text-secondary hover:text-brand transition-colors font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Control Panel</span>
        </Link>

        <div className="flex justify-between items-center border-b border-border pb-6">
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-3">
            <Layers className="h-8 w-8 text-brand" />
            <span>Category Management</span>
          </h1>
        </div>

        {!isAdmin ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
            <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Access Restricted</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
            {/* Create Category Form */}
            <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2">
                <Plus className="h-5 w-5 text-brand" />
                <span>Add New Category</span>
              </h2>

              {errorMsg && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded text-xs font-semibold text-danger">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Science Fiction"
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary focus:ring-brand focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">
                    Parent Category (Optional)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary focus:ring-brand focus:border-brand"
                  >
                    <option value="">None (Top-Level Category)</option>
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
                  className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Category'}
                </button>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="lg:col-span-2 border border-border bg-surface rounded-md p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Existing Categories ({categories.length})
              </h2>

              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-12 border border-border bg-background-subtle rounded" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-8">
                  <button onClick={() => refetch()} className="text-sm font-semibold text-brand">
                    Retry loading categories
                  </button>
                </div>
              ) : (
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background-subtle text-xs font-bold uppercase tracking-wider text-text-secondary">
                        <th className="p-3">Category Name</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-background-subtle">
                          <td className="p-3 font-semibold text-text-primary">{cat.name}</td>
                          <td className="p-3 font-mono text-xs text-text-muted">{cat.slug}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteMutation.mutate(cat.id)}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 hover:bg-danger/10 text-text-secondary hover:text-danger rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
