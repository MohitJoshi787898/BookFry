"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { User, Order } from "@bookmarket/types";
import { Camera, Shield, Sparkles, ShoppingBag, Heart, MapPin, Tag, Edit3, Loader2, Calendar } from "lucide-react";

interface ProfileHeroProps {
  profile: User | undefined;
  recentOrders: Order[] | undefined;
  avatarPreview: string;
  isUploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditProfileClick: () => void;
}

type ProfileWithWishlist = User & {
  wishlist?: Array<unknown>;
};

export function ProfileHero({
  profile,
  recentOrders,
  avatarPreview,
  isUploadingAvatar,
  onAvatarUpload,
  onEditProfileClick,
}: ProfileHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
      })
    : "Recently";

  const ordersCount = recentOrders?.length ?? 0;
  const wishlistCount = ((profile as ProfileWithWishlist)?.wishlist?.length ?? 0) as number;
  const addressCount = profile?.addresses?.length ?? 0;

  const roleName = profile?.roles?.includes("admin")
    ? "Admin"
    : profile?.roles?.includes("seller")
    ? "Campus Seller"
    : "Campus Member";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#142F4A] to-[#0F2338] text-white p-5 sm:p-8 lg:p-10 shadow-2xl mb-8 border border-white/10">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F26522]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#FF9900]/15 blur-3xl" />

      {/* Decorative Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top Badge & Edit Profile CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>BookFry Verified Campus Member</span>
          </div>

          <button
            onClick={onEditProfileClick}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[#F26522] hover:bg-[#D64E0F] text-xs font-bold text-white transition-all shadow-md shadow-[#F26522]/25 active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* User Info Header Block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 border-b border-white/10 pb-6 sm:pb-8">
          {/* Avatar with Camera Button */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 relative group">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={profile?.name || "Avatar"}
                  fill
                  className="object-cover"
                  unoptimized={avatarPreview.startsWith("data:")}
                />
              ) : (
                <div className="w-full h-full bg-[#F26522]/20 text-[#F26522] flex items-center justify-center font-black text-3xl font-serif">
                  {profile?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            {/* Camera trigger */}
            <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-[#F26522] text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-all border-2 border-slate-900 active:scale-95">
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          {/* User Details */}
          <div className="space-y-2 text-center sm:text-left flex-grow">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {profile?.name}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300 border border-white/20">
                {roleName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              {profile?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#F26522]" />
                Member since {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Shield className="h-3.5 w-3.5" />
                Escrow Protected Account
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Profile Stat Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <ShoppingBag className="h-3.5 w-3.5 text-[#F26522]" />
              <span>Total Orders</span>
            </div>
            <p className="font-mono text-lg sm:text-2xl font-black text-white">
              {ordersCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span>Saved Wishlist</span>
            </div>
            <p className="font-mono text-lg sm:text-2xl font-black text-white">
              {wishlistCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <MapPin className="h-3.5 w-3.5 text-[#FF9900]" />
              <span>Addresses</span>
            </div>
            <p className="font-mono text-lg sm:text-2xl font-black text-white">
              {addressCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              <span>Peer Escrow</span>
            </div>
            <p className="font-sans text-xs sm:text-base font-bold text-emerald-300">
              Verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
