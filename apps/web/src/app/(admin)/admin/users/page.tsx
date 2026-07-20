'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Users, Search, Ban, ShieldCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isBanned: boolean;
}

export default function AdminUsersPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data: AdminUser[]; meta: { page: number; limit: number; total: number; pages: number } }>({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () =>
      apiClient(`/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}&role=${roleFilter}`),
    enabled: isAuthenticated && isAdmin,
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/admin/users/${userId}/ban`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleToggleBan = (userId: string) => {
    banMutation.mutate(userId);
  };

  const users = responseData?.data || [];
  const meta = responseData?.meta || { page: 1, limit: 15, total: 0, pages: 1 };

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
            <Users className="h-8 w-8 text-brand" />
            <span>User Management</span>
          </h1>
        </div>

        {!isAdmin ? (
          <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
            <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
            <h2 className="font-serif text-xl font-bold text-text-primary">Access Restricted</h2>
          </div>
        ) : (
          <div className="space-y-6 font-sans">
            {/* Search & Role Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-surface text-text-primary focus:ring-brand focus:border-brand"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 text-sm border border-border rounded-md bg-surface text-text-primary focus:ring-brand focus:border-brand"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-16 border border-border bg-surface rounded-md" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 border border-border bg-surface rounded-md">
                <h2 className="text-lg font-bold text-text-primary mb-2 font-serif">
                  Failed to load users
                </h2>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover text-sm font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden bg-surface shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background-subtle text-xs font-bold uppercase tracking-wider text-text-secondary">
                        <th className="p-4">User</th>
                        <th className="p-4">Roles</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u: AdminUser) => (
                        <tr key={u.id} className="hover:bg-background-subtle transition-colors">
                          <td className="p-4 font-sans">
                            <p className="font-bold text-text-primary">{u.name}</p>
                            <p className="text-xs text-text-muted">{u.email}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {u.roles.map((r: string) => (
                                <span
                                  key={r}
                                  className="px-2 py-0.5 bg-brand/10 text-brand border border-brand/20 text-[10px] font-bold uppercase rounded"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {u.isBanned ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {u.id !== currentUser?.id && (
                              <button
                                onClick={() => handleToggleBan(u.id)}
                                disabled={banMutation.isPending}
                                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1 ml-auto transition-colors ${
                                  u.isBanned
                                    ? 'bg-success hover:bg-success/90 text-white'
                                    : 'bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20'
                                }`}
                              >
                                {u.isBanned ? (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Unban User</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="h-3.5 w-3.5" />
                                    <span>Ban Account</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta.pages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-border bg-background-subtle text-xs font-medium">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 border border-border rounded bg-surface disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>
                      Page {meta.page} of {meta.pages}
                    </span>
                    <button
                      disabled={page >= meta.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 border border-border rounded bg-surface disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
