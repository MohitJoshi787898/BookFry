'use client';

import React from 'react';
import { UsedBookRequest } from '@bookmarket/types';
import {
  AdminDialog,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from './admin-dialog';
import {
  BookOpen,
  User,
  Store,
  Clock,
} from 'lucide-react';

interface UsedRequestDetailModalProps {
  request: UsedBookRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  seller_notified: 'Seller Notified',
  seller_contacted_buyer: 'Seller Contacted Buyer',
  accepted: 'Accepted',
  in_discussion: 'In Discussion',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const STATUS_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  requested: 'info',
  seller_notified: 'info',
  seller_contacted_buyer: 'default',
  accepted: 'success',
  in_discussion: 'warning',
  completed: 'success',
  declined: 'danger',
  cancelled: 'danger',
  expired: 'default',
};

export function UsedRequestDetailModal({
  request,
  isOpen,
  onClose,
}: UsedRequestDetailModalProps) {
  if (!request) return null;

  const statusVariant = STATUS_VARIANTS[request.status] || 'default';

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Used Book Request #${request.requestNumber}`}
      subtitle={`Created on ${new Date(request.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      icon={<BookOpen className="h-5 w-5 text-secondary" />}
      badge={
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20">
          {STATUS_LABELS[request.status] || request.status}
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-text-muted">
            Request ID: <span className="font-mono">{request.id}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-xs"
          >
            Close Request
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStatBadge
            label="Asking Price"
            value={`₹${request.price.toFixed(2)}`}
            variant="default"
          />
          <AdminStatBadge
            label="Book Condition"
            value={request.condition.replace('_', ' ').toUpperCase()}
            variant="info"
          />
          <AdminStatBadge
            label="Lifecycle Status"
            value={STATUS_LABELS[request.status] || request.status}
            variant={statusVariant}
          />
          <AdminStatBadge
            label="Verification"
            value="Encrypted P2P"
            variant="success"
          />
        </div>

        {/* 2-Column Split: Buyer & Seller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buyer Information */}
          <AdminDetailSection
            title="Buyer Profile"
            icon={<User className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border"
          >
            <div className="space-y-2">
              <AdminDetailRow
                label="Full Name"
                value={request.buyerContact?.name || 'Verified Buyer'}
              />
              <AdminDetailRow
                label="Email"
                value={request.buyerContact?.email || 'N/A'}
                copyable
              />
              {request.buyerContact?.phone && (
                <AdminDetailRow
                  label="Phone / WhatsApp"
                  value={request.buyerContact.phone}
                  copyable
                />
              )}
              {request.buyerContact?.preferredContactMethod && (
                <AdminDetailRow
                  label="Preferred Contact"
                  value={request.buyerContact.preferredContactMethod.toUpperCase()}
                />
              )}
            </div>
          </AdminDetailSection>

          {/* Seller Information */}
          <AdminDetailSection
            title="Target Seller"
            icon={<Store className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border"
          >
            <div className="space-y-2">
              <AdminDetailRow
                label="Store / Seller"
                value={request.sellerName || 'Campus Seller'}
              />
              <AdminDetailRow
                label="Seller ID"
                value={request.sellerId}
                copyable
              />
              {request.sellerCity && (
                <AdminDetailRow
                  label="Location"
                  value={`${request.sellerCity}, ${request.sellerState || ''}`}
                />
              )}
              <AdminDetailRow
                label="Safety Status"
                value="Verified Member"
              />
            </div>
          </AdminDetailSection>
        </div>

        {/* Book Details */}
        <AdminDetailSection
          title="Requested Book Details"
          icon={<BookOpen className="h-4 w-4" />}
        >
          <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-serif text-base font-bold text-text-primary">
                  {request.title}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5 font-mono">
                  Catalog ID: {request.catalogId || request.listingId}
                </p>
              </div>
              <span className="font-mono text-base font-black text-secondary shrink-0">
                ₹{request.price.toFixed(2)}
              </span>
            </div>

            {request.buyerContact?.note && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold uppercase text-text-muted block mb-1">
                  Buyer Note / Special Requests:
                </span>
                <p className="text-xs text-text-secondary italic bg-background p-3 rounded-xl border border-border">
                  &quot;{request.buyerContact.note}&quot;
                </p>
              </div>
            )}
          </div>
        </AdminDetailSection>

        {/* Operational Timeline */}
        <AdminDetailSection
          title="Marketplace P2P Progress Log"
          icon={<Clock className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
              <div className="h-2 w-2 rounded-full bg-secondary shrink-0" />
              <span className="font-bold text-text-primary">Request Created:</span>
              <span className="text-text-secondary">
                {new Date(request.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
            {request.updatedAt && request.updatedAt !== request.createdAt && (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
                <div className="h-2 w-2 rounded-full bg-success shrink-0" />
                <span className="font-bold text-text-primary">Last Status Update:</span>
                <span className="text-text-secondary">
                  {new Date(request.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </AdminDetailSection>
      </div>
    </AdminDialog>
  );
}
