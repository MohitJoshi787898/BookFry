'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Tag, Plus, ShieldAlert, Trash2, Eye, Pencil, X, RefreshCw } from 'lucide-react';

interface PromoCode {
  id: string;
  _id?: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderSubtotal: number;
  usedCount: number;
  maxUses: number;
  status: 'active' | 'expired' | 'disabled';
}

export default function AdminPromotionsPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const { data: rawPromos = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ['admin-coupons'],
    queryFn: () => apiClient('/admin/coupons'),
    enabled: !!isAdmin,
  });

  const promos: PromoCode[] = rawPromos.map((p) => ({
    ...p,
    id: p.id || (p as unknown as { _id?: string })._id || '',
  }));

  const [code, setCode] = useState('');
  const [value, setValue] = useState(100);
  const [type, setType] = useState<'percentage' | 'flat'>('flat');
  const [minOrder, setMinOrder] = useState(299);

  // Modals state
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    code: '',
    discountType: 'flat' as 'percentage' | 'flat',
    discountValue: 100,
    minOrderSubtotal: 299,
  });

  const createCouponMutation = useMutation({
    mutationFn: (payload: Partial<PromoCode>) =>
      apiClient('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setCode('');
      setValue(100);
    },
  });

  const editCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setEditModalOpen(false);
      setSelectedPromo(null);
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/coupons/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteModalOpen(false);
      setSelectedPromo(null);
    },
  });

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    createCouponMutation.mutate({
      code: code.trim().toUpperCase(),
      discountType: type,
      discountValue: Number(value),
      minOrderSubtotal: Number(minOrder),
    });
  };

  const columns: Column<PromoCode>[] = [
    {
      header: 'Coupon Code',
      cell: (p) => (
        <div className="inline-flex items-center space-x-2 font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded">
          <span>{p.code}</span>
        </div>
      ),
    },
    {
      header: 'Discount Value',
      cell: (p) => (
        <span className="font-bold text-text-primary">
          {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Min Order Subtotal',
      cell: (p) => <span className="font-mono">₹{p.minOrderSubtotal || 0}</span>,
    },
    {
      header: 'Usage Count',
      cell: (p) => (
        <span className="font-mono font-bold text-text-secondary">
          {p.usedCount || 0} / {p.maxUses || 1000}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPromo(p);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Coupon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPromo(p);
              setEditForm({
                code: p.code,
                discountType: p.discountType,
                discountValue: p.discountValue,
                minOrderSubtotal: p.minOrderSubtotal || 0,
              });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Coupon"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPromo(p);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
            title="Delete Coupon"
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
            <Tag className="h-7 w-7 text-brand" />
            <span>Promotions & Coupon Discounts</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Create checkout promo codes, cashback tokens, and regional discount campaigns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Create Coupon Form */}
        <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
            <Plus className="h-5 w-5 text-brand" />
            <span>Generate New Coupon</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CAMPUS50, GATE2026"
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary font-mono uppercase focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Min Order Subtotal (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-all shadow text-xs uppercase tracking-wider"
            >
              {createCouponMutation.isPending ? 'Generating...' : 'Create Promo Code'}
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="lg:col-span-2">
          <AdminDataTable
            title="Active Platform Promo Codes"
            subtitle="Checkout discount tokens"
            data={promos}
            columns={columns}
            searchField="code"
            searchPlaceholder="Search promo code..."
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Tag className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Coupon Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">Coupon ID:</span> <span className="font-mono text-text-primary">{selectedPromo.id}</span></p>
                <p><span className="font-bold text-text-muted">Code:</span> <span className="font-mono font-bold text-brand">{selectedPromo.code}</span></p>
                <p><span className="font-bold text-text-muted">Discount:</span> <span className="font-bold text-text-primary">{selectedPromo.discountType === 'percentage' ? `${selectedPromo.discountValue}%` : `₹${selectedPromo.discountValue}`}</span></p>
                <p><span className="font-bold text-text-muted">Min Subtotal:</span> <span className="font-mono text-text-primary">₹{selectedPromo.minOrderSubtotal || 0}</span></p>
                <p><span className="font-bold text-text-muted">Uses:</span> <span className="font-mono text-text-primary">{selectedPromo.usedCount || 0} / {selectedPromo.maxUses || 1000}</span></p>
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

      {/* EDIT COUPON MODAL */}
      {editModalOpen && selectedPromo && (
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
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Promo Code</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editCouponMutation.mutate({ id: selectedPromo.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Type</label>
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                  >
                    <option value="flat">Flat (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.discountValue}
                    onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 border border-border rounded bg-background text-text-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Min Subtotal (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.minOrderSubtotal}
                  onChange={(e) => setEditForm({ ...editForm, minOrderSubtotal: Number(e.target.value) })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary font-mono"
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
                  disabled={editCouponMutation.isPending}
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90 flex items-center space-x-1"
                >
                  {editCouponMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Delete Promo</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to delete promo code <span className="font-bold text-brand font-mono">{selectedPromo.code}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCouponMutation.mutate(selectedPromo.id)}
                disabled={deleteCouponMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {deleteCouponMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Coupon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
