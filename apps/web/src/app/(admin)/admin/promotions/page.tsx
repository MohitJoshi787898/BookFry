'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Tag, Plus, Trash2, Eye, Pencil, RefreshCw, Sparkles, Percent, IndianRupee } from 'lucide-react';
import {
  AdminModal,
  AdminDetailRow,
  AdminStatBadge,
  AdminDetailSection,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';

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

  const { data: rawPromos = [], isLoading, isError, refetch } = useQuery<PromoCode[]>({
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
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to configure student discount vouchers and promotions."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const columns: Column<PromoCode>[] = [
    {
      header: 'Voucher Code',
      cell: (p) => (
        <div className="font-sans">
          <span className="font-mono text-xs font-black text-foreground bg-secondary/10 text-secondary px-2.5 py-1 rounded-xl border border-secondary/20 tracking-wider">
            {p.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Discount Rule',
      cell: (p) => (
        <span className="font-mono text-xs font-extrabold text-foreground">
          {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} FLAT OFF`}
        </span>
      ),
    },
    {
      header: 'Min Subtotal',
      cell: (p) => <span className="font-mono text-xs text-muted-foreground font-semibold">₹{p.minOrderSubtotal}</span>,
    },
    {
      header: 'Redemptions',
      cell: (p) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {p.usedCount || 0} used
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          {p.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => { setSelectedPromo(p); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Inspect Voucher"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedPromo(p);
              setEditForm({
                code: p.code,
                discountType: p.discountType,
                discountValue: p.discountValue,
                minOrderSubtotal: p.minOrderSubtotal,
              });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit Voucher"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setSelectedPromo(p); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Delete Voucher"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Promotions & Student Coupons"
        subtitle="Create campus launch codes, exam season flash deals, and order subtotal discount vouchers."
        badgeText="Marketing & Growth"
        stats={[
          { label: 'Total Promo Codes', value: promos.length, badge: 'Coupons', isPositive: true },
          { label: 'Active Deals', value: promos.filter((p) => p.status === 'active' || !p.status).length, badge: 'Live', isPositive: true },
          { label: 'Total Redemptions', value: promos.reduce((a, b) => a + (b.usedCount || 0), 0), badge: 'Claims', isPositive: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Coupon Studio Creator */}
        <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm font-sans space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/80">
            <div className="h-10 w-10 rounded-2xl bg-secondary/12 text-secondary flex items-center justify-center border border-secondary/20 shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-foreground">Create Voucher</h2>
              <p className="text-xs text-muted-foreground">Configure discount parameters</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim()) return;
              createCouponMutation.mutate({
                code: code.trim().toUpperCase(),
                discountType: type,
                discountValue: Number(value),
                minOrderSubtotal: Number(minOrder),
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CAMPUS50, EXAM2026"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Discount Mechanism</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('flat')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    type === 'flat'
                      ? 'bg-secondary text-white border-secondary shadow-xs'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>Flat Cash (₹)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('percentage')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    type === 'percentage'
                      ? 'bg-secondary text-white border-secondary shadow-xs'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Percent className="h-3.5 w-3.5" />
                  <span>Percentage (%)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  {type === 'percentage' ? 'Percent (%)' : 'Amount (₹)'} *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={type === 'percentage' ? 100 : 10000}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Min Order (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-secondary" />
                <span>Simulation Preview:</span>
              </span>
              <p className="text-xs text-foreground font-medium">
                On a ₹500 textbook order, student saves{' '}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{type === 'percentage' ? Math.round((500 * value) / 100) : Math.min(500, value)}
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="w-full py-3 px-4 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createCouponMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Deploy Promotion Code</span>
            </button>
          </form>
        </div>

        {/* Right Column: Promos Data Table */}
        <div className="lg:col-span-8">
          {isError ? (
            <AdminEmptyState
              title="Failed to Load Coupons"
              description="Could not connect to the promotions repository."
              mascotVariant="pointing"
              action={{ label: 'Retry Fetch', onClick: () => refetch() }}
            />
          ) : (
            <AdminDataTable
              title="Active Platform Vouchers"
              subtitle="Overview of published promo codes and redemptions"
              data={promos}
              columns={columns}
              searchField="code"
              searchPlaceholder="Search coupon code..."
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* VIEW PROMO DETAILS MODAL */}
      {selectedPromo && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedPromo(null); }}
          size="md"
          title={`Coupon ${selectedPromo.code}`}
          subtitle="Voucher metrics & rules"
          icon={<Tag className="h-5 w-5 text-secondary" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {selectedPromo.status || 'Active'}
            </span>
          }
          footer={
            <div className="flex items-center justify-end w-full">
              <button
                onClick={() => { setViewModalOpen(false); setSelectedPromo(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 font-sans">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AdminStatBadge
                label="Discount Value"
                value={selectedPromo.discountType === 'percentage' ? `${selectedPromo.discountValue}%` : `₹${selectedPromo.discountValue}`}
                variant="success"
              />
              <AdminStatBadge label="Min Cart Order" value={`₹${selectedPromo.minOrderSubtotal}`} variant="default" />
              <AdminStatBadge label="Times Claimed" value={`${selectedPromo.usedCount || 0} Uses`} variant="info" />
            </div>

            <AdminDetailSection title="Voucher Parameters" icon={<Tag className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <AdminDetailRow label="Coupon Code" value={selectedPromo.code} copyable />
                <AdminDetailRow label="Discount Type" value={selectedPromo.discountType.toUpperCase()} />
                <AdminDetailRow label="Minimum Cart Requirement" value={`₹${selectedPromo.minOrderSubtotal}`} />
                <AdminDetailRow label="Platform Status" value={(selectedPromo.status || 'active').toUpperCase()} />
              </div>
            </AdminDetailSection>
          </div>
        </AdminModal>
      )}

      {/* EDIT PROMO MODAL */}
      {selectedPromo && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedPromo(null); }}
          size="md"
          title="Edit Promotion Voucher"
          subtitle={`Modifying rules for ${selectedPromo.code}`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedPromo(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-coupon-form"
                disabled={editCouponMutation.isPending}
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {editCouponMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Voucher</span>
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
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Coupon Code *</label>
              <input
                type="text"
                required
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  {editForm.discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.discountValue}
                  onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Min Order (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.minOrderSubtotal}
                  onChange={(e) => setEditForm({ ...editForm, minOrderSubtotal: Number(e.target.value) })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-secondary/40 outline-none"
                />
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {/* DELETE DANGER MODAL */}
      {selectedPromo && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedPromo(null); }}
          onConfirm={() => deleteCouponMutation.mutate(selectedPromo.id)}
          isPending={deleteCouponMutation.isPending}
          title="Confirm Delete Coupon"
          entityName={selectedPromo.code}
          description={<span>Are you sure you want to deactivate and remove coupon <strong>{selectedPromo.code}</strong>?</span>}
          impacts={[
            'Students with this code in their cart will receive an expired voucher message at checkout.',
            'Historical order records where this coupon was applied will remain unaffected.',
          ]}
          confirmText="Delete Voucher"
        />
      )}
    </AdminLayout>
  );
}
