import { useState, useRef, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Plus, X } from 'lucide-react';

/**
 * 插件卡片上的收藏按钮 — 点击弹出收藏夹选择
 */
export default function BookmarkButton({
  pluginId, t,
  bookmarkCollections = [],
  onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const menuRef = useRef(null);

  // 该插件已收藏到的收藏夹 id 集合
  const inBookmarks = bookmarkCollections.filter(c => c.pluginIds.includes(pluginId)).map(c => c.id);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const toggle = (collectionId) => {
    if (inBookmarks.includes(collectionId)) {
      onRemovePluginFromBookmark(pluginId, collectionId);
    } else {
      onAddPluginToBookmark(pluginId, collectionId);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAddBookmarkCollection(newName.trim());
    setNewName('');
    setCreating(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
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
        <div
          className="absolute top-full right-0 mt-1 z-50 w-48 glass !bg-white/95 shadow-lg rounded-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-hermes-border/20">
            <p className="text-xs font-semibold text-hermes-text">收藏到</p>
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {bookmarkCollections.map(c => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-hermes-gold/[0.06] ${
                  inBookmarks.includes(c.id) ? 'text-hermes-gold' : 'text-hermes-text-muted/70'
                }`}
              >
                {inBookmarks.includes(c.id)
                  ? <BookmarkCheck size={13} className="flex-shrink-0" />
                  : <Bookmark size={13} className="flex-shrink-0" />
                }
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-[10px] text-hermes-text-muted/40">{c.pluginIds.length}</span>
              </button>
            ))}
          </div>

          {creating ? (
            <div className="px-3 py-2 border-t border-hermes-border/20 flex gap-1">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="flex-1 glass-input !py-1 !px-2 text-xs"
                placeholder="收藏夹名称"
              />
              <button onClick={handleCreate} className="glass-btn !p-1 !border-0"><Plus size={12} /></button>
              <button onClick={() => setCreating(false)} className="glass-btn !p-1 !border-0"><X size={12} /></button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-hermes-text-muted/60 hover:bg-hermes-gold/[0.06] border-t border-hermes-border/20"
            >
              <Plus size={13} /> 新建收藏夹
            </button>
          )}
        </div>
      )}
    </div>
  );
}
