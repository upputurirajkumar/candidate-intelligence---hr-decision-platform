import React from 'react';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

interface WidgetContainerProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  id,
  title,
  subtitle,
  badge,
  icon,
  actions,
  isLoading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyMessage = 'No data available for this section.',
  emptyAction,
  className = '',
  children,
}) => {
  return (
    <div
      id={id}
      className={`bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col transition-all duration-200 ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 shrink-0 shadow-inner">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight truncate">{title}</h3>
              {badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-950/80 text-cyan-300 border border-indigo-800/80 font-semibold">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Widget Content with Robust State Handling */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-xs font-medium animate-pulse">Loading component data...</p>
          </div>
        ) : error ? (
          <div className="py-8 px-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div>
              <h4 className="text-xs font-bold text-rose-300">Failed to load content</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="py-10 text-center text-slate-400 space-y-3">
            <Sparkles className="w-7 h-7 mx-auto text-slate-600" />
            <p className="text-xs">{emptyMessage}</p>
            {emptyAction}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
