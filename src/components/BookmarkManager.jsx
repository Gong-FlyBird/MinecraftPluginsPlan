import { useState, useMemo, useRef } from 'react';
import {
  Bookmark, BookmarkCheck, Plus, X, Search, ChevronLeft, ChevronRight, Trash2,
  Edit3, Clock, ChevronDown,
} from 'lucide-react';
import GlassPanel from './GlassPanel';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { calcProgress, timeAgo } from '../utils/helpers';

/* ── 收藏夹行 ── */
function CollectionRow({ collections, activeId, onSelect, onDelete, onAdd }) {
  const rowRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const dragState = useRef(null); // { startX, scrollLeft }

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  // 鼠标滚轮 → 水平滚动
  const handleWheel = (e) => {
    if (!rowRef.current) return;
    if (e.deltaY !== 0) {
      e.preventDefault();
      rowRef.current.scrollLeft += e.deltaY;
    }
  };

  // 鼠标拖拽滚动
  const handleMouseDown = (e) => {
    if (!rowRef.current) return;
    dragState.current = { startX: e.clientX, scrollLeft: rowRef.current.scrollLeft };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragState.current || !rowRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    rowRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  };

  const handleMouseUp = () => {
    dragState.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const items = collections.map(c => (
    <button key={c.id}
      onClick={() => onSelect(c.id)}
      className={`flex-shrink-0 glass px-3 py-2 rounded-sm text-xs transition-all cursor-pointer text-left ${
        activeId === c.id ? 'ring-2 ring-hermes-gold/40 bg-hermes-gold/8' : 'hover:bg-hermes-gold/[0.04]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium whitespace-nowrap">{c.name}</span>
        <span className="text-[10px] text-hermes-text-muted/40">{c.pluginIds.length}</span>
      </div>
    </button>
  ));

  const addBtn = <AddCollectionCard onAdd={onAdd} />;

  const content = (
    <>
      {items}
      {addBtn}
    </>
  );

  if (expanded) {
    return (
      <div className="glass p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider">收藏夹</h4>
          <button onClick={() => setExpanded(false)} className="glass-btn !p-1 !border-0 text-xs">收起</button>
        </div>
        <div className="flex flex-wrap gap-2">{content}</div>
      </div>
    );
  }

  return (
    <div className="relative mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider">收藏夹</h4>
        <button onClick={() => setExpanded(true)} className="text-[11px] text-hermes-gold hover:text-hermes-gold/80">展开全部</button>
      </div>
      <div className="relative flex items-center">
        <button onClick={() => scroll(-1)} className="flex-shrink-0 glass-btn !p-1 !border-0"><ChevronLeft size={14} /></button>
        <div ref={rowRef} onWheel={handleWheel} onMouseDown={handleMouseDown}
          className="flex gap-2 overflow-x-auto mx-2 flex-1 cursor-grab active:cursor-grabbing scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >{content}</div>
        <button onClick={() => scroll(1)} className="flex-shrink-0 glass-btn !p-1 !border-0"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

function AddCollectionCard({ onAdd }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  if (!creating) {
    return (
      <button onClick={() => setCreating(true)}
        className="flex-shrink-0 glass px-3 py-2 rounded-sm text-xs flex items-center gap-1 text-hermes-text-muted/50 hover:text-hermes-text-muted/70 whitespace-nowrap">
        <Plus size={12} /> 新建收藏夹
      </button>
    );
  }
  return (
    <div className="flex-shrink-0 glass px-3 py-2 rounded-sm text-xs flex items-center gap-1">
      <input autoFocus value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onAdd(name); setCreating(false); setName(''); } }}
        className="glass-input !py-0 !px-1 text-xs w-24" placeholder="名称" />
      <button onClick={() => { onAdd(name); setCreating(false); setName(''); }} className="text-hermes-gold"><Plus size={12} /></button>
      <button onClick={() => { setCreating(false); setName(''); }} className="text-hermes-text-muted/40"><X size={12} /></button>
    </div>
  );
}

/* ── 收藏夹内插件卡片（与插件看板 GridCard 一致） ── */
function BookmarkPluginCard({
  plugin, onRemove, onEdit, collectionId, t,
  bookmarkCollections, onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [expanded, setExpanded] = useState(false);
  const [bmCreating, setBmCreating] = useState(false);
  const [bmNewName, setBmNewName] = useState('');
  const [bmShow, setBmShow] = useState(true);
  const progress = calcProgress(plugin.milestones);

  const inBookmarks = bookmarkCollections
    .filter(c => c.pluginIds.includes(plugin.id))
    .map(c => c.id);

  const toggleBookmark = (colId) => {
    if (inBookmarks.includes(colId)) {
      onRemovePluginFromBookmark?.(plugin.id, colId);
    } else {
      onAddPluginToBookmark?.(plugin.id, colId);
    }
  };

  const handleBmCreate = () => {
    if (!bmNewName.trim()) return;
    onAddBookmarkCollection?.(bmNewName.trim());
    setBmNewName('');
    setBmCreating(false);
  };

  return (
    <div className={`glass-card overflow-hidden transition-all ${expanded ? '' : 'hover:bg-hermes-gold/[0.04]'}`}>
      <div onClick={() => setExpanded(!expanded)}
        className="px-3 py-2.5 flex items-center gap-2 min-w-0 cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          plugin.status === 'planning' ? 'bg-blue-400' :
          plugin.status === 'developing' ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className={`flex-1 text-sm font-semibold text-hermes-text min-w-0 leading-tight ${
          expanded ? 'break-all' : 'truncate'
        }`}>{plugin.name}</span>
        <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0 whitespace-nowrap">v{plugin.version}</span>
        <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          className={`glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8 transition-opacity flex-shrink-0 ${
            inBookmarks.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`} title="收藏">
          {inBookmarks.length > 0
            ? <BookmarkCheck size={11} className="text-hermes-gold" />
            : <Bookmark size={11} className="text-hermes-text-muted/40" />
          }
        </button>
        {onEdit && (
          <button onClick={e => { e.stopPropagation(); onEdit(plugin); }}
            className="glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><Edit3 size={11} /></button>
        )}
        <button onClick={e => { e.stopPropagation(); onRemove(plugin.id, collectionId); }}
          className="glass-btn !p-1 !border-0 hover:!bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><X size={11} className="text-red-400/60" /></button>
        <ChevronDown size={11} className={`text-hermes-text-muted/20 flex-shrink-0 transition-transform ${expanded ? '' : 'rotate-180'}`} />
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-hermes-border/20 slide-up space-y-3 pt-3 max-h-64 overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* 插件详情 */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={plugin.status} t={t} />
            <PriorityBadge priority={plugin.priority} t={t} />
            <span className="text-xs text-hermes-text-muted/50">MC {plugin.mcVersion}</span>
          </div>
          {plugin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">{plugin.tags.map((tag, i) => <span key={i} className="tag text-[10px]">{tag}</span>)}</div>
          )}
          {plugin.milestones?.length > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-hermes-text-muted/60 mb-0.5">
                <span>{t('app.progress')}</span><span>{progress}%</span>
              </div>
              <div className="progress-bar h-1.5"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          {plugin.description && <p className="text-xs text-hermes-text-muted/70 break-all">{plugin.description}</p>}
          <div className="flex items-center gap-1 text-[10px] text-hermes-text-muted/40 pt-1">
            <Clock size={9} /><span>{timeAgo(plugin.updatedAt, t)}</span>
          </div>

          <hr className="border-hermes-border/20" />

          {/* 收藏至（放底部） */}
          <div>
            <p className="text-[11px] text-hermes-text-muted/50 flex items-center gap-1 cursor-pointer select-none" onClick={() => setBmShow(v => !v)}>
              <Bookmark size={12} className="text-hermes-gold" /> 收藏至
              <ChevronDown size={11} className={`text-hermes-text-muted/30 transition-transform ${bmShow ? '' : '-rotate-90'}`} />
            </p>
            {bmShow && (
            <div className="mt-2 space-y-1">
              {bookmarkCollections.map(c => {
                const checked = inBookmarks.includes(c.id);
                return (
                  <label key={c.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer transition-colors text-xs ${
                      checked ? 'bg-hermes-gold/10' : 'hover:bg-hermes-gold/[0.04]'
                    }`}
                  >
                    <input type="checkbox" checked={checked}
                      onChange={() => toggleBookmark(c.id)}
                      className="accent-hermes-gold w-3.5 h-3.5 rounded border-hermes-border/40 flex-shrink-0" />
                    <span className={`flex-1 min-w-0 ${checked ? 'text-hermes-gold font-medium' : 'text-hermes-text-muted/70'}`}>
                      {c.name}
                    </span>
                    <span className="text-hermes-text-muted/40">{c.pluginIds.length}</span>
                  </label>
                );
              })}
              {bmCreating ? (
                <div className="flex gap-1 mt-2">
                  <input autoFocus value={bmNewName}
                    onChange={e => setBmNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleBmCreate(); if (e.key === 'Escape') { setBmCreating(false); setBmNewName(''); } }}
                    className="glass-input !py-1 !px-2 text-xs flex-1" placeholder="收藏夹名称" />
                  <button onClick={handleBmCreate} className="glass-btn !py-1 !px-2 text-xs">创建</button>
                  <button onClick={() => { setBmCreating(false); setBmNewName(''); }} className="glass-btn !py-1 !px-2 text-xs">取消</button>
                </div>
              ) : (
                <button onClick={() => setBmCreating(true)}
                  className="text-xs text-hermes-gold hover:text-hermes-gold/80 mt-1 flex items-center gap-1">
                  <Plus size={12} /> 新建收藏夹
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 主页面 ── */
export default function BookmarkManager({
  plugins = [], bookmarkCollections = [],
  onAddCollection, onRemoveCollection, onRenameCollection,
  onAddPlugin, onRemovePlugin, t,
}) {
  const [activeColId, setActiveColId] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCol = bookmarkCollections.find(c => c.id === activeColId)
                 || bookmarkCollections[0]
                 || null;
  const activePluginIds = activeCol?.pluginIds || [];

  const activePlugins = useMemo(() => {
    let list = plugins.filter(p => activePluginIds.includes(p.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [plugins, activePluginIds, searchQuery]);

  return (
    <div className="fade-in">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">收藏</h1>
        <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">管理你收藏的插件</p>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-hermes-text-muted/30" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="glass-input pl-9 text-sm w-full max-w-md" placeholder="搜索收藏的插件…" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 glass-btn !p-0.5 !border-0">
            <X size={13} className="text-hermes-text-muted/40" />
          </button>
        )}
      </div>

      <CollectionRow collections={bookmarkCollections} activeId={activeCol?.id}
        onSelect={id => setActiveColId(id)}
        onDelete={(id) => { onRemoveCollection(id); if (activeColId === id) setActiveColId('default'); }}
        onAdd={onAddCollection} />

      <GlassPanel className="!p-3 sm:!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={14} className="text-hermes-gold flex-shrink-0" />
          <h3 className="text-sm font-semibold text-hermes-text flex items-center gap-2">
            {activeCol?.name || '收藏夹'}
            <span className="text-xs text-hermes-text-muted/40 font-normal">
              ({activeCol?.pluginIds?.length || 0})
            </span>
            {activeCol && (
              <button onClick={() => { onRemoveCollection(activeCol.id); setActiveColId('default'); }}
                className="text-red-400/50 hover:text-red-400 transition-colors ml-1" title="删除收藏夹">
                <Trash2 size={13} />
              </button>
            )}
          </h3>
        </div>

        {activePlugins.length === 0 ? (
          <div className="text-center py-10 text-sm text-hermes-text-muted/30">
            {searchQuery ? '未找到匹配插件' : '收藏夹为空，在看板中点击卡片上的收藏按钮添加插件'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activePlugins.map(p => (
              <BookmarkPluginCard key={p.id} plugin={p}
                collectionId={activeCol.id} onRemove={onRemovePlugin} t={t}
                bookmarkCollections={bookmarkCollections}
                onAddPluginToBookmark={onAddPlugin}
                onRemovePluginFromBookmark={onRemovePlugin}
                onAddBookmarkCollection={onAddCollection} />
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
