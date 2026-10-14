import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-soft ${
        isError
          ? 'border-rose-200 bg-rose-50 text-rose-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      <Icon size={19} aria-hidden="true" />

      <span className="text-sm font-medium">
        {toast.message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="rounded p-1 transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}