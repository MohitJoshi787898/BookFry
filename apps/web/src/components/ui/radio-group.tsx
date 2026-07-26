import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  inline?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  inline = false,
  className,
}: RadioGroupProps) {
  const groupLabelId = React.useId();

  return (
    <div className="w-full flex flex-col space-y-1.5 font-sans" role="radiogroup" aria-labelledby={groupLabelId}>
      {label && (
        <span id={groupLabelId} className="text-xs font-bold text-text-secondary select-none flex items-center">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </span>
      )}

      <div className={cn('flex gap-4', inline ? 'flex-row flex-wrap items-center' : 'flex-col', className)}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-text-secondary',
                isOptionDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className="relative mt-0.5 shrink-0">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isOptionDisabled}
                  onChange={() => onChange?.(option.value)}
                  className="sr-only peer"
                />
                {/* Custom Circle */}
                <div
                  className={cn(
                    'h-4 w-4 rounded-full border border-border bg-card flex items-center justify-center transition-all peer-checked:border-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                    error ? 'border-danger' : '',
                    'peer-hover:border-secondary/60'
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-secondary scale-0 transition-transform peer-checked:scale-100" />
                </div>
              </div>
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>

      {/* Messaging */}
      {(error || helperText) && (
        <div className="text-[10px] px-0.5">
          {error ? (
            <p className="text-danger font-bold">{error}</p>
          ) : (
            <p className="text-text-muted">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RadioGroup;
