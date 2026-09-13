'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Activity, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface RoleHeroStatItem {
  label: string;
  value: string | number;
  badge?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
}

export interface RoleHeroProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  stats?: RoleHeroStatItem[];
  actions?: React.ReactNode;
  showMascot?: boolean;
  mascotPose?: 'reading' | 'pointing' | 'floating';
  accentColor?: string;
}

export function RoleHero({
  title,
  subtitle,
  badgeText = "क्योंकि.. पढ़ाई रुकनी नहीं चाहिए",
  badgeIcon: BadgeIcon = Sparkles,
  stats,
  actions,
  showMascot = true,
  mascotPose = 'reading',
}: RoleHeroProps) {
  const mascotSrc = {
    reading: '/assets/bookfry/bookfry-fox-reading.webp',
    pointing: '/assets/bookfry/bookfry-fox-pointing.webp',
    floating: '/assets/bookfry/bookfry-fox-floating.webp',
  }[mascotPose];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border text-foreground p-5 sm:p-6 lg:p-7 shadow-xs mb-6 font-sans">
      {/* Ambient Lighting Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative z-10 space-y-5">
        {/* Top Status & Telemetry Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/12 border border-secondary/25 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-secondary shadow-xs">
            <BadgeIcon className="h-3.5 w-3.5 text-secondary animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Active Online</span>
              <span className="sm:hidden">Active</span>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>

        {/* Title, Subtitle & Mascot Greeting */}
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showMascot && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 hidden md:block drop-shadow-md"
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

        {/* Embedded Stats Row */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 border-t border-border">
            {stats.map((st, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-card border border-border p-3 sm:p-3.5 shadow-2xs transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
                  <span className="truncate">{st.label}</span>
                  {st.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        st.isPositive !== false
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {st.badge}
                    </span>
                  )}
                </div>
                <p className="font-mono text-base sm:text-xl font-bold text-foreground">
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

export default RoleHero;
