'use client';

import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocationStore } from '@/stores/location.store';

interface NavbarLocationButtonProps {
  variant?: 'desktop' | 'compact';
  className?: string;
}

export function NavbarLocationButton({
  variant = 'desktop',
  className = '',
}: NavbarLocationButtonProps) {
  const { locationName, setModalOpen } = useLocationStore();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label={`Delivery location: ${locationName}. Click to change`}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/80 text-foreground text-xs font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${className}`}
      >
        <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
        <span className="truncate max-w-[130px] font-semibold text-[11px] text-foreground">
          {locationName}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      aria-label={`Deliver to: ${locationName}. Click to change location`}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 hover:border-secondary/40 bg-card/60 hover:bg-muted/60 transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary shrink-0 ${className}`}
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/10 text-secondary shrink-0 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
        <MapPin className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0 pr-1 leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Deliver to
        </span>
        <span className="text-xs font-extrabold text-foreground truncate max-w-[110px] xl:max-w-[150px]">
          {locationName}
        </span>
      </div>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
    </button>
  );
}

export default NavbarLocationButton;
