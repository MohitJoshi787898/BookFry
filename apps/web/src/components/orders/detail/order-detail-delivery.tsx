"use client";

import React from "react";
import { Order } from "@bookmarket/types";
import { parseAddress } from "@/lib/address-parser";
import { MapPin, ShieldCheck, RotateCcw, Headphones, CheckCircle2, User, Phone, Tag } from "lucide-react";

interface OrderDetailDeliveryProps {
  order: Order;
  onOpenReturnModal: () => void;
}

function isWithinReturnWindow(order: Order): boolean {
  if (order.status !== "delivered") return false;
  const deliveredEvent = [...order.timeline].reverse().find((e) => e.status === "delivered");
  const deliveredAt = deliveredEvent ? new Date(deliveredEvent.timestamp) : new Date(order.updatedAt);
  const windowMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - deliveredAt.getTime() <= windowMs;
}

export function OrderDetailDelivery({ order, onOpenReturnModal }: OrderDetailDeliveryProps) {
  const isReturnEligible = isWithinReturnWindow(order) && !order.returnRequest;
  const hasReturnRequest = !!order.returnRequest;
  const parsed = parseAddress(order.shippingAddress);

  return (
    <div className="space-y-6 font-sans">
      {/* Delivery Address Card */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5 mb-4">
          <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-secondary shrink-0" />
            <span>Shipping Address</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-black uppercase tracking-wider border border-secondary/20 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {parsed.label}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {/* Recipient Name & Phone */}
          <div className="space-y-1 bg-muted/40 p-3.5 rounded-2xl border border-border/40">
            <div className="flex items-center gap-2 font-bold text-foreground text-base">
              <User className="h-4 w-4 text-secondary shrink-0" />
              <span className="capitalize">{parsed.name}</span>
            </div>
            {parsed.phone && (
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-0.5">
                <Phone className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span>{parsed.phone}</span>
              </div>
            )}
          </div>

          {/* Street Address & City */}
          <div className="space-y-1 pt-1 text-muted-foreground">
            <p className="font-medium text-foreground text-sm flex items-start gap-2">
              <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <span>{parsed.street}</span>
            </p>
            <p className="pl-6 text-xs text-muted-foreground">
              {parsed.city}, {parsed.state} — <strong className="font-mono text-foreground font-bold">{parsed.zipCode}</strong>
            </p>
            <p className="pl-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest pt-0.5">
              {parsed.country}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Verified Campus Delivery Location</span>
          </div>
        </div>
      </div>

      {/* 7-Day Escrow & Protection Panel */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-foreground">
              BookFry 7-Day Campus Guarantee
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Your payment is held safely in BookFry Peer Escrow until delivery is verified.
            </p>
          </div>
        </div>

        {/* Existing Return Request Status */}
        {hasReturnRequest && order.returnRequest && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>Return Request Status</span>
              <span className="uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold">
                {order.returnRequest.status}
              </span>
            </div>
            <p className="text-muted-foreground">{order.returnRequest.reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isReturnEligible && (
            <button
              onClick={onOpenReturnModal}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Initiate 7-Day Return</span>
            </button>
          )}

          <a
            href="mailto:support@bookfry.com"
            className="w-full py-3 px-4 rounded-2xl border border-border/80 hover:bg-muted text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm min-h-[44px]"
          >
            <Headphones className="h-4 w-4 text-secondary" />
            <span>Contact Campus Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}

