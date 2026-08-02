'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Tag, Plus, ShieldAlert, Trash2, Eye, Pencil, X, RefreshCw, Check } from 'lucide-react';

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
        <div className="text-center py-16 border border-border/80 bg-card rounded-3xl font-sans space-y-4 shadow-xl my-8">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You must have Administrative privileges to view or create promotional discount codes.
          </p>
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

  const totalRedemptions = promos.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const activeCouponsCount = promos.filter((p) => (p.status || 'active') === 'active').length;

  const columns: Column<PromoCode>[] = [
    {
      header: 'Coupon Code',
      cell: (p) => (
        <div className="inline-flex items-center space-x-2 font-mono font-bold text-[#F26522] bg-[#F26522]/10 border border-[#F26522]/20 px-3 py-1 rounded-xl shadow-xs">
          <Tag className="h-3.5 w-3.5" />
          <span>{p.code}</span>
        </div>
      ),
    },
    {
      header: 'Discount Value',
      cell: (p) => (
        <span className="font-bold text-foreground">
          {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Min Order Subtotal',
      cell: (p) => <span className="font-mono text-muted-foreground font-semibold">₹{p.minOrderSubtotal || 0}</span>,
    },
    {
      header: 'Usage Count',
      cell: (p) => (
        <span className="font-mono font-bold text-foreground">
          {p.usedCount || 0} <span className="text-muted-foreground font-normal">/ {p.maxUses || 1000}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end space-x-2 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPromo(p);
              setViewModalOpen(true);
            }}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-xs"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
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
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-secondary transition-all active:scale-95 shadow-xs"
            title="Edit Coupon"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPromo(p);
              setDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xs"
            title="Delete Coupon"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Brand Hero Section Header */}
      <AdminHero
        title="Promotions & Coupon Discounts"
        subtitle="Create checkout promo codes, cashback tokens, and regional discount campaigns across BookFry."
        badgeText="Growth & Checkout Engine"
        stats={[
          { label: "Total Promo Codes", value: promos.length, badge: "All Coupons", isPositive: true },
          { label: "Active Tokens", value: activeCouponsCount, badge: "Live At Checkout", isPositive: true },
          { label: "Total Redemptions", value: totalRedemptions, badge: "Buyer Claimed", isPositive: true },
          { label: "Promotions Engine", value: "Active", badge: "Engine Online", isPositive: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 font-sans">
        {/* Create Coupon Form Card (4 cols) */}
        <div className="lg:col-span-4 border border-border/80 bg-card rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center space-x-2">
              <Plus className="h-5 w-5 text-secondary" />
              <span>Generate Coupon</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/10 text-secondary px-2.5 py-1 rounded-full border border-secondary/20">
              New Token
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CAMPUS50, GATE2026"
                className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono uppercase font-bold focus:ring-2 focus:ring-secondary/40 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Discount Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Discount Value
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground focus:ring-2 focus:ring-secondary/40 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                Min Order Subtotal (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground focus:ring-2 focus:ring-secondary/40 focus:outline-none font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="w-full py-3 bg-[#F26522] hover:bg-[#D64E0F] text-white font-extrabold rounded-2xl transition-all shadow-md shadow-[#F26522]/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {createCouponMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>{createCouponMutation.isPending ? 'Generating...' : 'Create Promo Code'}</span>
            </button>
          </form>
        </div>

        {/* Existing Coupons Table (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl">
            <AdminDataTable
              title="Active Platform Promo Codes"
              subtitle="Live checkout discount tokens across India"
              data={promos}
              columns={columns}
              searchField="code"
              searchPlaceholder="Search promo code..."
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Coupon Token Summary</h3>
                <p className="text-xs text-muted-foreground">Detailed checkout parameters</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2">
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Coupon ID:</span>
                  <span className="font-mono text-foreground font-semibold">{selectedPromo.id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Code:</span>
                  <span className="font-mono font-black text-[#F26522]">{selectedPromo.code}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Discount Value:</span>
                  <span className="font-bold text-foreground">
                    {selectedPromo.discountType === 'percentage' ? `${selectedPromo.discountValue}% OFF` : `₹${selectedPromo.discountValue} OFF`}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Min Subtotal:</span>
                  <span className="font-mono text-foreground font-bold">₹{selectedPromo.minOrderSubtotal || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Claimed Uses:</span>
                  <span className="font-mono font-bold text-foreground">{selectedPromo.usedCount || 0} / {selectedPromo.maxUses || 1000}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 bg-[#F26522] text-white text-xs font-bold rounded-2xl hover:bg-[#D64E0F] transition-all shadow-sm active:scale-95"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Edit Promo Code</h3>
                <p className="text-xs text-muted-foreground">Modify active coupon parameters</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editCouponMutation.mutate({ id: selectedPromo.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                    Type
                  </label>
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium"
                  >
                    <option value="flat">Flat (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.discountValue}
                    onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  Min Subtotal (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.minOrderSubtotal}
                  onChange={(e) => setEditForm({ ...editForm, minOrderSubtotal: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 border border-border/80 rounded-2xl text-muted-foreground hover:bg-muted font-bold active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editCouponMutation.isPending}
                  className="px-5 py-2.5 bg-secondary text-white font-bold rounded-2xl hover:bg-[#D64E0F] flex items-center space-x-1.5 active:scale-95 shadow-md shadow-secondary/20"
                >
                  {editCouponMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Delete Promo Token</h3>
                <p className="text-xs text-muted-foreground">Revoke discount code from checkout</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete promo code <span className="font-mono font-bold text-[#F26522]">{selectedPromo.code}</span>? This will prevent buyers from claiming this token during checkout.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-border/80 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCouponMutation.mutate(selectedPromo.id)}
                disabled={deleteCouponMutation.isPending}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 active:scale-95 shadow-md shadow-rose-600/20"
              >
                {deleteCouponMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>Delete Coupon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
