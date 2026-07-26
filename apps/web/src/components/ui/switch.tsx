import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({ checked, onChange, label, disabled = false, id, className }: SwitchProps) {
  const uniqueId = React.useId();
  const switchId = id || uniqueId;

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none text-xs font-semibold text-text-secondary',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        {/* Track */}
        <div
          className={cn(
            'w-8 h-4.5 bg-border rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            'peer-checked:bg-[#F26522] peer-hover:opacity-90'
          )}
        />
        {/* Thumb */}
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-xs transition-transform duration-200 ease-out',
            checked ? 'translate-x-3.5' : 'translate-x-0'
          )}
        />
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}

export default Switch;
