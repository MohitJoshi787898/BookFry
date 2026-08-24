'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  Users,
  Ban,
  ShieldAlert,
  Filter,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  UserCheck,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminDialog,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';

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

      {/* VIEW USER DETAILS MODAL */}
      {selectedUser && (
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedUser(null);
          }}
          size="lg"
          title={selectedUser.name}
          subtitle={`User ID: ${selectedUser.id}`}
          icon={<Users className="h-5 w-5 text-secondary" />}
          badge={
            selectedUser.isBanned ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-danger/10 text-danger border border-danger/25">
                Suspended / Banned
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-success/10 text-success border border-success/25">
                Active & Verified
              </span>
            )
          }
          headerActions={
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setEditForm({
                    name: selectedUser.name,
                    email: selectedUser.email,
                    roles: selectedUser.roles || [],
                  });
                  setEditModalOpen(true);
                }}
                className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                title="Edit Account"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => {
                  banMutation.mutate(selectedUser.id);
                  setSelectedUser({ ...selectedUser, isBanned: !selectedUser.isBanned });
                }}
                disabled={banMutation.isPending}
                className={`p-1.5 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
                  selectedUser.isBanned
                    ? 'text-success hover:bg-success/10'
                    : 'text-danger hover:bg-danger/10'
                }`}
                title={selectedUser.isBanned ? 'Unban Account' : 'Suspend Account'}
              >
                <Ban className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {selectedUser.isBanned ? 'Reactivate' : 'Suspend'}
                </span>
              </button>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted font-mono">
                {selectedUser.email}
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close Profile
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AdminStatBadge
                label="Account Status"
                value={selectedUser.isBanned ? 'Suspended' : 'Active'}
                variant={selectedUser.isBanned ? 'danger' : 'success'}
              />
              <AdminStatBadge
                label="Primary Role"
                value={selectedUser.roles?.[0]?.toUpperCase() || 'CUSTOMER'}
                variant="info"
              />
              <AdminStatBadge
                label="Security"
                value="JWT Auth"
                variant="default"
              />
            </div>

            {/* Profile Information */}
            <AdminDetailSection
              title="Identity & Contact Profile"
              icon={<UserCheck className="h-4 w-4" />}
            >
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
                <AdminDetailRow label="Full Name" value={selectedUser.name} />
                <AdminDetailRow label="Email Address" value={selectedUser.email} copyable />
                {selectedUser.phone && (
                  <AdminDetailRow label="Phone Number" value={selectedUser.phone} copyable />
                )}
                {selectedUser.createdAt && (
                  <AdminDetailRow
                    label="Registered On"
                    value={new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                )}
              </div>
            </AdminDetailSection>

            {/* Roles & Permissions */}
            <AdminDetailSection
              title="Assigned Roles & Marketplace Access"
              icon={<Shield className="h-4 w-4" />}
            >
              <div className="flex flex-wrap gap-2 pt-1">
                {(selectedUser.roles || []).map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider bg-primary/10 border-primary/20 text-primary"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </AdminDetailSection>
          </div>
        </AdminDialog>
      )}

      {/* EDIT USER FORM MODAL */}
      {selectedUser && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          size="md"
          title="Edit User Account"
          subtitle={`Modifying profile for ${selectedUser.name}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={editMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
              >
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-user-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ userId: selectedUser.id, data: editForm });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Full Name <span className="text-danger">*</span>
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
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-text-primary">
                Assigned Platform Roles
              </label>
              <p className="text-[11px] text-text-muted mb-2">
                Select the privileges and portals accessible to this user.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'customer', label: 'Customer', desc: 'Shop & browse' },
                  { id: 'seller', label: 'Seller', desc: 'Manage inventory' },
                  { id: 'admin', label: 'Admin', desc: 'Full operations' },
                ].map((role) => {
                  const isChecked = editForm.roles.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-secondary/10 border-secondary text-secondary'
                          : 'border-border bg-background hover:bg-muted/50 text-text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold capitalize">{role.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...editForm.roles, role.id]
                              : editForm.roles.filter((r) => r !== role.id);
                            setEditForm({ ...editForm, roles: newRoles });
                          }}
                          className="rounded border-border text-secondary focus:ring-secondary"
                        />
                      </div>
                      <span className="text-[10px] opacity-75">{role.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* SOFT DELETE DANGER DIALOG */}
      {selectedUser && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={() => deleteMutation.mutate(selectedUser.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Account Suspension"
          entityName={`${selectedUser.name} (${selectedUser.email})`}
          description={
            <span>
              Are you sure you want to suspend / soft delete user account{' '}
              <strong>{selectedUser.name}</strong>?
            </span>
          }
          impacts={[
            'User will be logged out of active sessions immediately.',
            'Access to buyer orders, seller dashboard, and listing creation will be revoked.',
            'Active book listings will be hidden from the public marketplace search.',
            'Account can be reactivated by administrators at any time.',
          ]}
          confirmText="Suspend User Account"
        />
      )}
    </AdminLayout>
  );
}
