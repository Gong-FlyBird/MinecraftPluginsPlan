import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={ref}
        className={`glass-card max-h-[85vh] overflow-y-auto w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} slide-up`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hermes-border/30">
          <h2 className="text-lg font-semibold text-hermes-text">{title}</h2>
          <button onClick={onClose} className="glass-btn !p-2 !border-0 hover:!bg-hermes-gold/8">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
