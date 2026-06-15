import { useSortable } from '@dnd-kit/sortable';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CSS } from '@dnd-kit/utilities';
import { Edit3, Trash2, Clock, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { timeAgo, calcProgress } from '../utils/helpers';

export default function PluginCard({ plugin, onEdit, onDelete, dragOverlay, t }) {
  const [expandedMap, setExpandedMap] = useLocalStorage('plugin-expanded', {});
  const expanded = expandedMap[plugin.id] || false;

  const setExpanded = (val) => setExpandedMap(prev => ({ ...prev, [plugin.id]: val }));

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: plugin.id, disabled: dragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !dragOverlay ? 0.4 : 1,
  };

  const progress = calcProgress(plugin.milestones);

  const statusColor =
    plugin.status === 'planning' ? 'bg-blue-400' :
    plugin.status === 'developing' ? 'bg-amber-400' :
    'bg-emerald-400';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card mb-3 group overflow-hidden cursor-grab active:cursor-grabbing ${isDragging ? 'dragging' : ''} ${dragOverlay ? 'scale-105 shadow-gold' : ''}`}
    >
      {/* Collapsed: name only */}
      <div
        className="flex items-center gap-3 px-4 py-3 select-none"
        onClick={() => setExpanded(!expanded)}
      >

        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />

        <span className="flex-1 text-sm font-semibold text-hermes-text truncate">
          {plugin.name || t('kanban.noName')}
        </span>

        <span className="text-[10px] text-hermes-text-muted/40 flex-shrink-0">v{plugin.version}</span>

        <button onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-hermes-text-muted/30 hover:text-hermes-gold/60 transition-colors flex-shrink-0 tap-target flex items-center justify-center">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex gap-1 flex-shrink-0 touch-actions md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(plugin); }}
            className="glass-btn !p-1.5 !border-0 hover:!bg-hermes-gold/8 tap-target flex items-center justify-center"><Edit3 size={14} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(plugin.id); }}
            className="glass-btn-danger !p-1.5 !border-0 tap-target flex items-center justify-center"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Expanded: details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-hermes-border/30 slide-up">
          {plugin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {plugin.tags.map((t, i) => (<span key={i} className="tag text-[10px]">{t}</span>))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-2 text-xs text-hermes-text-muted/70">
            <StatusBadge status={plugin.status} t={t} />
            <PriorityBadge priority={plugin.priority} t={t} />
            <span className="flex items-center gap-1"><Tag size={11} /> v{plugin.version}</span>
          </div>

          <div className="text-xs text-hermes-text-muted/50 mb-3">MC {plugin.mcVersion}</div>

          {plugin.milestones?.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-hermes-text-muted/60 mb-1">
                <span>{t('app.progress')}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {plugin.description && (
            <p className="text-xs text-hermes-text-muted/70 mb-2 leading-relaxed">{plugin.description}</p>
          )}

          {plugin.changelog && (
            <p className="text-xs text-hermes-text-muted/50 line-clamp-3 mb-2 leading-relaxed">{plugin.changelog}</p>
          )}

          <div className="flex items-center gap-1 text-[10px] text-hermes-text-muted/40 mt-2">
            <Clock size={10} />
            <span>{timeAgo(plugin.updatedAt, t)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
