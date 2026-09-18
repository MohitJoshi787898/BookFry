'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Activity, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AdminHeroStatItem {
  label: string;
  value: string | number;
  badge?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
}

export interface AdminHeroProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  stats?: AdminHeroStatItem[];
  actions?: React.ReactNode;
  showMascot?: boolean;
  mascotPose?: 'reading' | 'pointing' | 'floating';
}

export function AdminHero({
  title,
  subtitle,
  badgeText = 'BookFry Administration',
  stats,
  actions,
  showMascot = true,
  mascotPose = 'reading',
}: AdminHeroProps) {
  const mascotSrc = {
    reading: '/assets/bookfry/bookfry-fox-reading.webp',
    pointing: '/assets/bookfry/bookfry-fox-pointing.webp',
    floating: '/assets/bookfry/bookfry-fox-floating.webp',
  }[mascotPose];

  return (
    <div className="dark-section relative overflow-hidden rounded-3xl bg-primary/95 border border-white/10 text-white p-5 sm:p-7 lg:p-8 shadow-2xl mb-6 font-sans">
      {/* Background Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/60 blur-3xl"
      />

      {/* Decorative Grid Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]"
      />

      <div className="relative z-10 space-y-5">
        {/* Top Telemetry & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 border border-secondary/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Engine Active</span>
              <span className="sm:hidden">Active</span>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Hero Title, Subtitle, & Mascot Greeting */}
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showMascot && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 hidden md:block drop-shadow-xl"
            >
              <Image
                src={mascotSrc}
                alt="BookFry Mascot"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </motion.div>
          )}
        </div>

        {/* Embedded Stats Bar */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 border-t border-white/10">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-3.5 backdrop-blur-md transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold mb-1">
                  <span className="truncate">{st.label}</span>
                  {st.badge && (
                    <span
                      className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                        st.isPositive !== false
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {st.badge}
                    </span>
                  )}
                </div>
                <p className="font-mono text-base sm:text-xl font-extrabold text-white">
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

export default AdminHero;
