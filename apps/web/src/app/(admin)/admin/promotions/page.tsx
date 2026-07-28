'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Tag, Plus, ShieldAlert, Trash2 } from 'lucide-react';

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

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/coupons/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
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
      header: 'Usage Metrics',
      cell: (p) => (
        <span className="text-xs text-text-secondary font-mono">
          {p.usedCount || 0} / {p.maxUses || 1000} claimed
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => (
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            p.status === 'active'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-text-muted/10 text-text-muted border border-border'
          }`}
        >
          <span>{p.status}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (p) => (
        <button
          onClick={() => deleteCouponMutation.mutate(p.id)}
          className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
          title="Delete Coupon"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
            Create and manage promotional discount coupons for student purchases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
        {/* Create Coupon Form */}
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm space-y-4 font-sans self-start">
          <h3 className="font-serif text-lg font-bold text-text-primary border-b border-border pb-3">
            Create Promo Coupon
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. WELCOME100"
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary uppercase font-mono font-bold focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-text-primary block">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percentage' | 'flat')}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary font-medium"
                >
                  <option value="flat">Flat ₹ OFF</option>
                  <option value="percentage">Percentage % OFF</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-primary block">Value</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Min Order Subtotal (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border bg-background rounded-lg text-text-primary font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={createCouponMutation.isPending}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}</span>
            </button>
          </form>
        </div>

        {/* Coupons Table */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="h-64 border border-border bg-card rounded-xl animate-pulse" />
          ) : (
            <AdminDataTable title="Active Promo Coupons" columns={columns} data={promos} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
