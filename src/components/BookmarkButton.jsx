import { useState, useRef, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Plus, X } from 'lucide-react';

export default function BookmarkButton({
  pluginId, t,
  bookmarkCollections = [],
  onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const menuRef = useRef(null);

  const inBookmarks = bookmarkCollections
    .filter(c => c.pluginIds.includes(pluginId))
    .map(c => c.id);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false); setCreating(false); setNewName('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (colId) => {
    if (inBookmarks.includes(colId)) onRemovePluginFromBookmark?.(pluginId, colId);
    else onAddPluginToBookmark?.(pluginId, colId);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAddBookmarkCollection?.(newName.trim());
    setNewName(''); setCreating(false);
  };

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className={`glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8 transition-opacity flex-shrink-0 ${
          inBookmarks.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="收藏"
      >
        {inBookmarks.length > 0
          ? <BookmarkCheck size={11} className="text-hermes-gold" />
          : <Bookmark size={11} className="text-hermes-text-muted/40" />
        }
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-[60] w-52 bg-white rounded-sm shadow-xl border border-gray-100 py-1"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
            收藏到
          </div>

          {bookmarkCollections.length === 0 ? (
            <div className="px-3 py-4 text-xs text-gray-300 text-center">暂无收藏夹</div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {bookmarkCollections.map(c => {
                const checked = inBookmarks.includes(c.id);
                return (
                  <button key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-amber-50 transition-colors ${
                      checked ? 'text-amber-700 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {checked
                      ? <BookmarkCheck size={13} className="flex-shrink-0 text-amber-500" />
                      : <Bookmark size={13} className="flex-shrink-0 text-gray-300" />
                    }
                    <span className="truncate">{c.name}</span>
                    <span className="ml-auto text-gray-300">{c.pluginIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {creating ? (
            <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-100">
              <input autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-amber-400"
                placeholder="收藏夹名称" />
              <button onClick={handleCreate} className="text-amber-500 hover:text-amber-600 p-0.5"><Plus size={14} /></button>
              <button onClick={() => { setCreating(false); setNewName(''); }} className="text-gray-300 hover:text-gray-500 p-0.5"><X size={14} /></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setCreating(true); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors">
              <Plus size={13} /> 新建收藏夹
            </button>
          )}
        </div>
      )}
    </div>
  );
}
