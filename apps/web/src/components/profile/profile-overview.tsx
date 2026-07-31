"use client";

import React from "react";
import Link from "next/link";
import { User, Order } from "@bookmarket/types";
import { Edit3, Mail, Phone, Package, ChevronRight, Check, X, Loader2 } from "lucide-react";

interface ProfileOverviewProps {
  profile: User | undefined;
  recentOrders: Order[] | undefined;
  isEditingProfile: boolean;
  name: string;
  phone: string;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  setIsEditingProfile: (v: boolean) => void;
  onProfileSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

export function ProfileOverview({
  profile,
  recentOrders,
  isEditingProfile,
  name,
  phone,
  setName,
  setPhone,
  setIsEditingProfile,
  onProfileSubmit,
  isUpdating,
}: ProfileOverviewProps) {
  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your personal information, saved shipping addresses, and peer escrow activity.
            </p>
          </div>

          <div className="hidden sm:flex items-end gap-1.5 pb-1 opacity-80">
            {["bg-[#F26522]", "bg-[#1A3B5C]", "bg-[#FF9900]", "bg-emerald-600"].map((cls, i) => (
              <div
                key={i}
                className={`${cls} rounded-sm shadow-sm`}
                style={{ height: `${28 + i * 8}px`, width: "12px" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-4">
          <h3 className="font-serif text-lg font-bold text-foreground">Personal Details</h3>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/80 hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-95 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5 text-secondary" />
              <span>Edit Info</span>
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={onProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-md shadow-[#F26522]/20 active:scale-95 disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save Changes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  if (profile) {
                    setName(profile.name);
                    setPhone(profile.phone || "");
                  }
                }}
                className="px-4 py-2.5 border border-border text-muted-foreground hover:bg-muted rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-foreground truncate">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-bold text-foreground font-mono">
                  {profile?.phone || <span className="italic text-muted-foreground text-xs">Not added</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders Preview Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-4">
          <h3 className="font-serif text-lg font-bold text-foreground">Recent Orders</h3>
          <Link
            href="/account/orders"
            className="text-xs font-extrabold text-secondary hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">No orders placed yet</p>
            <Link
              href="/books"
              className="inline-block px-5 py-2.5 bg-secondary text-white font-bold rounded-2xl text-xs hover:bg-[#D64E0F] transition-all shadow-md shadow-secondary/20"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order: Order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card hover:bg-muted/40 transition-all active:scale-98 group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.items?.length ?? 0} {order.items?.length === 1 ? "book" : "books"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-mono font-black text-foreground">
                      ₹{order.total.toFixed(0)}
                    </p>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {order.status}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
