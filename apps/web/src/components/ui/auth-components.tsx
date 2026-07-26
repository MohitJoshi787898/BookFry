import React, { useRef, useState, useEffect } from 'react';
import { Chrome, Facebook, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ length = 6, value, onChange, disabled = false, error = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync prop value
  useEffect(() => {
    const chars = value.split('').slice(0, length);
    const newValues = Array(length).fill('');
    chars.forEach((c, idx) => {
      newValues[idx] = c;
    });
    setValues(newValues);
  }, [value, length]);

  const handleChange = (val: string, index: number) => {
    // Take only the last character or first if pasting
    const char = val.slice(-1);
    const updated = [...values];
    updated[index] = char;
    setValues(updated);

    const merged = updated.join('');
    onChange(merged);

    // Focus next box
    if (char !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (values[index] === '' && index > 0) {
        // Clear previous box and focus it
        const updated = [...values];
        updated[index - 1] = '';
        setValues(updated);
        onChange(updated.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const updated = [...values];
        updated[index] = '';
        setValues(updated);
        onChange(updated.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim().slice(0, length);
    if (!/^\d+$/.test(data)) return; // Only numbers allowed

    const chars = data.split('');
    const updated = [...values];
    chars.forEach((c, idx) => {
      updated[idx] = c;
      if (inputRefs.current[idx]) {
        inputRefs.current[idx]!.value = c;
      }
    });
    setValues(updated);
    onChange(updated.join(''));
    inputRefs.current[Math.min(chars.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center font-mono">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={values[index]}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            'w-10 h-12 text-center text-lg font-bold border border-border bg-slate-50/40 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all disabled:opacity-50',
            error ? 'border-danger focus:ring-danger focus:border-danger text-danger' : ''
          )}
        />
      ))}
    </div>
  );
}

export function PasswordStrengthIndicator({ password }: { password?: string }) {
  if (!password) return null;

  const getStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // Max 5
  };

  const score = getStrength();

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-danger',
    'bg-danger',
    'bg-warning',
    'bg-[#FF9900]',
    'bg-success',
  ];

  const label = labels[Math.min(score - 1, 4)] || 'Too Short';
  const colorClass = colors[Math.min(score - 1, 4)] || 'bg-border';

  return (
    <div className="space-y-1 w-full font-sans text-[10px]">
      <div className="flex justify-between font-bold text-text-secondary">
        <span>Password Strength</span>
        <span className="capitalize">{label}</span>
      </div>
      {/* Bars */}
      <div className="grid grid-cols-5 gap-1.5 h-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full rounded-full transition-colors duration-300',
              i < score ? colorClass : 'bg-border/60'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function SocialLogins() {
  return (
    <div className="grid grid-cols-3 gap-3 text-xs font-bold font-sans">
      <Button variant="outline" className="gap-1.5 py-2 hover:bg-slate-50 dark:hover:bg-primary-900/25 border-border bg-white dark:bg-primary-950/15 shadow-2xs text-text-primary text-[11px]" size="sm">
        <Chrome className="h-3.5 w-3.5 text-rose-500 shrink-0" />
        Google
      </Button>
      <Button variant="outline" className="gap-1.5 py-2 hover:bg-slate-50 dark:hover:bg-primary-900/25 border-border bg-white dark:bg-primary-950/15 shadow-2xs text-text-primary text-[11px]" size="sm">
        <Facebook className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        Facebook
      </Button>
      <Button variant="outline" className="gap-1.5 py-2 hover:bg-slate-50 dark:hover:bg-primary-900/25 border-border bg-white dark:bg-primary-950/15 shadow-2xs text-text-primary text-[11px]" size="sm">
        <Apple className="h-3.5 w-3.5 text-slate-900 dark:text-white shrink-0" />
        Apple
      </Button>
    </div>
  );
}
