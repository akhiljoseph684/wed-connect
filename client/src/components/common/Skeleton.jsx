import React from 'react';
import { cn } from '../../utils/cn.js';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-ivory-300/60', className)}
      {...props}
    />
  );
};

export const PostCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-burgundy/5 p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="w-full h-80 rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const VendorCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-burgundy/5 p-4 space-y-3">
    <Skeleton className="w-full h-48 rounded-xl" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export default Skeleton;
