'use client';

import React from 'react';
import { UsedBookRequest } from '@bookmarket/types';
import {
  AdminModal,
  AdminDetailSection,
  AdminDetailRow,
  AdminStatBadge,
} from './admin-modal';
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
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Used Book Inquiry #${request.requestNumber}`}
      subtitle={`Created on ${new Date(request.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`}
      icon={<BookOpen className="h-5 w-5 text-secondary" />}
      badge={
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary border border-secondary/25">
          {STATUS_LABELS[request.status] || request.status}
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full font-sans">
          <p className="text-xs text-muted-foreground">
            Request ID: <span className="font-mono font-bold text-foreground">{request.id}</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
          >
            Close Request
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStatBadge
            label="Agreed Price"
            value={`₹${request.price.toFixed(2)}`}
            variant="default"
          />
          <AdminStatBadge
            label="Condition"
            value={(request.condition || 'good').replace('_', ' ').toUpperCase()}
            variant="info"
          />
          <AdminStatBadge
            label="Negotiation"
            value={STATUS_LABELS[request.status]?.toUpperCase() || request.status.toUpperCase()}
            variant={statusVariant}
          />
          <AdminStatBadge
            label="Escrow Model"
            value="P2P Handshake"
            variant="default"
          />
        </div>

        {/* Book Details */}
        <AdminDetailSection title="Requested Textbook" icon={<BookOpen className="h-4 w-4" />}>
          <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
            <AdminDetailRow label="Book Title" value={request.title} />
            <AdminDetailRow
              label="Quality Grade"
              value={(request.condition || 'good').replace('_', ' ').toUpperCase()}
            />
            <AdminDetailRow
              label="Listing ID"
              value={request.listingId || 'N/A'}
              copyable
            />
          </div>
        </AdminDetailSection>

        {/* 2-Column Split: Buyer & Seller Identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminDetailSection
            title="Student Buyer Information"
            icon={<User className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border/80"
          >
            <div className="space-y-2">
              <AdminDetailRow
                label="Full Name"
                value={request.buyerContact?.name || 'Anonymous Student'}
              />
              <AdminDetailRow
                label="Email"
                value={request.buyerContact?.email || 'N/A'}
                copyable
              />
              {request.buyerContact?.phone && (
                <AdminDetailRow
                  label="Phone"
                  value={request.buyerContact.phone}
                  copyable
                />
              )}
              {request.buyerContact?.whatsappPhone && (
                <AdminDetailRow
                  label="WhatsApp"
                  value={request.buyerContact.whatsappPhone}
                  copyable
                />
              )}
            </div>
          </AdminDetailSection>

          <AdminDetailSection
            title="Seller Store Information"
            icon={<Store className="h-4 w-4" />}
            className="bg-muted/30 p-4 rounded-2xl border border-border/80"
          >
            <div className="space-y-2">
              <AdminDetailRow
                label="Seller Name"
                value={request.sellerName || 'Verified Campus Seller'}
              />
              {request.sellerCity && (
                <AdminDetailRow
                  label="Campus / City"
                  value={`${request.sellerCity}${request.sellerState ? `, ${request.sellerState}` : ''}`}
                />
              )}
              <AdminDetailRow
                label="Seller ID"
                value={request.sellerId}
                copyable
              />
            </div>
          </AdminDetailSection>
        </div>

        {/* Negotiation Timeline */}
        {request.timeline && request.timeline.length > 0 && (
          <AdminDetailSection
            title="Negotiation Activity Log"
            icon={<Clock className="h-4 w-4" />}
          >
            <div className="relative pl-5 border-l-2 border-secondary/30 space-y-4 ml-2 pt-1">
              {[...request.timeline].reverse().map((event, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-secondary border-2 border-card shadow-xs" />
                  <p className="text-xs font-bold text-foreground capitalize">
                    {STATUS_LABELS[event.status] || event.status.replace(/_/g, ' ')}
                  </p>
                  {event.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                  )}
                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-medium">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </AdminDetailSection>
        )}
      </div>
    </AdminModal>
  );
}

export default UsedRequestDetailModal;
