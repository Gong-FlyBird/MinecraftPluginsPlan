import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

let toastId = 0;
let addToastFn = null;

/** 全局触发函数（从任何组件调用） */
export function toast(type, text) {
  if (addToastFn) addToastFn({ id: ++toastId, type, text });
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    addToastFn = (t) => {
      setItems(prev => [...prev, t]);
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== t.id));
      }, 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm">
      {items.map(item => (
        <div
          key={item.id}
          className={`glass-card !py-3 !px-4 flex items-center gap-3 slide-up ${
            item.type === 'success'
              ? 'border-l-4 border-emerald-400'
              : item.type === 'error'
                ? 'border-l-4 border-red-400'
                : 'border-l-4 border-hermes-gold'
          }`}
        >
          {item.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          ) : item.type === 'error' ? (
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          ) : null}
          <span className="text-sm text-hermes-text flex-1">{item.text}</span>
          <button onClick={() => remove(item.id)} className="text-hermes-text-muted/30 hover:text-hermes-text-muted/60 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
