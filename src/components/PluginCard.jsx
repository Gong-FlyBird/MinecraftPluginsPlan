import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3, Trash2, Clock, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { timeAgo, calcProgress } from '../utils/helpers';

export default function PluginCard({ plugin, onEdit, onDelete, dragOverlay }) {
  const [expanded, setExpanded] = useState(false);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: plugin.id, disabled: dragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !dragOverlay ? 0.4 : 1,
  };

  const progress = calcProgress(plugin.milestones);

  // 状态指示器颜色
  const statusColor =
    plugin.status === 'planning' ? 'bg-blue-400' :
    plugin.status === 'developing' ? 'bg-amber-400' :
    'bg-emerald-400';

  const handleClick = () => setExpanded(prev => !prev);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card mb-3 group overflow-hidden ${
        isDragging ? 'dragging' : ''
      } ${dragOverlay ? 'scale-105 shadow-gold' : ''}`}
    >
      {/* ── 折叠状态：只有插件名 ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={handleClick}
      >
        {/* 拖拽手柄 */}
        <button
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          className="text-hermes-text-muted/30 hover:text-hermes-gold/50 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical size={15} />
        </button>

        {/* 状态圆点 */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />

        {/* 插件名 */}
        <span className="flex-1 text-sm font-semibold text-hermes-text truncate">
          {plugin.name || '未命名插件'}
        </span>

        {/* 版本号（轻量显示） */}
        <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0">
          v{plugin.version}
        </span>

        {/* 展开箭头 */}
        <button
          onClick={e => { e.stopPropagation(); setExpanded(prev => !prev); }}
          className="text-hermes-text-muted/30 hover:text-hermes-gold/60 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* 操作按钮（悬停显示） */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(plugin); }}
            className="glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(plugin.id); }}
            className="glass-btn-danger !p-1 !border-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* ── 展开区域：详细信息 ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-hermes-border/30 slide-up">
          {/* Tags */}
          {plugin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {plugin.tags.map((t, i) => (
                <span key={i} className="tag text-[10px]">{t}</span>
              ))}
            </div>
          )}

          {/* Meta Row */}
          <div className="flex items-center gap-3 mb-2 text-xs text-hermes-text-muted/70">
            <StatusBadge status={plugin.status} />
            <PriorityBadge priority={plugin.priority} />
            <span className="flex items-center gap-1">
              <Tag size={11} /> v{plugin.version}
            </span>
          </div>

          {/* MC Version */}
          <div className="text-xs text-hermes-text-muted/50 mb-3">Minecraft {plugin.mcVersion}</div>

          {/* Progress */}
          {plugin.milestones?.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-hermes-text-muted/60 mb-1">
                <span>进度</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Description */}
          {plugin.description && (
            <p className="text-xs text-hermes-text-muted/70 mb-2 leading-relaxed">{plugin.description}</p>
          )}

          {/* Changelog Preview */}
          {plugin.changelog && (
            <p className="text-xs text-hermes-text-muted/50 line-clamp-3 mb-2 leading-relaxed">{plugin.changelog}</p>
          )}

          {/* Time */}
          <div className="flex items-center gap-1 text-[10px] text-hermes-text-muted/40 mt-2">
            <Clock size={10} />
            <span>{timeAgo(plugin.updatedAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
