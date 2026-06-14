import { useMemo } from 'react';
import { Clock, Package, GitCommit, Star } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import { timeAgo, formatDateTime } from '../utils/helpers';

const ACTION_ICONS = {
  created: { icon: Star, color: 'text-hermes-gold' },
  updated: { icon: GitCommit, color: 'text-blue-400' },
  status: { icon: Package, color: 'text-amber-400' },
};

export default function TimelineView({ plugins }) {
  const events = useMemo(() => {
    const evts = [];
    plugins.forEach(p => {
      (p.timeline || []).forEach(t => {
        evts.push({ ...t, pluginName: p.name, pluginId: p.id });
      });
    });
    return evts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [plugins]);

  if (plugins.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="暂无活动记录"
        description="创建插件后，这里将显示所有变更历史"
      />
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hermes-text">时间线</h1>
        <p className="text-sm text-hermes-text-muted/60 mt-1">按时间顺序回顾所有插件开发动态</p>
      </div>

      {/* Stats Summary */}
      <GlassPanel className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-hermes-gold">{plugins.length}</div>
            <div className="text-[11px] text-hermes-text-muted/50 mt-1">插件总数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-hermes-gold">{events.length}</div>
            <div className="text-[11px] text-hermes-text-muted/50 mt-1">事件总数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-hermes-gold">
              {plugins.filter(p => p.status === 'released').length}
            </div>
            <div className="text-[11px] text-hermes-text-muted/50 mt-1">已发布</div>
          </div>
        </div>
      </GlassPanel>

      {/* Timeline */}
      {events.length === 0 ? (
        <EmptyState icon={Clock} title="暂无事件" />
      ) : (
        <div className="space-y-2">
          {events.map((evt, idx) => {
            const meta = ACTION_ICONS[evt.action] || { icon: GitCommit, color: 'text-hermes-text-muted' };
            const Icon = meta.icon;
            return (
              <div key={evt.id || idx} className="timeline-line flex gap-4 pl-1">
                {/* Dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-6 h-6 rounded-full glass flex items-center justify-center ${meta.color}`}>
                    <Icon size={12} />
                  </div>
                </div>
                {/* Content */}
                <GlassPanel className="flex-1 !py-3 !px-4 mb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-hermes-text">{evt.pluginName}</span>
                      <span className="text-sm text-hermes-text-muted/70 ml-2">{evt.detail || ''}</span>
                    </div>
                    <span className="text-[10px] text-hermes-text-muted/40 whitespace-nowrap" title={formatDateTime(evt.timestamp)}>
                      {timeAgo(evt.timestamp)}
                    </span>
                  </div>
                </GlassPanel>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
