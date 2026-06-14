import { useState, useMemo } from 'react';
import { Calendar, Target, CheckCircle2, Clock, Tag } from 'lucide-react';
import GlassPanel from './GlassPanel';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { calcProgress, timeAgo } from '../utils/helpers';

export default function SprintBoard({ plugins, t }) {
  const [viewMode, setViewMode] = useState('week');
  const [detailPlugin, setDetailPlugin] = useState(null);

  const sprintData = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const cutoff = viewMode === 'week' ? weekAgo : monthAgo;
    const active = [], completed = [], upcoming = [];

    plugins.forEach(p => {
      const progress = calcProgress(p.milestones);
      const recent = (p.updatedAt || 0) > cutoff;
      if (p.status === 'released') completed.push(p);
      else if (recent && progress > 0) active.push(p);
      else if (recent || progress === 0) upcoming.push(p);
      else active.push(p);
    });
    return { active, completed, upcoming };
  }, [plugins, viewMode]);

  if (plugins.length === 0) {
    return <EmptyState icon={Target} title={t('sprint.title')} description={t('sprint.subtitle')} />;
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">{t('sprint.title')}</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">{t('sprint.subtitle')}</p>
        </div>
        <div className="flex gap-1 bg-hermes-gold/8 p-1">
          <button onClick={() => setViewMode('week')}
            className={`glass-btn !py-1.5 !px-4 text-xs ${viewMode === 'week' ? 'glass-btn-primary' : ''}`}>{t('sprint.week')}</button>
          <button onClick={() => setViewMode('month')}
            className={`glass-btn !py-1.5 !px-4 text-xs ${viewMode === 'month' ? 'glass-btn-primary' : ''}`}>{t('sprint.month')}</button>
        </div>
      </div>

      {['active', 'upcoming', 'completed'].map(section => {
        const items = sprintData[section];
        const meta = {
          active: { icon: Clock, color: 'text-amber-400' },
          upcoming: { icon: Calendar, color: 'text-blue-400' },
          completed: { icon: CheckCircle2, color: 'text-emerald-400' },
        }[section];
        const Icon = meta.icon;

        return (
          <div key={section} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon size={18} className={meta.color} />
              <div>
                <h3 className="text-sm font-semibold text-hermes-text">{t(`sprint.${section}`)}</h3>
                <p className="text-[11px] text-hermes-text-muted/50">{t(section === 'completed' ? `sprint.completed.${viewMode}` : `sprint.${section}.desc`)}</p>
              </div>
              <span className="ml-auto text-xs text-hermes-text-muted/40">{t('sprint.count', { count: items.length })}</span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 text-sm text-hermes-text-muted/30 glass-card">{t('sprint.empty')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(p => {
                  const progress = calcProgress(p.milestones);
                  return (
                    <GlassPanel key={p.id} className="!py-3 !px-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                      onClick={() => setDetailPlugin(p)}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-hermes-text">{p.name}</h4>
                        <span className="tag text-[10px]">{t(`status.${p.status}`)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-hermes-text-muted/50 mb-2">
                        <span>v{p.version}</span><span>·</span><span>MC {p.mcVersion}</span>
                      </div>
                      {p.milestones?.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-hermes-text-muted/50 mb-1">
                            <span>{t('app.progress')}</span><span>{progress}%</span>
                          </div>
                          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                        </div>
                      )}
                    </GlassPanel>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* 插件详情弹窗 */}
      <Modal open={!!detailPlugin} onClose={() => setDetailPlugin(null)}
        title={detailPlugin?.name || ''}>
        {detailPlugin && (
          <div className="px-6 py-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <StatusBadge status={detailPlugin.status} t={t} />
              <PriorityBadge priority={detailPlugin.priority} t={t} />
              <span className="text-hermes-text-muted/50">v{detailPlugin.version}</span>
              <span className="text-hermes-text-muted/50">MC {detailPlugin.mcVersion}</span>
            </div>

            {detailPlugin.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {detailPlugin.tags.map((tag, i) => (
                  <span key={i} className="tag text-xs">{tag}</span>
                ))}
              </div>
            )}

            {detailPlugin.milestones?.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-hermes-text-muted/60 mb-1">
                  <span>{t('app.progress')}</span>
                  <span>{calcProgress(detailPlugin.milestones)}%</span>
                </div>
                <div className="progress-bar h-2"><div className="progress-bar-fill" style={{ width: `${calcProgress(detailPlugin.milestones)}%` }} /></div>
              </div>
            )}

            {detailPlugin.milestones?.map(m => (
              <div key={m.id} className="border-l-2 border-hermes-border/30 pl-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-hermes-text">{m.title}</span>
                  <span className="text-[10px] text-hermes-text-muted/40">{timeAgo(m.createdAt, t)}</span>
                </div>
                {m.tasks?.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {m.tasks.map(task => (
                      <label key={task.id} className="flex items-center gap-2 text-xs text-hermes-text-muted/60">
                        <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${task.done ? 'bg-hermes-gold border-hermes-gold' : 'border-hermes-border/50'}`}>
                          {task.done && <span className="text-white text-[8px]">✓</span>}
                        </span>
                        {task.text}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {detailPlugin.description && (
              <div>
                <h4 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider mb-1">{t('plugin.description')}</h4>
                <p className="text-sm text-hermes-text-muted/70">{detailPlugin.description}</p>
              </div>
            )}

            <div className="text-[10px] text-hermes-text-muted/40 pt-2 border-t border-hermes-border/30">
              {t('timeline.updated')}: {timeAgo(detailPlugin.updatedAt, t)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
