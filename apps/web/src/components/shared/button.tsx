import React from 'react';
import { Button as UiButton, ButtonProps as UiButtonProps } from '@/components/ui/button';

export interface ButtonProps extends Omit<UiButtonProps, 'loading' | 'rounded'> {
  isLoading?: boolean;
  pill?: boolean;
  variant?: UiButtonProps['variant'];
  size?: UiButtonProps['size'];
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, pill, variant, size, ...props }, ref) => {
    return (
      <UiButton
        ref={ref}
        loading={isLoading}
        rounded={pill ? 'full' : true}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </UiButton>
    );
  }
);

Button.displayName = 'Button';
export default Button;
