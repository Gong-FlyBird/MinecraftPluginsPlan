import { useState, useCallback, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import PluginCard from './PluginCard';
import PluginForm from './PluginForm';
import EmptyState from './EmptyState';
import { STATUSES } from '../utils/helpers';

export default function KanbanBoard({ plugins, onAddPlugin, onUpdatePlugin, onDeletePlugin, onMoveStatus }) {
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

  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    // Find target column status
    const targetCol = columns.find(c =>
      c.items.some(p => p.id === over.id) || over.id === c.value
    );
    if (targetCol && active.id !== over.id) {
      onMoveStatus(active.id, targetCol.value);
    }
  }, [columns, onMoveStatus]);

  const handleEdit = (plugin) => {
    setEditingPlugin(plugin);
    setFormOpen(true);
  };

  const handleSave = (data) => {
    if (editingPlugin) {
      onUpdatePlugin(editingPlugin.id, data);
    } else {
      onAddPlugin(data);
    }
    setEditingPlugin(null);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingPlugin(null);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">插件看板</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">拖拽卡片在各状态间移动</p>
        </div>
        <button
          onClick={() => { setEditingPlugin(null); setFormOpen(true); }}
          className="glass-btn glass-btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> 新建插件
        </button>
      </div>

      {/* Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {columns.map(col => (
            <div key={col.value} className="flex-1 glass rounded-xl p-4 min-h-[200px]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-hermes-border/30">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color.includes('blue') ? 'bg-blue-400' : col.color.includes('amber') ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <h3 className="text-sm font-semibold text-hermes-text">{col.label}</h3>
                </div>
                <span className="text-xs text-hermes-text-muted/50 bg-hermes-gold/8 px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>

              {/* Cards */}
              {col.items.length === 0 ? (
                <div className="text-center py-8 text-xs text-hermes-text-muted/40">
                  拖拽插件到此处
                </div>
              ) : (
                <SortableContext items={col.items.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {col.items.map(plugin => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      onEdit={handleEdit}
                      onDelete={onDeletePlugin}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activePlugin ? (
            <PluginCard plugin={activePlugin} dragOverlay onEdit={() => {}} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Plugin Form Modal */}
      <PluginForm
        open={formOpen}
        onClose={handleClose}
        onSave={handleSave}
        plugin={editingPlugin}
      />

      {/* Empty State (no plugins at all) */}
      {plugins.length === 0 && (
        <EmptyState
          title="还没有插件项目"
          description="点击「新建插件」开始规划你的 Minecraft 插件开发之旅"
          action={
            <button
              onClick={() => { setEditingPlugin(null); setFormOpen(true); }}
              className="glass-btn glass-btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={16} /> 新建第一个插件
            </button>
          }
        />
      )}
    </div>
  );
}
