"use client";

import React, { forwardRef, useId } from "react";
import type { LucideIcon } from "lucide-react";

type IconInputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  error?: string;
  rightSlot?: React.ReactNode;
  headerSlot?: React.ReactNode;
};

/**
 * Shared icon + label + error input, used for every text field in auth
 * forms (email, password, and future fields like name/phone). Extracted
 * because email and password previously repeated the same icon/border/
 * error markup with the only real difference being the trailing
 * show/hide-password button — that difference is now just `rightSlot`.
 */
export const IconInputField = forwardRef<HTMLInputElement, IconInputFieldProps>(
  (
    { label, icon: Icon, error, rightSlot, headerSlot, id, ...inputProps },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-text-primary"
          >
            {label}
          </label>
          {headerSlot}
        </div>
        <div className="relative">
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`focus-ring w-full rounded-md border bg-surface py-2.5 pl-9 text-sm text-text-primary placeholder:text-text-muted ${
              rightSlot ? "pr-10" : "pr-3"
            } ${error ? "border-danger" : "border-border"}`}
            {...inputProps}
          />
          {rightSlot}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

IconInputField.displayName = "IconInputField";
