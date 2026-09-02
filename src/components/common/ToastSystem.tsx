import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      id,
      duration: 4500,
      ...toast,
    };

    setToasts((prev) => {
      // Limit to 4 visible toasts to avoid viewport clutter
      const trimmed = prev.length >= 4 ? prev.slice(prev.length - 3) : prev;
      return [...trimmed, newToast];
    });

    return id;
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-slate-900/95',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          accent: 'bg-emerald-500',
        };
      case 'error':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-slate-900/95',
          icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
          accent: 'bg-rose-500',
        };
      case 'warning':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-slate-900/95',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          accent: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          border: 'border-cyan-500/40',
          bg: 'bg-slate-900/95',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
          accent: 'bg-cyan-500',
        };
    }
  };

  const style = getStyles();

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${style.border} ${style.bg} text-slate-100 shadow-xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
    >
      {style.icon}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold leading-tight text-white">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
