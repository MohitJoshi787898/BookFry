import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'danger'
    | 'success'
    | 'warning'
    | 'gradient-brand'
    | 'gradient-flame';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean | 'full' | 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = true,
      iconOnly = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-bold tracking-tight transition-all focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] duration-150 select-none touch-manipulation';

    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-500 hover:shadow-md focus:ring-primary',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-600 hover:shadow-md focus:ring-secondary',
      outline: 'border border-border bg-card text-text-primary shadow-sm hover:bg-muted hover:border-ring/40 focus:ring-primary',
      ghost: 'text-text-primary hover:bg-muted focus:ring-primary',
      link: 'text-primary underline-offset-4 hover:underline focus:ring-primary p-0 bg-transparent hover:bg-transparent active:scale-100',
      danger: 'bg-danger text-danger-foreground hover:bg-danger/90 focus:ring-danger',
      success: 'bg-success text-success-foreground hover:bg-success/90 focus:ring-success',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90 focus:ring-warning',
      'gradient-brand': 'bg-gradient-brand text-primary-foreground hover:opacity-95 focus:ring-primary',
      'gradient-flame': 'bg-gradient-flame text-secondary-foreground hover:opacity-95 focus:ring-secondary',
    };

    const sizes = {
      xs: iconOnly ? 'p-1.5 text-xs min-h-[28px] min-w-[28px]' : 'px-2.5 py-1 text-xs min-h-[28px]',
      sm: iconOnly ? 'p-2 text-xs min-h-[40px] min-w-[40px]' : 'px-3.5 py-1.5 text-xs sm:text-sm font-medium min-h-[40px]',
      md: iconOnly ? 'p-2.5 text-sm min-h-[44px] min-w-[44px]' : 'px-5 py-2.5 text-sm font-semibold min-h-[44px]',
      lg: iconOnly ? 'p-3 text-base min-h-[48px] min-w-[48px]' : 'px-6 py-3 text-sm sm:text-base font-bold min-h-[48px]',
      xl: iconOnly ? 'p-4 text-lg min-h-[52px] min-w-[52px]' : 'px-8 py-3.5 text-base sm:text-lg font-bold min-h-[52px]',
    };

    const getRoundedStyle = () => {
      if (rounded === 'full') return 'rounded-full';
      if (rounded === 'sm') return 'rounded-sm';
      if (rounded === 'md') return 'rounded-md';
      if (rounded === 'lg') return 'rounded-lg';
      if (rounded === true) return 'rounded-md';
      return 'rounded-none';
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          getRoundedStyle(),
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {!loading && leftIcon && <span className="mr-2 inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2 inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
