'use client';

import React from 'react';
import { Store, ShieldCheck, History, CheckCircle2, XCircle } from 'lucide-react';
import { SettingAuditEntry } from '@bookmarket/types';

interface SellerAccessCardProps {
  sellerRegistrationEnabled: boolean;
  sellerLoginEnabled: boolean;
  auditLog?: SettingAuditEntry[];
  onToggleRegistration: () => void;
  onToggleLogin: () => void;
}

export function SellerAccessCard({
  sellerRegistrationEnabled,
  sellerLoginEnabled,
  auditLog = [],
  onToggleRegistration,
  onToggleLogin,
}: SellerAccessCardProps) {
  const sellerAuditEntries = auditLog
    .filter((entry) => entry.key.includes('seller'))
    .slice(-3)
    .reverse();

  return (
    <div className="border border-border/80 bg-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="font-serif text-base sm:text-lg font-bold text-foreground flex items-center space-x-2">
          <Store className="h-5 w-5 text-secondary" />
          <span>Seller Access &amp; Onboarding Controls</span>
        </h2>
        <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full border border-secondary/20">
          Soft Launch Flags
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle 1: Dedicated Seller Registration */}
        <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">Seller Registration</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    sellerRegistrationEnabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {sellerRegistrationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Controls whether new users can register specifically as dedicated sellers. When disabled, public seller registration forms and wizards are blocked on the server.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleRegistration}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                sellerRegistrationEnabled ? 'bg-secondary' : 'bg-muted-foreground/30'
              }`}
              role="switch"
              aria-checked={sellerRegistrationEnabled}
              aria-label="Toggle Seller Registration"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  sellerRegistrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 pt-2 border-t border-border/40">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
            <span>Buyer accounts can still list used textbooks via the Sell flow.</span>
          </div>
        </div>

        {/* Toggle 2: Seller Login */}
        <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">Seller Login</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    sellerLoginEnabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {sellerLoginEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Controls whether seller accounts can access the seller hub. When disabled, seller sign-in and seller workspace endpoints are rejected on the server.
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleLogin}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                sellerLoginEnabled ? 'bg-secondary' : 'bg-muted-foreground/30'
              }`}
              role="switch"
              aria-checked={sellerLoginEnabled}
              aria-label="Toggle Seller Login"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  sellerLoginEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 pt-2 border-t border-border/40">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
            <span>Existing seller records, listings, and order history are never deleted.</span>
          </div>
        </div>
      </div>

      {/* Audit History Snippet */}
      {sellerAuditEntries.length > 0 && (
        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground mb-2">
            <History className="h-3.5 w-3.5" />
            <span>Recent Access Policy Changes</span>
          </div>
          <div className="space-y-1.5">
            {sellerAuditEntries.map((audit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[10px] p-2 rounded-xl bg-muted/40 font-mono"
              >
                <div className="flex items-center gap-2">
                  {audit.newValue === true ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-amber-500" />
                  )}
                  <span className="font-bold text-foreground">{audit.key}</span>
                  <span className="text-muted-foreground">
                    changed from <strong className="text-foreground">{String(audit.oldValue)}</strong> to{' '}
                    <strong className="text-foreground">{String(audit.newValue)}</strong>
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(audit.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerAccessCard;
