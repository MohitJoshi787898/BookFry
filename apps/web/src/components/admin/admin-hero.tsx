"use client";

import React from "react";
import { Sparkles, Activity } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  badge?: string;
  isPositive?: boolean;
}

interface AdminHeroProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  stats?: StatItem[];
  actions?: React.ReactNode;
}

export function AdminHero({
  title,
  subtitle,
  badgeText = "Executive Control Panel",
  stats,
  actions,
}: AdminHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3B5C] via-[#142F4A] to-[#0F2338] text-white p-5 sm:p-8 lg:p-10 shadow-2xl mb-8 border border-white/10 font-sans">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F26522]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#FF9900]/15 blur-3xl" />

      {/* Decorative Grid Mesh Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top Telemetry Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/20 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
            <span>{badgeText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Live Engine Telemetry Active</span>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Embedded Stats Bar */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                  <span>{st.label}</span>
                  {st.badge && (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        st.isPositive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {st.badge}
                    </span>
                  )}
                </div>
                <p className="font-mono text-base sm:text-xl font-black text-white">
                  {st.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
