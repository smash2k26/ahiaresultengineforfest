import React from 'react';
import { useFestival } from '../../context/FestivalContext';
import { Tick01Icon as CheckCircle2, InformationCircleIcon as Info, Alert02Icon as AlertTriangle, Alert01Icon as AlertCircle, Cancel01Icon as X } from 'hugeicons-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFestival();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, idx) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/30 bg-emerald-950/40',
          info: 'border-sky-500/30 bg-sky-950/40',
          warning: 'border-amber-500/30 bg-amber-950/40',
          error: 'border-rose-500/30 bg-rose-950/40',
        };

        return (
          <div
            key={toast.id ? `toast-${toast.id}-${idx}` : `toast-${idx}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-xl shadow-black/60 text-sm text-gray-200 transition-all duration-300 animate-in slide-in-from-right-5 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">{toast.title}</h4>
                <span className="text-[10px] text-gray-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
