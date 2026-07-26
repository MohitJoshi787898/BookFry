import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from './card';

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-border/50 mb-6 font-sans', className)}>
      <div>
        <h1 className="font-serif text-xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-text-muted font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function QuickActions({
  title = 'Quick Actions',
  actions,
  className,
}: {
  title?: string;
  actions: {
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  }[];
  className?: string;
}) {
  return (
    <Card className={cn('font-sans', className)}>
      <CardHeader className="pb-3.5 border-b border-border/20">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-secondary font-sans">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-2 gap-3">
        {actions.map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-border/60 hover:border-secondary/60 hover:bg-slate-50/20 active:scale-95 transition-all text-center gap-1.5 focus:outline-none"
          >
            <span className="text-secondary shrink-0">{act.icon}</span>
            <span className="text-[10px] font-bold text-text-primary leading-tight">
              {act.label}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivityList({
  title = 'Recent Activity',
  activities,
  className,
}: {
  title?: string;
  activities: {
    title: string;
    time: string;
    icon?: React.ReactNode;
    description?: string;
  }[];
  className?: string;
}) {
  return (
    <Card className={cn('font-sans', className)}>
      <CardHeader className="pb-3 border-b border-border/20">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-secondary font-sans">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 divide-y divide-border/30">
        {activities.map((act, index) => (
          <div key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0 font-sans text-xs">
            {act.icon && (
              <div className="h-7 w-7 rounded-full bg-slate-50 border border-border flex items-center justify-center text-text-secondary shrink-0">
                {act.icon}
              </div>
            )}
            <div className="flex-grow space-y-0.5">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-bold text-text-primary">{act.title}</span>
                <span className="text-[9px] text-text-muted font-mono shrink-0">{act.time}</span>
              </div>
              {act.description && (
                <p className="text-[10px] text-text-muted font-medium">{act.description}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
export default DashboardHeader;
