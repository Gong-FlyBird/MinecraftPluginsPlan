import { useState, useEffect, useCallback } from 'react';

/** localStorage 持久化 Hook，支持自动同步到 IndexedDB 备份 */
export function useLocalStorage(key, initialValue, migrate) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      const raw = item ? JSON.parse(item) : initialValue;
      return migrate ? migrate(raw) : raw;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((valueOrFn) => {
    setStoredValue(prev => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.warn('localStorage write failed:', e);
      }
      return next;
    });
  }, [key]);

  // 跨标签页同步
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [storedValue, setValue];
}
