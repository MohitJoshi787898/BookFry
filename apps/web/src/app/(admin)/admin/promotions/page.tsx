'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Tag, Plus, ShieldAlert, Trash2, Eye, Pencil, RefreshCw, Check } from 'lucide-react';
import {
  AdminDialog,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';

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

      {/* VIEW PROMO DETAILS MODAL */}
      {selectedPromo && (
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedPromo(null);
          }}
          size="md"
          title={`Coupon ${selectedPromo.code}`}
          subtitle={`Coupon ID: ${selectedPromo.id}`}
          icon={<Tag className="h-5 w-5 text-secondary" />}
          badge={
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                selectedPromo.status === 'active'
                  ? 'bg-success/10 text-success border border-success/20'
                  : selectedPromo.status === 'expired'
                  ? 'bg-warning/10 text-warning border border-warning/20'
                  : 'bg-muted text-text-muted border-border'
              }`}
            >
              {selectedPromo.status}
            </span>
          }
          headerActions={
            <button
              onClick={() => {
                setViewModalOpen(false);
                setEditForm({
                  code: selectedPromo.code,
                  discountType: selectedPromo.discountType,
                  discountValue: selectedPromo.discountValue,
                  minOrderSubtotal: selectedPromo.minOrderSubtotal || 0,
                });
                setEditModalOpen(true);
              }}
              className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold mr-2"
              title="Edit Promo Parameters"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted font-mono">
                Code: <span className="font-bold font-mono text-secondary">{selectedPromo.code}</span>
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedPromo(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close Token
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Stat Badges */}
            <div className="grid grid-cols-2 gap-3">
              <AdminStatBadge
                label="Discount Value"
                value={
                  selectedPromo.discountType === 'percentage'
                    ? `${selectedPromo.discountValue}% OFF`
                    : `₹${selectedPromo.discountValue} OFF`
                }
                variant="default"
              />
              <AdminStatBadge
                label="Redemption Usage"
                value={`${selectedPromo.usedCount || 0} / ${selectedPromo.maxUses || 1000}`}
                variant={
                  (selectedPromo.usedCount || 0) >= (selectedPromo.maxUses || 1000)
                    ? 'danger'
                    : 'success'
                }
              />
            </div>

            {/* Parameter Rows */}
            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
              <AdminDetailRow label="Coupon Code" value={selectedPromo.code} copyable />
              <AdminDetailRow
                label="Discount Type"
                value={selectedPromo.discountType === 'percentage' ? 'Percentage (%)' : 'Flat (₹)'}
              />
              <AdminDetailRow
                label="Minimum Order Subtotal"
                value={`₹${selectedPromo.minOrderSubtotal || 0}`}
              />
              <AdminDetailRow
                label="Lifecycle Status"
                value={selectedPromo.status.toUpperCase()}
              />
              <AdminDetailRow label="Token ID" value={selectedPromo.id} copyable />
            </div>
          </div>
        </AdminDialog>
      )}

      {/* EDIT PROMO FORM MODAL */}
      {selectedPromo && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedPromo(null);
          }}
          size="md"
          title="Edit Promo Token"
          subtitle={`Adjusting checkout discount rules for ${selectedPromo.code}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedPromo(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-coupon-form"
                disabled={editCouponMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
              >
                {editCouponMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-coupon-form"
            onSubmit={(e) => {
              e.preventDefault();
              editCouponMutation.mutate({ id: selectedPromo.id, data: editForm });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Coupon Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs font-mono font-bold focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Discount Type
                </label>
                <select
                  value={editForm.discountType}
                  onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value as 'percentage' | 'flat' })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Discount Value <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.discountValue}
                  onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Min Order Subtotal (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={editForm.minOrderSubtotal}
                onChange={(e) => setEditForm({ ...editForm, minOrderSubtotal: Number(e.target.value) })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>
          </form>
        </AdminDialog>
      )}

      {/* DELETE PROMO DANGER DIALOG */}
      {selectedPromo && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedPromo(null);
          }}
          onConfirm={() => deleteCouponMutation.mutate(selectedPromo.id)}
          isPending={deleteCouponMutation.isPending}
          title="Confirm Delete Promo Token"
          entityName={`Code: ${selectedPromo.code}`}
          description={
            <span>
              Are you sure you want to delete promo code{' '}
              <strong className="font-mono">{selectedPromo.code}</strong>?
            </span>
          }
          impacts={[
            'The promo token will immediately be deactivated across all customer checkouts.',
            'Customers with active uncompleted carts will no longer receive this discount on checkout.',
          ]}
          confirmText="Delete Promo Token"
        />
      )}
    </AdminLayout>
  );
}
