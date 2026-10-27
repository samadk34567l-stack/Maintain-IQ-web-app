import React from 'react';
import {
  CheckCircle2,
  X
} from 'lucide-react';
import './ToastStack.css';

export default function ToastStack({ toasts, setToasts, variant = 'app' }) {
  const dismiss = (id) => setToasts((prev) => prev.filter((item) => item.id !== id));
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${variant}`}>
          <CheckCircle2 size={16} className="toast-icon" />
          <span className="toast-message">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="btn btn-ghost btn-sm toast-close" aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
