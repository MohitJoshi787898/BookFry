"use client";

import React from "react";
import { User, Address } from "@bookmarket/types";
import { parseAddress } from "@/lib/address-parser";
import { MapPin, Plus, Trash2, Check, Loader2, Compass, AlertCircle, X, Tag, Phone, User as UserIcon } from "lucide-react";

interface ProfileAddressesProps {
  profile: User | undefined;
  showAddressForm: boolean;
  setShowAddressForm: (v: boolean) => void;
  street: string;
  city: string;
  addrState: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  isDetectingLocation: boolean;
  locationError: string;
  setStreet: (v: string) => void;
  setCity: (v: string) => void;
  setAddrState: (v: string) => void;
  setZipCode: (v: string) => void;
  setCountry: (v: string) => void;
  setIsDefault: (v: boolean) => void;
  onDetectLocation: () => void;
  onAddressSubmit: (e: React.FormEvent) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
  deletingId?: string;
  settingDefaultId?: string;
  resetAddressForm: () => void;
}

export function ProfileAddresses({
  profile,
  showAddressForm,
  setShowAddressForm,
  street,
  city,
  addrState,
  zipCode,
  country,
  isDefault,
  isDetectingLocation,
  locationError,
  setStreet,
  setCity,
  setAddrState,
  setZipCode,
  setCountry,
  setIsDefault,
  onDetectLocation,
  onAddressSubmit,
  onDeleteAddress,
  onSetDefaultAddress,
  isDeleting,
  isSettingDefault,
  deletingId,
  settingDefaultId,
  resetAddressForm,
}: ProfileAddressesProps) {
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">Shipping Addresses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your saved delivery destinations</p>
        </div>

        {!showAddressForm && (
          <button
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-[#F26522]/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Address Form */}
      {showAddressForm && (
        <form onSubmit={onAddressSubmit} className="p-5 sm:p-6 rounded-3xl border border-secondary/30 bg-secondary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-foreground">New Shipping Destination</h3>
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isDetectingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Compass className="h-3.5 w-3.5" />}
              <span>{isDetectingLocation ? "Detecting..." : "Auto-detect GPS"}</span>
            </button>
          </div>

          {locationError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">Street Address *</label>
            <input
              type="text"
              placeholder="[Home] Full Name (Phone: XXXXX) - House no., Street, Area"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">City *</label>
              <input
                type="text"
                placeholder="New Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">State *</label>
              <input
                type="text"
                placeholder="Delhi"
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Pincode *</label>
              <input
                type="text"
                placeholder="110001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border/80 bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-secondary focus:ring-secondary h-4 w-4"
            />
            <span className="text-xs font-bold text-foreground">Set as default shipping address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-md shadow-[#F26522]/20 active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>Save Address</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddressForm(false);
                resetAddressForm();
              }}
              className="px-4 py-2.5 border border-border text-muted-foreground hover:bg-muted rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      {profile?.addresses && profile.addresses.length > 0 ? (
        <div className="space-y-4">
          {profile.addresses.map((address: Address) => {
            const parsed = parseAddress(address);

            return (
              <div
                key={address._id}
                className={`relative rounded-3xl border p-5 transition-all duration-200 shadow-sm ${
                  address.isDefault
                    ? "border-secondary/40 bg-secondary/5"
                    : "border-border/80 bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-secondary" />
                        {parsed.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider border border-secondary/20 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {parsed.label}
                      </span>
                      {address.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>

                    {parsed.phone && (
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-secondary" />
                        <span>{parsed.phone}</span>
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                      <p className="font-medium text-foreground flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                        <span>{parsed.street}</span>
                      </p>
                      <p className="pl-6 text-muted-foreground">
                        {parsed.city}, {parsed.state} — <strong className="font-mono text-foreground">{parsed.zipCode}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!address.isDefault && (
                      <button
                        onClick={() => onSetDefaultAddress(address._id!)}
                        disabled={isSettingDefault && settingDefaultId === address._id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-all disabled:opacity-50 active:scale-95"
                      >
                        {isSettingDefault && settingDefaultId === address._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Set Default"
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteAddress(address._id!)}
                      disabled={isDeleting && deletingId === address._id}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:border-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50 active:scale-95"
                      title="Delete Address"
                    >
                      {isDeleting && deletingId === address._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !showAddressForm ? (
        <div className="text-center py-14 space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-bold text-foreground">No shipping addresses saved</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Add a delivery address to complete order checkout faster.
          </p>
          <button
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-[#F26522]/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Address</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
