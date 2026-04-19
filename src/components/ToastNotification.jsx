import React from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';

const priorityConfig = {
  info: { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30', icon: Info, iconColor: 'text-neon-cyan' },
  warning: { bg: 'bg-neon-orange/10', border: 'border-neon-orange/30', icon: AlertTriangle, iconColor: 'text-neon-orange' },
  critical: { bg: 'bg-neon-red/10', border: 'border-neon-red/30', icon: AlertCircle, iconColor: 'text-neon-red' },
};

export default function ToastNotification() {
  const { state, dispatch } = useCrowd();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[9000] flex flex-col-reverse gap-3 max-w-sm">
      {state.toasts.slice(-3).map((toast) => {
        const config = priorityConfig[toast.priority] || priorityConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`animate-slide-up glass-panel p-4 ${config.border} border flex items-start gap-3 shadow-2xl`}
          >
            <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{toast.message}</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
