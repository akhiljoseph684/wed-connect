import React from 'react';
import { cn } from '../../utils/cn.js';

export const Badge = ({ children, variant = 'default', size = 'sm', className }) => {
  const variants = {
    default: 'bg-ivory-200 text-charcoal border border-charcoal/10',
    burgundy: 'bg-burgundy-50 text-burgundy border border-burgundy/20',
    gold: 'bg-gold-50 text-gold-700 border border-gold/30',
    rose: 'bg-blush text-rose-700 border border-rose/20',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-medium',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 transition-colors', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export default Badge;
