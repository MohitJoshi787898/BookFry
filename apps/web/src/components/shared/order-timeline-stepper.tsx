'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck } from 'lucide-react';

interface TimelineEvent {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string;
  note?: string;
  timestamp: string | Date;
}

interface OrderTimelineStepperProps {
  currentStatus: string;
  timeline?: TimelineEvent[];
}

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Payment Verified', icon: ShieldCheck },
  { key: 'shipped', label: 'Dispatched & Handed to Courier', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export function OrderTimelineStepper({ currentStatus, timeline = [] }: OrderTimelineStepperProps) {
  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus.toLowerCase() === 'cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4 space-y-4 font-sans">
      <div className="relative flex items-center justify-between">
        {/* Progress Connector Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-border z-0">
          <div
            className="h-full bg-secondary transition-all duration-500"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const IconComp = step.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-secondary text-secondary-foreground shadow-sm ring-4 ring-secondary/10'
                    : 'bg-card border-2 border-border text-muted-foreground'
                }`}
              >
                <IconComp className="h-4 w-4" />
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-xs font-bold text-center max-w-[90px] ${
                  isCurrent ? 'text-secondary' : isCompleted ? 'text-text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log Snippets */}
      {timeline.length > 0 && (
        <div className="pt-2 border-t border-border/40 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tracking Log</p>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] text-text-secondary">
                <span className="font-medium text-text-primary">
                  {event.note || event.status}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(event.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTimelineStepper;
