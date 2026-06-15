import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Package, Tag, Lightbulb } from 'lucide-react';

export default function GlobalSearch({ open, onClose, onSelect, plugins, t }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items = [];

    plugins.forEach(p => {
      // 匹配插件名
      if (p.name?.toLowerCase().includes(q)) {
        items.push({ type: 'plugin', label: p.name, sub: `v${p.version} · ${t(`status.${p.status}`)}`, id: p.id });
      }
      // 匹配标签
      (p.tags || []).forEach(tag => {
        if (tag.toLowerCase().includes(q) && !items.some(i => i.type === 'tag' && i.label === tag)) {
          items.push({ type: 'tag', label: tag, sub: t('tag.plugin'), id: tag });
        }
      });
      // 匹配灵感
      (p.ideas || []).forEach(idea => {
        if (idea.text?.toLowerCase().includes(q)) {
          items.push({ type: 'idea', label: idea.text.slice(0, 60), sub: `📦 ${p.name}`, id: idea.id });
        }
      });
    });

    return items.slice(0, 20);
  }, [query, plugins, t]);

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) {
      onSelect?.(results[selectedIdx]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 modal-overlay" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl glass !bg-white/90 slide-up"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-hermes-border/30">
          <Search size={18} className="text-hermes-text-muted/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            placeholder={t('app.search')}
            className="flex-1 bg-transparent border-none outline-none text-base text-hermes-text placeholder:text-hermes-text-muted/30"
          />
          <button onClick={onClose} className="text-hermes-text-muted/30 hover:text-hermes-text-muted/60 tap-target flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {results.map((item, idx) => (
              <button
                key={`${item.type}-${item.id}`}
                className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left transition-colors tap-target-nav ${
                  idx === selectedIdx ? 'bg-hermes-gold/[0.08]' : 'hover:bg-hermes-gold/[0.04]'
                }`}
                onClick={() => { onSelect?.(item); }}
              >
                <span className="flex-shrink-0">
                  {item.type === 'plugin' ? <Package size={16} className="text-hermes-gold" /> :
                   item.type === 'tag' ? <Tag size={16} className="text-blue-400" /> :
                   <Lightbulb size={16} className="text-amber-400" />}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-hermes-text block truncate">{item.label}</span>
                  <span className="text-[11px] text-hermes-text-muted/50">{item.sub}</span>
                </div>
                <span className="text-[10px] text-hermes-text-muted/30 uppercase">{item.type}</span>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-8 text-sm text-hermes-text-muted/40">{t('app.empty')}</div>
        )}

        {/* Footer hint */}
        <div className="px-4 sm:px-5 py-2 border-t border-hermes-border/30 text-[10px] text-hermes-text-muted/30 flex gap-3 sm:gap-4 flex-wrap">
          <span>↑↓ 导航</span>
          <span>Enter 选择</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
