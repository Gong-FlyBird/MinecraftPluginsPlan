import { useState, useCallback, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import PluginCard from './PluginCard';
import PluginForm from './PluginForm';
import EmptyState from './EmptyState';
import { STATUSES } from '../utils/helpers';

const COL_COLORS = {
  planning: 'bg-blue-400',
  developing: 'bg-amber-400',
  released: 'bg-emerald-400',
};

export default function KanbanBoard({ plugins, onAddPlugin, onUpdatePlugin, onDeletePlugin, onMoveStatus, onMoveTo, onReorder, t, onExternalDrop }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState(null);
  const [activeId, setActiveId] = useState(null);

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

  const activePlugin = useMemo(() =>
    activeId ? plugins.find(p => p.id === activeId) : null,
    [activeId, plugins]
  );

  const handleDragStart = useCallback(({ active }) => setActiveId(active.id), []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    // 拖到「新建插件」按钮 → 打开编辑
    if (over.id === 'new-plugin') {
      setEditingPlugin(plugins.find(p => p.id === active.id) || null);
      setFormOpen(true);
      return;
    }

    const fromCol = columns.find(c => c.items.some(p => p.id === active.id));
    const toCol = columns.find(c =>
      c.items.some(p => p.id === over.id) || c.value === over.id
    );
    if (!fromCol || !toCol) return;

    // 同列重排序
    if (fromCol.value === toCol.value) {
      const ids = fromCol.items.map(p => p.id);
      const oldIdx = ids.indexOf(active.id);
      const newIdx = ids.indexOf(over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newIds = arrayMove(ids, oldIdx, newIdx);
        onReorder?.(newIds);
      }
      return;
    }

    // 跨列移动
    const overIdx = toCol.items.findIndex(p => p.id === over.id);
    onMoveTo?.(active.id, toCol.value, overIdx >= 0 ? overIdx : 999);
  }, [columns, plugins, onMoveTo, onReorder]);

  const handleEdit = (plugin) => { setEditingPlugin(plugin); setFormOpen(true); };
  const handleSave = (data) => {
    if (!editingPlugin || !editingPlugin.id) {
      onAddPlugin(data);
    } else {
      onUpdatePlugin(editingPlugin.id, data);
    }
    setEditingPlugin(null);
  };
  const handleClose = () => { setFormOpen(false); setEditingPlugin(null); };

  const statusColor = (s) => COL_COLORS[s.value] || 'bg-gray-400';

  /* ── 新建按钮可拖放（支持外部文件拖入） ── */
  function NewPluginDrop() {
    const { setNodeRef, isOver } = useDroppable({ id: 'new-plugin' });
    const [dragOver, setDragOver] = useState(false);
    return (
      <button
        ref={setNodeRef}
        onClick={() => { setEditingPlugin(null); setFormOpen(true); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            const name = files[0].name.replace(/\.[^.]+$/, '');
            setEditingPlugin({ name });  // 预填文件名
            setFormOpen(true);
          }
        }}
        className={`glass-btn glass-btn-primary flex items-center gap-2 transition-all ${
          isOver || dragOver ? 'ring-2 ring-hermes-gold scale-105' : ''
        }`}
      >
        <Plus size={16} /> {isOver || dragOver ? '放入编辑' : t('kanban.new')}
      </button>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">{t('kanban.title')}</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">{t('kanban.subtitle')}</p>
        </div>
        <NewPluginDrop />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {columns.map(col => (
            <div
              key={col.value}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={e => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                files.forEach(f => {
                  const name = f.name.replace(/\.[^.]+$/, ''); // 去掉扩展名
                  onExternalDrop?.(name, col.value);
                });
              }}
              className={`flex-1 glass p-4 min-h-[200px] shrink-0 transition-all ${
                false ? 'ring-2 ring-hermes-gold/40 bg-hermes-gold/5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-hermes-border/30">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColor(col)}`} />
                  <h3 className="text-sm font-semibold text-hermes-text">{t(`kanban.${col.value}`)}</h3>
                </div>
                <span className="text-xs text-hermes-text-muted/50 bg-hermes-gold/8 px-2 py-0.5">
                  {col.items.length}
                </span>
              </div>

              {col.items.length === 0 ? (
                <div className="text-center py-8 text-xs text-hermes-text-muted/40">{t('kanban.drop')}</div>
              ) : (
                <SortableContext items={col.items.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {col.items.map(plugin => (
                    <PluginCard key={plugin.id} plugin={plugin}
                      onEdit={handleEdit} onDelete={onDeletePlugin} t={t} />
                  ))}
                </SortableContext>
              )}
            </div>
          ))}
        </div>

        <DragOverlay>
          {activePlugin ? (
            <PluginCard plugin={activePlugin} dragOverlay onEdit={() => {}} onDelete={() => {}} t={t} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <PluginForm open={formOpen} onClose={handleClose} onSave={handleSave} plugin={editingPlugin} t={t} />

      {plugins.length === 0 && (
        <EmptyState
          title={t('timeline.empty')}
          description={t('stats.empty')}
          action={
            <button onClick={() => { setEditingPlugin(null); setFormOpen(true); }}
              className="glass-btn glass-btn-primary flex items-center gap-2 mx-auto">
              <Plus size={16} /> {t('kanban.new')}
            </button>
          }
        />
      )}
    </div>
  );
}
