'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Users, Ban, ShieldAlert, Filter, Eye, Pencil, Trash2, X, RefreshCw } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isBanned: boolean;
  phone?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', roles: [] as string[] });

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<AdminUser[]>({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: async () => {
      const res = await apiClient<unknown>(`/admin/users?page=${page}&limit=100&role=${roleFilter}`);
      if (Array.isArray(res)) return res as AdminUser[];
      const resData = res as Record<string, unknown>;
      if ('users' in resData && Array.isArray(resData.users)) return resData.users as AdminUser[];
      if ('data' in resData && Array.isArray(resData.data)) return resData.data as AdminUser[];
      return [];
    },
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

  const editMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name: string; email: string; roles: string[] } }) =>
      apiClient(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditModalOpen(false);
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      apiClient(`/admin/users/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
  });

  const users = responseData || [];

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

  const columns: Column<AdminUser>[] = [
    {
      header: 'User & Email',
      cell: (u) => (
        <div className="font-sans">
          <p className="font-bold text-text-primary">{u.name}</p>
          <p className="text-[11px] text-text-muted">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Roles',
      cell: (u) => (
        <div className="flex gap-1.5 font-sans">
          {(u.roles || []).map((r) => (
            <span
              key={r}
              className={`px-2 py-0.5 border text-[10px] font-bold uppercase rounded ${
                r === 'admin'
                  ? 'bg-accent/10 text-accent border-accent/20'
                  : r === 'seller'
                  ? 'bg-secondary/10 text-secondary border-secondary/20'
                  : 'bg-brand/10 text-brand border-brand/20'
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Account Status',
      cell: (u) =>
        u.isBanned ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-danger/10 text-danger border border-danger/20">
            Soft Deleted (Banned)
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-success/10 text-success border border-success/20">
            Verified Active
          </span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end space-x-1.5">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit User */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
              setEditForm({ name: u.name, email: u.email, roles: u.roles || ['customer'] });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit User"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Toggle Ban */}
          {u.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                banMutation.mutate(u.id);
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                u.isBanned
                  ? 'border-warning/20 bg-warning/10 text-warning hover:bg-warning hover:text-white'
                  : 'border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-warning'
              }`}
              title={u.isBanned ? 'Unban User' : 'Ban User'}
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Soft Delete */}
          {u.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(u);
                setDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
              title="Soft Delete User"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Hero Header */}
      <AdminHero
        title="User & Seller Operations"
        subtitle="Manage customer accounts, verify campus seller stores, and enforce community safety policies."
        badgeText="User Directory & Safety"
        stats={[
          { label: "Total Users", value: users.length, badge: "Registered Accounts", isPositive: true },
          { label: "Campus Sellers", value: users.filter((u) => u.roles.includes("seller")).length, badge: "Verified Sellers", isPositive: true },
          { label: "Banned / Flagged", value: users.filter((u) => u.isBanned).length, badge: "Policy Action", isPositive: false },
          { label: "Administrators", value: users.filter((u) => u.roles.includes("admin")).length, badge: "System Admin", isPositive: true },
        ]}
      />

      {/* Role Filter Bar */}
      <div className="flex items-center justify-between pb-4 font-sans">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-secondary" />
          <span className="text-xs font-bold text-muted-foreground">Filter Account Roles:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-xs font-bold border border-border/80 rounded-2xl bg-card text-foreground focus:ring-2 focus:ring-secondary/40 shadow-sm"
          >
            <option value="">All Account Roles</option>
            <option value="customer">Customers</option>
            <option value="seller">Verified Sellers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      {isError ? (
        <div className="p-8 text-center border border-border bg-surface rounded-md font-sans space-y-3">
          <p className="text-sm font-bold text-danger">Failed to load platform user Directory.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
          >
            Retry User Directory
          </button>
        </div>
      ) : (
        <AdminDataTable
          title="Platform User Directory"
          subtitle="Customer & Seller account management"
          data={users}
          columns={columns}
          searchField="name"
          searchPlaceholder="Search name or email..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW DETAIL MODAL */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Users className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">User Account Details</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">User ID:</span> <span className="font-mono text-text-primary">{selectedUser.id}</span></p>
                <p><span className="font-bold text-text-muted">Full Name:</span> <span className="font-bold text-text-primary">{selectedUser.name}</span></p>
                <p><span className="font-bold text-text-muted">Email:</span> <span className="text-text-primary">{selectedUser.email}</span></p>
                {selectedUser.phone && <p><span className="font-bold text-text-muted">Phone:</span> <span className="text-text-primary">{selectedUser.phone}</span></p>}
              </div>

              <div>
                <p className="font-bold text-text-muted uppercase text-[10px] mb-1">Assigned Roles</p>
                <div className="flex gap-1.5">
                  {(selectedUser.roles || []).map((r) => (
                    <span key={r} className="px-2.5 py-1 bg-brand/10 border border-brand/20 text-brand rounded text-[10px] font-bold uppercase">{r}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-text-muted uppercase text-[10px] mb-1">Account Status</p>
                <p className="font-bold">{selectedUser.isBanned ? <span className="text-danger">Soft-Deleted / Banned</span> : <span className="text-success">Active & Verified</span>}</p>
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

      {/* EDIT USER MODAL */}
      {editModalOpen && selectedUser && (
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
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit User Account</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate({ userId: selectedUser.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Roles</label>
                <div className="flex gap-4">
                  {['customer', 'seller', 'admin'].map((role) => (
                    <label key={role} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.roles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...editForm.roles, role]
                            : editForm.roles.filter((r) => r !== role);
                          setEditForm({ ...editForm, roles: newRoles });
                        }}
                        className="rounded border-border text-brand focus:ring-brand"
                      />
                      <span className="capitalize text-text-primary">{role}</span>
                    </label>
                  ))}
                </div>
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
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Soft Delete</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to soft delete / suspend user <span className="font-bold text-text-primary">{selectedUser.name}</span>? Their account status will be set to <span className="font-bold text-danger">Deleted / Suspended</span>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedUser.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {deleteMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Soft Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
