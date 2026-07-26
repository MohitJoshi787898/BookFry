import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterLimit?: number;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      characterLimit,
      autoResize = false,
      rows = 3,
      value,
      onChange,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const textareaId = id || uniqueId;
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    // Support autoResize height calculation
    useEffect(() => {
      if (!autoResize) return;
      const el = localRef.current;
      if (!el) return;

      const adjustHeight = () => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      };

      adjustHeight();
      el.addEventListener('input', adjustHeight);
      return () => el.removeEventListener('input', adjustHeight);
    }, [autoResize, value]);

    // Handle combined ref
    const setRefs = (node: HTMLTextAreaElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className="w-full flex flex-col space-y-1.5 font-sans">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-text-secondary select-none flex items-center">
            {label}
            {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={setRefs}
          rows={rows}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full bg-slate-50/40 text-text-primary border border-border text-xs rounded-md px-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary disabled:opacity-50 disabled:bg-muted font-medium resize-y',
            error ? 'border-danger focus:ring-danger focus:border-danger' : '',
            className
          )}
          {...props}
        />

        <div className="flex justify-between items-start gap-3 px-0.5 text-[10px]">
          {error ? (
            <p className="text-danger font-bold">{error}</p>
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

Textarea.displayName = 'Textarea';
export default Textarea;
