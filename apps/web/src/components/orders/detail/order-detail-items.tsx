"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Order } from "@bookmarket/types";
import { BookOpen, ShoppingBag, ShieldCheck, Tag } from "lucide-react";

interface OrderDetailItemsProps {
  order: Order;
}

export function OrderDetailItems({ order }: OrderDetailItemsProps) {
  return (
    <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xl mb-8 font-sans">
      <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-5 mb-6 gap-3">
        <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-secondary" />
          <span>Purchased Books ({order.items.length})</span>
        </h2>
        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Peer Escrow Guaranteed
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Book Info */}
            <div className="flex items-start gap-4 sm:gap-5 flex-grow">
              <div className="relative h-28 w-20 sm:h-32 sm:w-24 rounded-2xl bg-muted border border-border/80 overflow-hidden shrink-0 shadow-md group">
                <Image
                  src="/fox_reading_178491148655455.png"
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2 flex-grow">
                <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="capitalize px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary font-extrabold text-[11px] border border-secondary/20 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {item.condition?.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground font-medium px-2.5 py-1 rounded-lg bg-muted border border-border/60">
                    Qty: <strong className="text-foreground">{item.quantity}</strong>
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Verified Campus Peer Seller</span>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Item Total</span>
                <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </p>
                {item.quantity > 1 && (
                  <span className="text-[11px] text-muted-foreground font-mono block">
                    (₹{item.price.toFixed(0)} each)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/books"
                  className="px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Buy Again</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

