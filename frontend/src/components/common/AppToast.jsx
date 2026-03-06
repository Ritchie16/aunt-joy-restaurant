import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const AppToast = ({
  open,
  title,
  message,
  type = 'error',
  duration = 4200,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const palette =
    type === 'success'
      ? {
          border: 'border-emerald-200',
          title: 'text-emerald-700',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        }
      : {
          border: 'border-rose-200',
          title: 'text-rose-700',
          icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
        };

  return (
    <div className="fixed right-4 top-4 z-[70] w-[340px] max-w-[calc(100vw-2rem)]">
      <div className={`rounded-lg border bg-white p-3 shadow-lg ${palette.border}`}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{palette.icon}</div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${palette.title}`}>{title}</p>
            <p className="mt-0.5 text-sm text-gray-700">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppToast;
