import React, { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  useEffect(() => {
    // Auto-dismiss toasts after 5 seconds
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 5000)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle
            : toast.type === 'error'
            ? XCircle
            : AlertCircle;

        const bgColor =
          toast.type === 'success'
            ? 'bg-green-50 border-green-200'
            : toast.type === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200';

        const textColor =
          toast.type === 'success'
            ? 'text-green-800'
            : toast.type === 'error'
            ? 'text-red-800'
            : 'text-blue-800';

        const iconColor =
          toast.type === 'success'
            ? 'text-green-600'
            : toast.type === 'error'
            ? 'text-red-600'
            : 'text-blue-600';

        return (
          <div
            key={toast.id}
            className={`${bgColor} ${textColor} border rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in`}
          >
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${textColor} hover:opacity-70 transition`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

