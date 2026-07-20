'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'One number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'One special character (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;

  const strengthLabel = score <= 1 ? 'Weak' : score <= 3 ? 'Medium' : 'Strong';
  const strengthColor = score <= 1 ? 'bg-danger' : score <= 3 ? 'bg-warning' : 'bg-success';
  const textColor = score <= 1 ? 'text-danger' : score <= 3 ? 'text-warning' : 'text-success';

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 font-sans text-xs">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
          Password Strength: <span className={textColor}>{strengthLabel}</span>
        </span>
        <span className="text-[10px] font-mono text-text-muted">{score}/4</span>
      </div>

      <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-background-subtle rounded-full overflow-hidden">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full transition-all duration-300 ${
              score >= step ? strengthColor : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {criteria.map((item) => (
          <div key={item.label} className="flex items-center space-x-1.5">
            {item.valid ? (
              <Check className="h-3 w-3 text-success shrink-0" />
            ) : (
              <X className="h-3 w-3 text-text-muted shrink-0" />
            )}
            <span className={item.valid ? 'text-text-primary font-medium' : 'text-text-muted'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordStrength;
