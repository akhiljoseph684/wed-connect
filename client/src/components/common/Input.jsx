import React from 'react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-mutedGray pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal placeholder:text-mutedGray/60',
              'transition-all duration-200 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-mutedGray">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-mutedGray mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
