import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, disabled, id, required, ...props }, ref) => {
    const uniqueId = React.useId();
    const checkboxId = id || uniqueId;

    return (
      <div className="flex flex-col space-y-1 font-sans">
        <label htmlFor={checkboxId} className={cn('inline-flex items-start gap-2.5 cursor-pointer select-none text-xs font-semibold text-text-secondary', disabled && 'cursor-not-allowed opacity-50', className)}>
          <div className="relative mt-0.5 shrink-0">
            <input
              id={checkboxId}
              type="checkbox"
              ref={ref}
              disabled={disabled}
              className="sr-only peer"
              required={required}
              {...props}
            />
            {/* Custom Box */}
            <div
              className={cn(
                'h-4 w-4 rounded border border-border bg-card flex items-center justify-center transition-all peer-checked:bg-secondary peer-checked:border-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                error ? 'border-danger' : '',
                'peer-hover:border-secondary/60'
              )}
            >
              <Check className="h-3 w-3 text-white stroke-[3px] scale-0 transition-transform peer-checked:scale-100" />
            </div>
          </div>
          {label && (
            <span>
              {label}
              {required && <span className="text-danger ml-0.5">*</span>}
            </span>
          )}
        </label>

        {/* Messaging */}
        {(error || helperText) && (
          <div className="pl-6.5 text-[10px]">
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
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
