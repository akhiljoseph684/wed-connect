import React from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-burgundy text-white hover:bg-burgundy-600 focus:ring-burgundy/40 shadow-sm hover:shadow-md',
      secondary: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold/40 shadow-sm',
      outline: 'border border-burgundy/30 text-burgundy hover:bg-burgundy/5 focus:ring-burgundy/30 bg-transparent',
      goldOutline: 'border border-gold text-gold-700 hover:bg-gold-50 focus:ring-gold/30 bg-transparent',
      ghost: 'text-charcoal hover:bg-rose-50/60 focus:ring-rose/30',
      soft: 'bg-blush text-burgundy hover:bg-rose-100 focus:ring-rose/30',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
      lg: 'text-base px-6 py-3 rounded-lg gap-2.5 tracking-wide',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
