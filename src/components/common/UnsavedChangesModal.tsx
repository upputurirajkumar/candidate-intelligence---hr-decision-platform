import React, { useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirmDiscard: () => void;
  onCancelStay: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  title = 'Unsaved Changes Detected',
  message = 'You have unsaved input in this form. If you leave now, your pending edits and document attachments will be discarded.',
  confirmLabel = 'Discard & Exit',
  cancelLabel = 'Keep Editing',
  onConfirmDiscard,
  onCancelStay,
}) => {
  // Trap escape key to stay safely
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelStay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancelStay]);

  if (!isOpen) return null;

  return (
    <div
      id="unsaved-changes-modal"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="unsaved-changes-title" className="text-sm font-bold text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancelStay}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancelStay}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirmDiscard}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
