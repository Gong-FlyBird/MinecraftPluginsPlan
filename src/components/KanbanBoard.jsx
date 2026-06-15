import { useState, useCallback, useMemo, useRef } from 'react';
import {
  DndContext, DragOverlay, closestCorners, pointerWithin, KeyboardSensor,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Edit3, Trash2, ChevronDown, Clock } from 'lucide-react';
import PluginForm from './PluginForm';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { STATUSES, calcProgress, timeAgo } from '../utils/helpers';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { toast } from './Toast';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function GridCard({ plugin, onEdit, onDelete, t }) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: plugin.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const progress = calcProgress(plugin.milestones);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={() => setExpanded(!expanded)}
      className={`glass-card overflow-hidden cursor-grab active:cursor-grabbing transition-all ${expanded ? '' : 'hover:bg-hermes-gold/[0.04]'}`}
    >
      <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
          plugin.status === 'planning' ? 'bg-blue-400' :
          plugin.status === 'developing' ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className="flex-1 text-sm font-semibold text-hermes-text truncate min-w-0">{plugin.name}</span>
        <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0 whitespace-nowrap">v{plugin.version}</span>
        <button onClick={e => { e.stopPropagation(); onEdit(plugin); }}
          className="glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><Edit3 size={11} /></button>
        <button onClick={e => { e.stopPropagation(); onDelete(plugin.id); }}
          className="glass-btn-danger !p-1 !border-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><Trash2 size={11} /></button>
        <ChevronDown size={11} className={`text-hermes-text-muted/20 flex-shrink-0 transition-transform ${expanded ? '' : 'rotate-180'}`} />
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-hermes-border/20 slide-up space-y-2 pt-2">
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
          {plugin.description && <p className="text-xs text-hermes-text-muted/70 line-clamp-3">{plugin.description}</p>}
          <div className="flex items-center gap-1 text-[10px] text-hermes-text-muted/40 pt-1">
            <Clock size={9} /><span>{timeAgo(plugin.updatedAt, t)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 状态标签（dnd-kit 落点 + 外部文件拖入） ── */
function StatusTab({ col, active, onClick, onExternalDrop, t }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.value });
  const [extDragOver, setExtDragOver] = useState(false);
  const colorMap = {
    planning: { bg: 'bg-blue-400', ring: 'ring-blue-400/40' },
    developing: { bg: 'bg-amber-400', ring: 'ring-amber-400/40' },
    released: { bg: 'bg-emerald-400', ring: 'ring-emerald-400/40' },
  };
  const c = colorMap[col.value] || colorMap.planning;

  return (
    <button ref={setNodeRef} onClick={onClick}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setExtDragOver(true); }}
      onDragLeave={() => setExtDragOver(false)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); setExtDragOver(false);
        Array.from(e.dataTransfer.files).forEach(f => onExternalDrop?.(f.name.replace(/\.[^.]+$/, ''), col.value)); }}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm text-sm font-semibold transition-all ${
        active ? 'bg-hermes-gold/10 text-hermes-gold ring-1 ring-hermes-gold/40'
          : 'text-hermes-text-muted/60 hover:text-hermes-text hover:bg-hermes-gold/[0.04]'
      } ${isOver || extDragOver ? 'ring-2 ' + c.ring + ' scale-[1.02]' : ''}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.bg}`} />
      <span>{t(`kanban.${col.value}`)}</span>
      <span className="text-xs text-hermes-text-muted/50 bg-hermes-gold/8 px-1.5 py-0.5 rounded-sm">{col.items.length}</span>
    </button>
  );
}

/* ── 网格落点区（dnd-kit + 外部文件拖入） ── */
function GridDrop({ status, onExternalDrop, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `grid-${status}` });
  const [extDragOver, setExtDragOver] = useState(false);

  return (
    <div
      ref={setNodeRef}
      onDragOver={e => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          setExtDragOver(true);
        }
      }}
      onDragLeave={() => setExtDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        setExtDragOver(false);
        Array.from(e.dataTransfer.files).forEach(f =>
          onExternalDrop?.(f.name.replace(/\.[^.]+$/, ''), status)
        );
      }}
      className={`transition-all rounded-sm ${isOver ? 'ring-2 ring-hermes-gold/30 bg-hermes-gold/[0.03]' : ''} ${extDragOver ? 'ring-2 ring-hermes-gold/50 bg-hermes-gold/10' : ''}`}
    >
      {extDragOver && (
        <div className="flex items-center justify-center py-8 text-sm font-semibold text-hermes-gold">
          松手放入插件
        </div>
      )}
      {!extDragOver && children}
    </div>
  );
}

/* ── 新建按钮 ── */
function NewPluginDrop({ onOpen, onDropFile, t }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'new-plugin' });
  const [dragOver, setDragOver] = useState(false);
  return (
    <button ref={setNodeRef} onClick={onOpen}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false);
        const f = Array.from(e.dataTransfer.files); if (f.length) onDropFile(f[0].name.replace(/\.[^.]+$/, '')); }}
      className={`glass-btn glass-btn-primary flex items-center gap-2 transition-all ${isOver || dragOver ? 'ring-2 ring-hermes-gold scale-105' : ''}`}
    >
      <Plus size={16} /> {isOver || dragOver ? '放入编辑' : t('kanban.new')}
    </button>
  );
}

/* ── 主组件 ── */
export default function KanbanBoard({ plugins, onAddPlugin, onUpdatePlugin, onDeletePlugin, onMoveTo, onReorder, t, onExternalDrop }) {
  const [activeTab, setActiveTab] = useState('planning');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() =>
    STATUSES.map(s => ({ ...s, items: plugins.filter(p => p.status === s.value) })),
    [plugins]
  );
  const activeCol = columns.find(c => c.value === activeTab) || columns[0];
  const activePlugin = activeId ? plugins.find(p => p.id === activeId) : null;

  /* ── ref 防 stale closure ── */
  const pluginsRef = useRef(plugins);
  pluginsRef.current = plugins;
  const onMoveToRef = useRef(onMoveTo);
  onMoveToRef.current = onMoveTo;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const p = pluginsRef.current;
    const move = onMoveToRef.current;
    const reorder = onReorderRef.current;

    if (over.id === 'new-plugin') {
      setEditingPlugin(p.find(pl => pl.id === active.id) || null);
      setFormOpen(true);
      return;
    }

    // 解析目标状态 — 标签按钮 / grid-区域 / 卡片
    const overStr = String(over.id);
    let toStatus = null;
    if (overStr.startsWith('grid-')) {
      toStatus = overStr.slice(5);
    } else {
      const colDef = STATUSES.find(s => s.value === overStr);
      if (colDef) {
        toStatus = colDef.value;
      } else {
        const card = p.find(pl => pl.id === overStr);
        if (card) toStatus = card.status;
      }
    }
    if (!toStatus) return;

    const fromPlugin = p.find(pl => pl.id === active.id);
    if (!fromPlugin) return;

    if (fromPlugin.status === toStatus) {
      // 同列排序
      const sameCol = p.filter(pl => pl.status === toStatus);
      const ids = sameCol.map(pl => pl.id);
      const oldIdx = ids.indexOf(active.id);
      const newIdx = ids.indexOf(over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx)
        reorder?.(arrayMove(ids, oldIdx, newIdx));
      return;
    }

    // 跨列
    const toCol = p.filter(pl => pl.status === toStatus);
    const overIdx = toCol.findIndex(pl => pl.id === over.id);
    move?.(active.id, toStatus, overIdx >= 0 ? overIdx : 999);
  }, []); // 空 deps，全靠 ref

  const openNew = () => { setEditingPlugin(null); setFormOpen(true); };
  const handleEdit = (pl) => { setEditingPlugin(pl); setFormOpen(true); };
  const handleDeleteClick = (id) => { setConfirmDelete(plugins.find(p => p.id === id)); };
  const handleSave = (data) => {
    if (!editingPlugin || !editingPlugin.id) {
      if (plugins.some(p => p.name === data.name)) { toast('warning', `插件「${data.name}」已存在`); return; }
      onAddPlugin(data);
    } else onUpdatePlugin(editingPlugin.id, data);
    setEditingPlugin(null);
  };
  const handleClose = () => { setFormOpen(false); setEditingPlugin(null); };
  const handleExternalFileOnNew = (name) => { setEditingPlugin({ name }); setFormOpen(true); };

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">{t('kanban.title')}</h1>
          <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">{t('kanban.subtitle')}</p>
        </div>
        <NewPluginDrop onOpen={openNew} onDropFile={handleExternalFileOnNew} t={t} />
      </div>

      <DndContext sensors={sensors} collisionDetection={(args) => {
        // 优先指针命中（标签按钮、卡片）
        const ptr = pointerWithin(args);
        if (ptr.length) return ptr;
        // 降级到最近角落（卡片间空白处排序用）
        return closestCorners(args);
      }}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* 标签栏（本身也是 dnd-kit 落点） */}
        <div className="flex gap-2 mb-4">
          {columns.map(col => (
            <StatusTab key={col.value} col={col}
              active={activeTab === col.value}
              onClick={() => setActiveTab(col.value)}
              onExternalDrop={onExternalDrop} t={t} />
          ))}
        </div>

        {/* 网格（整块区域可拖放） */}
        <GridDrop status={activeTab} onExternalDrop={onExternalDrop}>
          {activeCol.items.length === 0 ? (
            <div className="text-center py-10 text-sm text-hermes-text-muted/30 glass-card">
              拖拽插件到此处
            </div>
          ) : (
            <SortableContext items={activeCol.items.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeCol.items.map(plugin => (
                  <div key={plugin.id} className="group">
                    <GridCard plugin={plugin} onEdit={handleEdit} onDelete={handleDeleteClick} t={t} />
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </GridDrop>

        <DragOverlay>
          {activePlugin ? (
            <div className="glass-card px-3 py-2.5 flex items-center gap-2 shadow-gold">
              <span className={`w-2 h-2 rounded-full ${activePlugin.status === 'planning' ? 'bg-blue-400' : activePlugin.status === 'developing' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-sm font-semibold text-hermes-text truncate">{activePlugin.name}</span>
              <span className="text-[10px] text-hermes-text-muted/40">v{activePlugin.version}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <PluginForm open={formOpen} onClose={handleClose} onSave={handleSave} plugin={editingPlugin} t={t} />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="确认删除">
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-hermes-text-muted/70">
            确定要删除插件 <span className="text-hermes-text font-medium">{confirmDelete?.name}</span> 吗？
          </p>
          <p className="text-xs text-hermes-text-muted/40">此操作不可撤销。</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="glass-btn">取消</button>
            <button onClick={() => { onDeletePlugin(confirmDelete.id); setConfirmDelete(null); }}
              className="glass-btn glass-btn-primary !bg-red-500/80 hover:!bg-red-500">删除</button>
          </div>
        </div>
      </Modal>

      {plugins.length === 0 && <EmptyState title={t('timeline.empty')} description={t('stats.empty')}
        action={<button onClick={openNew} className="glass-btn glass-btn-primary flex items-center gap-2 mx-auto"><Plus size={16} /> {t('kanban.new')}</button>} />}
    </div>
  );
}
