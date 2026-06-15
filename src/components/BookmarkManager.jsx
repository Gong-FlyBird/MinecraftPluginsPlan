import { useState, useMemo, useRef, useEffect } from 'react';
import { Bookmark, Plus, X, Search, ChevronLeft, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import GlassPanel from './GlassPanel';
import { StatusBadge } from './StatusBadge';
import { calcProgress } from '../utils/helpers';

/* ── 收藏夹行 ── */
function CollectionRow({ collections, activeId, onSelect, onRename, onDelete, onAdd }) {
  const rowRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const items = (expanded ? null : null); // unused
  const content = (
    <>
      {collections.map(c => (
        <button key={c.id}
          onClick={() => onSelect(c.id)}
          className={`flex-shrink-0 glass px-3 py-2 rounded-sm text-xs transition-all cursor-pointer text-left ${
            activeId === c.id ? 'ring-2 ring-hermes-gold/40 bg-hermes-gold/8' : 'hover:bg-hermes-gold/[0.04]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium whitespace-nowrap">{c.name}</span>
            <span className="text-[10px] text-hermes-text-muted/40">{c.pluginIds.length}</span>
            {c.id !== 'default' && (
              <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                className="text-red-400/40 hover:text-red-400"><Trash2 size={10} /></button>
            )}
          </div>
        </button>
      ))}
      <AddCollectionCard onAdd={onAdd} />
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
        <div ref={rowRef} className="flex gap-2 overflow-x-auto scrollbar-hide mx-2 flex-1">{content}</div>
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
      <button onClick={() => setCreating(false)} className="text-hermes-text-muted/40"><X size={12} /></button>
    </div>
  );
}

/* ── 收藏夹内插件卡片 ── */
function BookmarkPluginCard({ plugin, onRemove, collectionId, t }) {
  const progress = calcProgress(plugin.milestones);
  const statusColors = { planning: 'bg-blue-400', developing: 'bg-amber-400', released: 'bg-emerald-400' };
  const sc = statusColors[plugin.status] || 'bg-gray-400';

  return (
    <div className="group glass-card px-3 py-2.5 flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-hermes-text truncate">{plugin.name}</span>
          <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0">v{plugin.version}</span>
          <StatusBadge status={plugin.status} t={t} />
        </div>
        {plugin.milestones?.length > 0 && (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="progress-bar h-1 flex-1 max-w-[120px]">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-hermes-text-muted/50">{progress}%</span>
          </div>
        )}
      </div>
      <button onClick={() => onRemove(plugin.id, collectionId)}
        className="opacity-0 group-hover:opacity-100 glass-btn !p-1 !border-0 transition-opacity flex-shrink-0" title="移出收藏夹">
        <X size={11} className="text-red-400/60" />
      </button>
    </div>
  );
}

/* ── 主页面 ── */
export default function BookmarkManager({
  plugins = [], bookmarkCollections = [], highlightPluginId,
  onAddCollection, onRemoveCollection, onRenameCollection,
  onAddPlugin, onRemovePlugin, t,
}) {
  const [activeColId, setActiveColId] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  // 当前活动收藏夹
  const activeCol = bookmarkCollections.find(c => c.id === activeColId) || bookmarkCollections[0] || null;
  const activePluginIds = activeCol?.pluginIds || [];

  // 过滤收藏夹内插件
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
      {/* 1. 标题+描述 */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">收藏</h1>
        <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">管理你收藏的插件</p>
      </div>

      {/* 2. 搜索 */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-hermes-text-muted/30" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="glass-input pl-9 text-sm w-full max-w-md" placeholder="搜索收藏的插件…" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 glass-btn !p-0.5 !border-0">
            <X size={13} className="text-hermes-text-muted/40" />
          </button>
        )}
      </div>

      {/* 3. 收藏夹行 */}
      <CollectionRow collections={bookmarkCollections} activeId={activeCol?.id}
        onSelect={id => setActiveColId(id)}
        onRename={onRenameCollection}
        onDelete={(id) => { onRemoveCollection(id); if (activeColId === id) setActiveColId('default'); }}
        onAdd={onAddCollection} />

      {/* 4. 收藏夹内容 */}
      <GlassPanel className="!p-3 sm:!p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark size={14} className="text-hermes-gold" />
          <h3 className="text-sm font-semibold text-hermes-text">{activeCol?.name || '收藏夹'}</h3>
          <span className="text-xs text-hermes-text-muted/40">({activeCol?.pluginIds?.length || 0})</span>
        </div>

        {activePlugins.length === 0 ? (
          <div className="text-center py-10 text-sm text-hermes-text-muted/30">
            {searchQuery ? '未找到匹配插件' : '收藏夹为空，在看板中点击卡片上的收藏按钮添加插件'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activePlugins.map(p => (
              <BookmarkPluginCard key={p.id} plugin={p} collectionId={activeCol?.id} onRemove={onRemovePlugin} t={t} />
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
