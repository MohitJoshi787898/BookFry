import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TrustBarItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function TrustBarItem({ icon: Icon, title, description }: TrustBarItemProps) {
  return (
    <div className="flex items-center space-x-3.5 py-1">
      <div className="h-10 w-10 rounded-full bg-background-subtle border border-border/60 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-secondary" />
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-text-primary">{title}</h4>
        <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 font-medium">{description}</p>
      </div>
    </div>
  );
}

export default TrustBarItem;
