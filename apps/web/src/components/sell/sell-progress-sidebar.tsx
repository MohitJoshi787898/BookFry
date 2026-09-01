'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface SellProgressSidebarProps {
  steps: Step[];
  currentStep: number;
  onSelectStep: (stepId: number) => void;
}

export function SellProgressSidebar({ steps, currentStep, onSelectStep }: SellProgressSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 shrink-0 bg-card border border-border/80 rounded-3xl p-6 shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-xs uppercase tracking-wider font-black text-foreground">
          Listing Progress
        </h3>
        
        <div className="h-7 w-7 rounded-full border-2 border-secondary flex items-center justify-center font-bold text-xs text-secondary font-mono select-none">
          {currentStep}/5
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {steps.map((step) => {
          const IconComp = step.icon;
          const active = currentStep === step.id;
          const completed = currentStep > step.id;
          
          return (
            <div
              key={step.id}
              onClick={() => completed && onSelectStep(step.id)}
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all duration-150 ${
                active
                  ? 'bg-secondary/10 text-secondary font-black border-l-4 border-secondary shadow-xs'
                  : completed
                  ? 'cursor-pointer text-secondary hover:bg-muted font-bold'
                  : 'text-muted-foreground opacity-70 font-semibold'
              }`}
            >
              <IconComp className="h-4 w-4 shrink-0" />
              <span>{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Seller Protection Widget */}
      <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground space-y-2.5 font-sans">
        <span className="flex items-center gap-1.5 font-black text-foreground uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 text-secondary" /> Seller Protection
        </span>
        <p className="leading-relaxed font-medium">
          Instant payouts, buyer verification, and zero listing fee to post.
        </p>
        <Link href="/faq" className="text-secondary font-bold hover:underline flex items-center gap-1">
          <span>Learn more</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}

export default SellProgressSidebar;
