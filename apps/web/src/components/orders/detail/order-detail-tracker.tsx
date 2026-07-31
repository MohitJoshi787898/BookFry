"use client";

import React from "react";
import { Order } from "@bookmarket/types";
import { CheckCircle2, Clock, Truck, Package, Home, AlertCircle, Check } from "lucide-react";

interface OrderDetailTrackerProps {
  order: Order;
}

export function OrderDetailTracker({ order }: OrderDetailTrackerProps) {
  const steps = [
    { key: "pending", label: "Order Placed", desc: "Payment verified via Peer Escrow", icon: Package },
    { key: "confirmed", label: "Confirmed", desc: "Seller packed and confirmed book", icon: CheckCircle2 },
    { key: "shipped", label: "In Transit", desc: "Shipped via campus delivery network", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Handed over & escrow unlocked", icon: Home },
  ];

  const statusOrder = ["pending", "confirmed", "shipped", "delivered"];
  const isCancelled = ["cancelled", "refunded"].includes(order.status);
  const currentIndex = statusOrder.indexOf(order.status);

  if (isCancelled) {
    return (
      <div className="rounded-3xl bg-rose-500/10 border border-rose-500/30 p-5 sm:p-8 mb-6 font-sans shadow-lg">
        <div className="flex items-center gap-4 text-rose-600 dark:text-rose-400">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold">Order Cancelled / Refunded</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              This order was cancelled. Escrow payment funds have been returned to your original payment method.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border/80 p-5 sm:p-8 shadow-xl mb-6 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-secondary" />
          <span>Fulfillment Status</span>
        </h2>
        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Tracking
        </span>
      </div>

      {/* Desktop Horizontal Tracker View (sm and above) */}
      <div className="hidden sm:block relative my-4">
        <div className="absolute top-6 left-12 right-12 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary via-brand to-emerald-500 transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentIndex >= idx;
            const isCurrent = currentIndex === idx;

            return (
              <div key={step.key} className="flex flex-col items-center text-center gap-3">
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 scale-105 ring-4 ring-secondary/20"
                      : "bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <p
                    className={`text-sm font-bold ${
                      isCurrent
                        ? "text-secondary font-black"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {isCompleted ? (isCurrent ? "In Progress" : "Completed") : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Native Vertical Timeline View (sm:hidden) */}
      <div className="block sm:hidden space-y-6 relative pl-3 py-2">
        {/* Connecting Vertical Line */}
        <div className="absolute top-4 bottom-4 left-[1.35rem] w-0.5 bg-muted" />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;

          return (
            <div key={step.key} className="flex items-start gap-4 relative z-10">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isCompleted
                    ? "bg-secondary text-secondary-foreground shadow-md ring-2 ring-secondary/20 scale-105"
                    : "bg-card text-muted-foreground border border-border/80"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="space-y-0.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-secondary font-black"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold uppercase border border-secondary/20">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest Timeline Event Note */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/60 flex items-start gap-3 bg-muted/40 p-3.5 sm:p-4 rounded-2xl border border-border/40">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-foreground">Latest Update: </span>
            <span className="text-muted-foreground">
              {order.timeline[order.timeline.length - 1].note ||
                `Status updated to ${order.status.replace("_", " ")}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


