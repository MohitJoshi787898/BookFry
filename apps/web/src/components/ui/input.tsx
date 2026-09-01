import React, { useState } from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClear?: () => void;
  characterLimit?: number;
  floatingLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      loading = false,
      prefix,
      suffix,
      onClear,
      characterLimit,
      floatingLabel = false,
      disabled,
      required,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const uniqueId = React.useId();
    const inputId = id || uniqueId;

    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const isValEmpty = value === undefined || value === null || value === '';

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const hasRightContent = isPassword || onClear || rightIcon || loading || suffix;

    return (
      <div className="w-full flex flex-col space-y-1.5 font-sans">
        {label && !floatingLabel && (
          <label htmlFor={inputId} className="text-xs sm:text-sm font-semibold text-text-primary/90 select-none flex items-center gap-0.5">
            {label}
            {required && <span className="text-danger" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-stretch">
          {/* Prefix */}
          {prefix && (
            <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-border bg-muted text-text-secondary text-sm font-medium">
              {prefix}
            </span>
          )}

          {/* Wrapper */}
          <div className="relative flex-grow flex items-center">
            {leftIcon && (
              <span className="absolute left-3.5 text-text-muted flex items-center justify-center pointer-events-none z-10">
                {leftIcon}
              </span>
            )}

            <input
              id={inputId}
              ref={ref}
              type={currentType}
              disabled={disabled || loading}
              value={value}
              onChange={onChange}
              className={cn(
                'w-full bg-card text-text-primary border border-border/80 text-sm rounded-lg min-h-[48px] sm:min-h-[44px] py-2.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary disabled:opacity-50 disabled:bg-muted font-medium placeholder:text-text-muted',
                leftIcon ? 'pl-10' : 'pl-3.5',
                hasRightContent ? 'pr-10' : 'pr-3.5',
                error ? 'border-danger focus:ring-danger/30 focus:border-danger' : '',
                prefix && 'rounded-l-none',
                suffix && 'rounded-r-none',
                floatingLabel && 'pt-5 pb-1',
                className
              )}
              {...props}
            />

            {/* Floating label overlay */}
            {label && floatingLabel && (
              <label
                htmlFor={inputId}
                className={cn(
                  'absolute left-3.5 text-xs text-text-muted font-semibold pointer-events-none transition-all duration-150',
                  isValEmpty ? 'top-1/2 -translate-y-1/2 text-sm' : 'top-1.5 text-[11px] text-secondary font-bold'
                )}
              >
                {label}
                {required && <span className="text-danger ml-0.5">*</span>}
              </label>
            )}

            {/* Right Side Icons & Actions */}
            <div className="absolute right-3.5 flex items-center gap-1.5 z-10">
              {loading && <Loader2 className="h-4 w-4 text-text-muted animate-spin" />}
              {!loading && onClear && !isValEmpty && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-muted text-text-muted hover:text-text-primary transition-colors focus-ring"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {!loading && isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-full hover:bg-muted text-text-muted hover:text-text-primary transition-colors focus-ring"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              {!loading && !isPassword && rightIcon}
            </div>
          </div>

          {/* Suffix */}
          {suffix && (
            <span className="inline-flex items-center px-3.5 rounded-r-lg border border-l-0 border-border bg-muted text-text-secondary text-sm font-medium">
              {suffix}
            </span>
          )}
        </div>

        {/* Bottom Messages/Counters */}
        <div className="flex justify-between items-start gap-3 px-0.5 text-xs">
          {error ? (
            <p className="text-danger font-medium" id={`${inputId}-error`}>
              {error}
            </p>
          ) : helperText ? (
            <p className="text-text-muted">{helperText}</p>
          ) : (
            <span />
          )}

          {characterLimit && value !== undefined && typeof value === 'string' && (
            <span className={cn('text-text-muted shrink-0 font-mono', value.length > characterLimit ? 'text-danger font-bold' : '')}>
              {value.length}/{characterLimit}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
