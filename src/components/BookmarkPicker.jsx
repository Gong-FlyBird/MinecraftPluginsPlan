import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Plus, X } from 'lucide-react';
import Modal from './Modal';

/**
 * 收藏夹选择浮层 — 卡片点击收藏按钮时弹出
 */
export default function BookmarkPicker({
  open, onClose,
  pluginId, pluginName,
  bookmarkCollections = [],
  onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  // 关闭时重置创建状态
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
      <div className="space-y-1">
        {pluginName && (
          <p className="text-xs text-gray-400 mb-3">
            将 <span className="font-medium text-gray-600">{pluginName}</span> 收藏到：
          </p>
        )}

        {bookmarkCollections.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-6">暂无收藏夹，创建一个吧</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {bookmarkCollections.map(c => {
              const checked = inBookmarks.includes(c.id);
              return (
                <label key={c.id}
                  className={`flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer transition-colors ${
                    checked ? 'bg-amber-50 text-amber-800' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input type="checkbox" checked={checked}
                    onChange={() => toggle(c.id)}
                    className="accent-amber-500 w-4 h-4 rounded border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.pluginIds.length} 个插件</span>
                  </div>
                  {checked && <BookmarkCheck size={16} className="text-amber-500 flex-shrink-0" />}
                </label>
              );
            })}
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 mt-3">
          {creating ? (
            <div className="flex gap-2">
              <input autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="收藏夹名称" />
              <button onClick={handleCreate}
                className="px-3 py-2 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors whitespace-nowrap">创建</button>
              <button onClick={() => { setCreating(false); setNewName(''); }}
                className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600">取消</button>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors py-1">
              <Plus size={16} /> 新建收藏夹
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
