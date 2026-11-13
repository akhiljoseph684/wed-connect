import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-blush flex items-center justify-center text-burgundy mb-4 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-xl font-medium text-charcoal">{title}</h3>
      <p className="text-sm text-mutedGray mt-2 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
