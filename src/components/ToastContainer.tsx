import React from 'react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Bell, CheckCircle2, MessageSquare, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-white transition-all transform animate-in slide-in-from-top-2"
        >
          {toast.avatar ? (
            <img
              src={toast.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-indigo-500/50 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
              {toast.type === 'message' && <MessageSquare className="w-5 h-5" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'info' && <Bell className="w-5 h-5" />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 truncate">{toast.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
