'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { Users, Ban, ShieldCheck, ShieldAlert, Filter } from 'lucide-react';

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

  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ data: AdminUser[]; meta: { page: number; limit: number; total: number; pages: number } }>({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () =>
      apiClient(`/admin/users?page=${page}&limit=15&role=${roleFilter}`),
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
          {u.roles.map((r) => (
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
            Suspended
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
      cell: (u) =>
        u.id !== currentUser?.id ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBan(u.id);
            }}
            disabled={banMutation.isPending}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1 ml-auto transition-all shadow-sm ${
              u.isBanned
                ? 'bg-success hover:bg-success/90 text-white'
                : 'bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20'
            }`}
          >
            {u.isBanned ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Reactivate User</span>
              </>
            ) : (
              <>
                <Ban className="h-3.5 w-3.5" />
                <span>Suspend Account</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-[10px] font-bold text-text-muted uppercase">Current Session</span>
        ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <Users className="h-7 w-7 text-brand" />
            <span>User & Seller Operations</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage customer accounts, verify seller stores, and enforce safety policies.
          </p>
        </div>

        {/* Role Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-surface text-text-primary focus:ring-2 focus:ring-brand"
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
    </AdminLayout>
  );
}
