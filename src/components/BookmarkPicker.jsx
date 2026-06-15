import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Plus, X } from 'lucide-react';
import Modal from './Modal';

/**
 * 收藏夹选择浮层 — 卡片点击收藏按钮时弹出
 * 样式与 PluginForm（查看信息）一致
 */
export default function BookmarkPicker({
  open, onClose,
  pluginId, pluginName,
  bookmarkCollections = [],
  onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!open) { setCreating(false); setNewName(''); }
  }, [open]);

  const inBookmarks = bookmarkCollections
    .filter(c => c.pluginIds.includes(pluginId))
    .map(c => c.id);

  const toggle = (colId) => {
    if (inBookmarks.includes(colId)) {
      onRemovePluginFromBookmark?.(pluginId, colId);
    } else {
      onAddPluginToBookmark?.(pluginId, colId);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAddBookmarkCollection?.(newName.trim());
    setNewName('');
    setCreating(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="收藏到" wide>
      <div className="space-y-4">
        {pluginName && (
          <p className="text-sm text-hermes-text-muted/70">
            将 <span className="font-semibold text-hermes-text">{pluginName}</span> 收藏到：
          </p>
        )}

        {bookmarkCollections.length === 0 ? (
          <p className="text-sm text-hermes-text-muted/40 text-center py-8">暂无收藏夹，创建一个吧</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {bookmarkCollections.map(c => {
              const checked = inBookmarks.includes(c.id);
              return (
                <label key={c.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all ${
                    checked
                      ? 'bg-hermes-gold/10 text-hermes-gold ring-1 ring-hermes-gold/30'
                      : 'hover:bg-hermes-gold/[0.04] text-hermes-text-muted/80'
                  }`}
                >
                  <input type="checkbox" checked={checked}
                    onChange={() => toggle(c.id)}
                    className="accent-hermes-gold w-4 h-4 rounded border-hermes-border/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{c.name}</span>
                    <span className="text-xs text-hermes-text-muted/50">{c.pluginIds.length} 个插件</span>
                  </div>
                  {checked && <BookmarkCheck size={16} className="text-hermes-gold flex-shrink-0" />}
                </label>
              );
            })}
          </div>
        )}

        <div className="border-t border-hermes-border/20 pt-4">
          {creating ? (
            <div className="flex gap-2">
              <input autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                className="glass-input flex-1" placeholder="收藏夹名称" />
              <button onClick={handleCreate}
                className="glass-btn glass-btn-primary whitespace-nowrap">创建</button>
              <button onClick={() => { setCreating(false); setNewName(''); }}
                className="glass-btn">取消</button>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-2 text-sm text-hermes-gold hover:text-hermes-gold/80 transition-colors py-1">
              <Plus size={16} /> 新建收藏夹
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
