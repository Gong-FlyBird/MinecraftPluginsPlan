import { useState, useCallback, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import PluginForm from './PluginForm';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { STATUSES } from '../utils/helpers';

/** 排序用的卡片 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ── 可拖拽的插件卡片（网格版） ── */
function GridCard({ plugin, onEdit, onDelete, t }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: plugin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card px-3 py-2.5 cursor-grab active:cursor-grabbing flex items-center gap-2 min-w-0"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
        plugin.status === 'planning' ? 'bg-blue-400' :
        plugin.status === 'developing' ? 'bg-amber-400' : 'bg-emerald-400'
      }`} />
      <span className="flex-1 text-sm font-semibold text-hermes-text truncate min-w-0">
        {plugin.name}
      </span>
      <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0 whitespace-nowrap">v{plugin.version}</span>
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onEdit(plugin); }}
          className="glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8"><Edit3 size={11} /></button>
        <button onClick={e => { e.stopPropagation(); onDelete(plugin.id); }}
          className="glass-btn-danger !p-1 !border-0"><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

/* ── 状态标签按钮（也是拖放目标） ── */
function StatusTab({ col, active, onClick, onExternalDrop, t }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.value });
  const [extDragOver, setExtDragOver] = useState(false);

  const colorMap = {
    planning: { bg: 'bg-blue-400', text: 'text-blue-400', ring: 'ring-blue-400/40' },
    developing: { bg: 'bg-amber-400', text: 'text-amber-400', ring: 'ring-amber-400/40' },
    released: { bg: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/40' },
  };
  const c = colorMap[col.value] || colorMap.planning;

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setExtDragOver(true); }}
      onDragLeave={() => setExtDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setExtDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach(f => {
          const name = f.name.replace(/\.[^.]+$/, '');
          onExternalDrop?.(name, col.value);
        });
      }}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all ${
        active
          ? `bg-hermes-gold/10 text-hermes-gold ring-1 ring-hermes-gold/40`
          : `text-hermes-text-muted/60 hover:text-hermes-text hover:bg-hermes-gold/[0.04]`
      } ${isOver ? 'ring-2 ' + c.ring + ' scale-[1.02]' : ''} ${extDragOver ? 'ring-2 ring-purple-400/40' : ''}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.bg}`} />
      <span>{t(`kanban.${col.value}`)}</span>
      <span className="text-xs text-hermes-text-muted/50 bg-hermes-gold/8 px-1.5 py-0.5 rounded-sm">{col.items.length}</span>
    </button>
  );
}

/* ── 新建按钮 ── */
function NewPluginDrop({ onOpen, onDropFile, t }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'new-plugin' });
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const name = files[0].name.replace(/\.[^.]+$/, '');
      onDropFile(name);
    }
  };

  return (
    <button
      ref={setNodeRef}
      onClick={onOpen}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`glass-btn glass-btn-primary flex items-center gap-2 transition-all ${
        isOver || dragOver ? 'ring-2 ring-hermes-gold scale-105' : ''
      }`}
    >
      <Plus size={16} /> {isOver || dragOver ? '放入编辑' : t('kanban.new')}
    </button>
  );
}

/* ── 看板主组件 ── */
export default function KanbanBoard({ plugins, onAddPlugin, onUpdatePlugin, onDeletePlugin, onMoveStatus, onMoveTo, onReorder, t, onExternalDrop }) {
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
    STATUSES.map(s => ({
      ...s,
      items: plugins.filter(p => p.status === s.value),
    })),
    [plugins]
  );

  const activeCol = useMemo(() =>
    columns.find(c => c.value === activeTab) || columns[0],
    [columns, activeTab]
  );

  const activePlugin = useMemo(() =>
    activeId ? plugins.find(p => p.id === activeId) : null,
    [activeId, plugins]
  );

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    // 拖到新建按钮 → 打开编辑
    if (over.id === 'new-plugin') {
      setEditingPlugin(plugins.find(p => p.id === active.id) || null);
      setFormOpen(true);
      return;
    }

    const fromCol = columns.find(c => c.items.some(p => p.id === active.id));
    // over.id 可能是 status 值（拖到标签）或卡片 id（拖到卡片上）
    const toCol = columns.find(c =>
      c.items.some(p => p.id === over.id) || c.value === over.id
    );
    if (!fromCol || !toCol) return;

    // 同列重排序
    if (fromCol.value === toCol.value) {
      const ids = fromCol.items.map(p => p.id);
      const oldIdx = ids.indexOf(active.id);
      // 如果 over.id 是卡片
      const newIdx = ids.indexOf(over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        onReorder?.(arrayMove(ids, oldIdx, newIdx));
      }
      return;
    }

    // 跨列移动（拖到标签按钮或另一列的卡片）
    const overIdx = toCol.items.findIndex(p => p.id === over.id);
    onMoveTo?.(active.id, toCol.value, overIdx >= 0 ? overIdx : 999);
  }, [columns, plugins, onMoveTo, onReorder]);

  const openNew = () => { setEditingPlugin(null); setFormOpen(true); };
  const handleEdit = (plugin) => { setEditingPlugin(plugin); setFormOpen(true); };
  const handleDeleteClick = (id) => { setConfirmDelete(plugins.find(p => p.id === id)); };
  const handleSave = (data) => {
    if (!editingPlugin || !editingPlugin.id) {
      onAddPlugin(data);
    } else {
      onUpdatePlugin(editingPlugin.id, data);
    }
    setEditingPlugin(null);
  };
  const handleClose = () => { setFormOpen(false); setEditingPlugin(null); };
  const handleExternalFileOnNew = (name) => {
    setEditingPlugin({ name });
    setFormOpen(true);
  };

  return (
    <div className="fade-in">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">{t('kanban.title')}</h1>
          <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">{t('kanban.subtitle')}</p>
        </div>
        <NewPluginDrop onOpen={openNew} onDropFile={handleExternalFileOnNew} t={t} />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* 状态标签栏 */}
        <div className="flex gap-2 mb-4">
          {columns.map(col => (
            <StatusTab
              key={col.value}
              col={col}
              active={activeTab === col.value}
              onClick={() => setActiveTab(col.value)}
              onExternalDrop={onExternalDrop}
              t={t}
            />
          ))}
        </div>

        {/* 当前状态插件网格 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-hermes-text-muted/40">
              {activeCol.items.length} 个插件
            </span>
          </div>

          {activeCol.items.length === 0 ? (
            <div className="text-center py-10 text-sm text-hermes-text-muted/30 glass-card">
              拖拽插件到「{t(`kanban.${activeCol.value}`)}」标签，或从外部拖入文件
            </div>
          ) : (
            <SortableContext
              items={activeCol.items.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeCol.items.map(plugin => (
                  <div key={plugin.id} className="group">
                    <GridCard
                      plugin={plugin}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      t={t}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        <DragOverlay>
          {activePlugin ? (
            <div className="glass-card px-3 py-2.5 flex items-center gap-2 shadow-gold">
              <span className={`w-2 h-2 rounded-full ${
                activePlugin.status === 'planning' ? 'bg-blue-400' :
                activePlugin.status === 'developing' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className="text-sm font-semibold text-hermes-text truncate">{activePlugin.name}</span>
              <span className="text-[10px] text-hermes-text-muted/40">v{activePlugin.version}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <PluginForm open={formOpen} onClose={handleClose} onSave={handleSave} plugin={editingPlugin} t={t} />

      {/* 删除确认 */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="确认删除">
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-hermes-text-muted/70">
            确定要删除插件 <span className="text-hermes-text font-medium">{confirmDelete?.name}</span> 吗？
          </p>
          <p className="text-xs text-hermes-text-muted/40">此操作不可撤销，关联的灵感也将一并移除。</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="glass-btn">取消</button>
            <button onClick={() => { onDeletePlugin(confirmDelete.id); setConfirmDelete(null); }}
              className="glass-btn glass-btn-primary !bg-red-500/80 hover:!bg-red-500">删除</button>
          </div>
        </div>
      </Modal>

      {plugins.length === 0 && (
        <EmptyState title={t('timeline.empty')} description={t('stats.empty')}
          action={
            <button onClick={openNew}
              className="glass-btn glass-btn-primary flex items-center gap-2 mx-auto">
              <Plus size={16} /> {t('kanban.new')}
            </button>
          }
        />
      )}
    </div>
  );
}
