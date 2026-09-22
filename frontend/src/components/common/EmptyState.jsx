import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, actionButton }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        {description && <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">{description}</p>}
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};
