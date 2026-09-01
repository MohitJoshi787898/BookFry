'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import {
  Users,
  Ban,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  UserCheck,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminModal,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';

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
  const [searchQuery, setSearchQuery] = useState('');
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
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const res = await apiClient<unknown>(`/admin/users?limit=100&role=${roleFilter}`);
      if (Array.isArray(res)) return res as AdminUser[];
      const resData = res as Record<string, unknown>;
      if ('users' in resData && Array.isArray(resData.users)) return resData.users as AdminUser[];
      if ('data' in resData && Array.isArray(resData.data)) return resData.data as AdminUser[];
      return [];
    },
    enabled: isAuthenticated && isAdmin,
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => apiClient(`/admin/users/${userId}/ban`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, isBanned: !selectedUser.isBanned });
      }
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name: string; email: string; roles: string[] } }) =>
      apiClient(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditModalOpen(false);
      setSelectedUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => apiClient(`/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Admin Access Restricted"
          description="Super Administrator role required to view and manage user accounts."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const rawUsers = responseData || [];
  const users = searchQuery.trim()
    ? rawUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawUsers;

  const filterChips = [
    { id: '', label: 'All Accounts', count: rawUsers.length },
    { id: 'customer', label: 'Customers', count: rawUsers.filter((u) => u.roles?.includes('customer')).length },
    { id: 'seller', label: 'Verified Sellers', count: rawUsers.filter((u) => u.roles?.includes('seller')).length },
    { id: 'admin', label: 'Admins', count: rawUsers.filter((u) => u.roles?.includes('admin')).length },
  ];

  const columns: Column<AdminUser>[] = [
    {
      header: 'Account Identity',
      cell: (u) => (
        <div className="font-sans">
          <p className="font-bold text-foreground">{u.name}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Roles',
      cell: (u) => (
        <div className="flex gap-1 font-sans">
          {(u.roles || []).map((r) => (
            <span
              key={r}
              className={`px-2 py-0.5 border text-[10px] font-black uppercase rounded-lg ${
                r === 'admin'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : r === 'seller'
                  ? 'bg-secondary/15 text-secondary border-secondary/30'
                  : 'bg-muted text-foreground border-border/80'
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (u) =>
        u.isBanned ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Suspended
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => { setSelectedUser(u); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(u);
              setEditForm({ name: u.name, email: u.email, roles: u.roles || ['customer'] });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit User"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {u.id !== currentUser?.id && (
            <button
              onClick={() => banMutation.mutate(u.id)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                u.isBanned
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                  : 'border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-amber-500'
              }`}
              title={u.isBanned ? 'Unban User' : 'Ban User'}
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}
          {u.id !== currentUser?.id && (
            <button
              onClick={() => { setSelectedUser(u); setDeleteModalOpen(true); }}
              className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
              title="Delete User"
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
      <AdminHero
        title="User & Seller Operations"
        subtitle="Manage customer accounts, verify campus seller stores, and enforce community safety policies."
        badgeText="User Directory & Safety"
        stats={[
          { label: 'Total Users', value: rawUsers.length, badge: 'Accounts', isPositive: true },
          { label: 'Campus Sellers', value: rawUsers.filter((u) => u.roles?.includes('seller')).length, badge: 'Sellers', isPositive: true },
          { label: 'Suspended', value: rawUsers.filter((u) => u.isBanned).length, badge: 'Policy Action', isPositive: false },
          { label: 'Administrators', value: rawUsers.filter((u) => u.roles?.includes('admin')).length, badge: 'Admins', isPositive: true },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search name or college email..."
        filterChips={filterChips}
        activeFilter={roleFilter}
        onFilterSelect={setRoleFilter}
      />

      {isError ? (
        <AdminEmptyState
          title="User Directory Error"
          description="Failed to load platform user records from the server."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
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

      {/* VIEW USER DETAILS WORKSPACE DRAWER */}
      {selectedUser && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedUser(null); }}
          size="sheet"
          title={selectedUser.name}
          subtitle={`User ID: ${selectedUser.id}`}
          icon={<Users className="h-5 w-5 text-secondary" />}
          badge={
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
              selectedUser.isBanned ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
            }`}>
              {selectedUser.isBanned ? 'Suspended' : 'Active'}
            </span>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              {selectedUser.id !== currentUser?.id && (
                <button
                  type="button"
                  onClick={() => banMutation.mutate(selectedUser.id)}
                  disabled={banMutation.isPending}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedUser.isBanned
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white'
                  }`}
                >
                  {banMutation.isPending ? 'Updating...' : selectedUser.isBanned ? 'Reactivate Account' : 'Suspend Account'}
                </button>
              )}
              <button
                onClick={() => { setViewModalOpen(false); setSelectedUser(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer ml-auto"
              >
                Close Profile
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AdminStatBadge label="Account Status" value={selectedUser.isBanned ? 'Suspended' : 'Active'} variant={selectedUser.isBanned ? 'danger' : 'success'} />
              <AdminStatBadge label="Primary Role" value={selectedUser.roles?.[0]?.toUpperCase() || 'CUSTOMER'} variant="info" />
              <AdminStatBadge label="Authentication" value="JWT Session" variant="default" />
            </div>

            <AdminDetailSection title="Account Identity & Contact" icon={<UserCheck className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <AdminDetailRow label="Full Name" value={selectedUser.name} />
                <AdminDetailRow label="Email Address" value={selectedUser.email} copyable />
                {selectedUser.phone && <AdminDetailRow label="Phone Number" value={selectedUser.phone} copyable />}
                {selectedUser.createdAt && (
                  <AdminDetailRow
                    label="Member Since"
                    value={new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  />
                )}
              </div>
            </AdminDetailSection>

            <AdminDetailSection title="Assigned Access Roles" icon={<Shield className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-2 pt-1">
                {(selectedUser.roles || []).map((r) => (
                  <div key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider bg-secondary/10 border-secondary/20 text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </AdminDetailSection>
          </div>
        </AdminModal>
      )}

      {/* EDIT USER FORM MODAL */}
      {selectedUser && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedUser(null); }}
          size="md"
          title="Edit User Account"
          subtitle={`Modifying profile for ${selectedUser.name}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedUser(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={editMutation.isPending}
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-foreground">Assigned Roles</label>
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
                      className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-secondary/15 border-secondary text-secondary'
                          : 'border-border/80 bg-background hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold capitalize text-xs">{role.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...editForm.roles, role.id]
                              : editForm.roles.filter((r) => r !== role.id);
                            setEditForm({ ...editForm, roles: newRoles });
                          }}
                          className="rounded border-border text-secondary accent-secondary"
                        />
                      </div>
                      <span className="text-[10px] opacity-75">{role.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {/* SUSPEND ACCOUNT DANGER DIALOG */}
      {selectedUser && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedUser(null); }}
          onConfirm={() => deleteMutation.mutate(selectedUser.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Account Suspension"
          entityName={`${selectedUser.name} (${selectedUser.email})`}
          description={<span>Are you sure you want to suspend user account <strong>{selectedUser.name}</strong>?</span>}
          impacts={[
            'User will be logged out of all active sessions immediately.',
            'Access to buyer orders and seller listings will be locked.',
            'Account can be reactivated by administrators at any time.',
          ]}
          confirmText="Suspend User Account"
        />
      )}
    </AdminLayout>
  );
}
