import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatItemProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export function StatItem({ icon: Icon, value, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 text-left font-sans">
      <div className="h-9 w-9 rounded-full bg-background-subtle border border-border/50 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-secondary" />
      </div>
      <div>
        <span className="text-base sm:text-lg font-black text-brand tracking-tight dark:text-foreground">
          {value}
        </span>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export default StatItem;
