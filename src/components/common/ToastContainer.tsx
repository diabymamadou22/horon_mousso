import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-red-900/95 text-red-50 border-red-700 shadow-red-950/20'
              : 'bg-stone-900/95 text-stone-100 border-stone-700 shadow-stone-950/20'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />}
          <div className="flex-1 leading-snug">{toast.text}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-300 hover:text-white p-0.5 rounded transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
