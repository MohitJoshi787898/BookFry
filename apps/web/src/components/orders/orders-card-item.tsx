"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@bookmarket/types";
import {
  Calendar,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

interface OrdersCardItemProps {
  order: Order;
  onOpenReturnModal: (order: Order) => void;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  confirmed: "bg-brand/10 text-brand border-brand/30",
  shipped: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  refunded: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  return_requested: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  return_approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  return_rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Payment Pending",
  confirmed: "Order Confirmed",
  shipped: "Shipped in Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
};

function isWithinReturnWindow(order: Order): boolean {
  if (order.status !== "delivered") return false;
  const deliveredEvent = [...order.timeline].reverse().find((e) => e.status === "delivered");
  const deliveredAt = deliveredEvent ? new Date(deliveredEvent.timestamp) : new Date(order.updatedAt);
  const windowMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - deliveredAt.getTime() <= windowMs;
}

export function OrdersCardItem({ order, onOpenReturnModal }: OrdersCardItemProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const firstItem = order.items[0];
  const totalItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isReturnEligible = isWithinReturnWindow(order) && !order.returnRequest;

  return (
    <div className="group relative rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 hover-page-turn">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Order ID</span>
            <span className="font-mono text-xs sm:text-sm font-black text-foreground">{order.orderNumber}</span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3 text-secondary" />
            <span>Placed on {formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              STATUS_STYLE[order.status] ?? "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Main Order Content */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Book Covers Showcase */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative h-20 w-16 sm:h-24 sm:w-18 shrink-0 rounded-xl bg-muted border border-border/80 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/fox_reading_178491148655455.png"
              alt={firstItem?.title || "Book Cover"}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-secondary transition-colors">
              {firstItem?.title || "Academic Book"}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize px-2 py-0.5 rounded-md bg-muted font-bold text-foreground text-[10px]">
                {firstItem?.condition?.replace("_", " ") || "Good"}
              </span>
              <span>• Qty: {firstItem?.quantity || 1}</span>
              {order.items.length > 1 && (
                <span className="text-secondary font-bold text-[11px]">
                  +{order.items.length - 1} more book{order.items.length > 2 ? "s" : ""}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{totalItemCount} item{totalItemCount > 1 ? "s" : ""} • Peer Escrow Protected</span>
            </p>
          </div>
        </div>

        {/* Price & Primary CTA */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Total Paid</span>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
              ₹{order.total.toFixed(0)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {isReturnEligible && (
              <button
                onClick={() => onOpenReturnModal(order)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Return</span>
              </button>
            )}

            <Link
              href={`/account/orders/${order.id}`}
              className="px-4 py-2 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-extrabold tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
