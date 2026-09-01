'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';

export interface MobileCardDetail {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  mono?: boolean;
}

export interface AdminMobileCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  details?: MobileCardDetail[];
  actions?: React.ReactNode;
  statusNode?: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  avatarText?: string;
  avatarBg?: string;
}

export function AdminMobileCard({
  title,
  subtitle,
  badge,
  details = [],
  actions,
  statusNode,
  onClick,
  icon: Icon,
  avatarText,
  avatarBg = 'bg-secondary/15 text-secondary',
}: AdminMobileCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`p-4 rounded-2xl border border-border/80 bg-card shadow-xs transition-all font-sans space-y-3 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#FF9F2D]/40 active:bg-muted/40' : ''
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          {avatarText && (
            <div
              className={`h-9 w-9 rounded-xl ${avatarBg} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs`}
            >
              {avatarText}
            </div>
          )}
          {Icon && !avatarText && (
            <div className="h-9 w-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-foreground text-sm leading-snug truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge}
          {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground opacity-60" />}
        </div>
      </div>

      {/* Grid of Key-Value Details */}
      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs">
          {details.map((dt, idx) => (
            <div key={idx} className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/80 block">
                {dt.label}
              </span>
              <div
                className={`text-foreground font-semibold truncate ${
                  dt.mono ? 'font-mono' : ''
                }`}
              >
                {dt.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Status & Action Toolbar */}
      {(statusNode || actions) && (
        <div
          className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div>{statusNode}</div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      )}
    </motion.div>
  );
}

export default AdminMobileCard;
