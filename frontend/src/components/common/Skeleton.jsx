import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-zinc-800';
  let shapeClass = 'rounded-xl';

  if (variant === 'circle') shapeClass = 'rounded-full';
  if (variant === 'text') shapeClass = 'rounded h-3.5';

  return <div className={`${baseClasses} ${shapeClass} ${className}`} />;
};

export const JobCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="w-1/3 h-5" />
        <Skeleton className="w-1/4 h-3.5" variant="text" />
      </div>
      <Skeleton className="w-20 h-6" variant="rectangular" />
    </div>
    <Skeleton className="w-full h-12" variant="rectangular" />
    <div className="flex gap-2">
      <Skeleton className="w-16 h-5" />
      <Skeleton className="w-20 h-5" />
      <Skeleton className="w-24 h-5" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="p-4">
        <Skeleton className="w-full h-4" variant="text" />
      </td>
    ))}
  </tr>
);
