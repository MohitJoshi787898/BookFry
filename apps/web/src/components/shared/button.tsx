import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  pill?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  pill = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] duration-120';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-500 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-600 focus:ring-secondary',
    outline: 'border border-border bg-card text-text-primary hover:bg-muted focus:ring-primary',
    ghost: 'text-text-primary hover:bg-muted focus:ring-primary',
    danger: 'bg-danger text-danger-foreground hover:bg-danger/90 focus:ring-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-5 py-2.5 text-sm rounded-md',
    lg: 'px-7 py-3 text-base rounded-lg',
  };

  const pillStyle = pill ? 'rounded-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], pillStyle, className))}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export default Button;
