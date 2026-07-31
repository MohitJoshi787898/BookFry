"use client";

import React from "react";
import { Sparkles, ShoppingBag, Truck, CheckCircle2, TrendingUp } from "lucide-react";
import { Order } from "@bookmarket/types";

interface OrdersHeroHeaderProps {
  orders: Order[];
}

export function OrdersHeroHeader({ orders }: OrdersHeroHeaderProps) {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const activeShipments = orders.filter((o) =>
    ["pending", "confirmed", "shipped"].includes(o.status)
  ).length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl transition-all mb-8">
      {/* Hero Ambient Radial Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Motto Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3.5 py-1 text-xs font-bold text-secondary border border-secondary/20 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-secondary" />
          <span>क्योंकि.. पढ़ाई रुकनी नहीं चाहिए</span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-secondary" />
            Your Order History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl">
            Track active deliveries, manage P2P textbook orders, view detailed invoices, and initiate 7-day returns with 100% Peer Escrow guarantee.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="h-4 w-4 text-secondary" />
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground mt-1">{totalOrders}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Invested</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground mt-1">₹{totalSpent.toFixed(0)}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Delivered</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground mt-1">{deliveredCount}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Transit</span>
              <Truck className="h-4 w-4 text-secondary animate-bounce" />
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground mt-1">{activeShipments}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
