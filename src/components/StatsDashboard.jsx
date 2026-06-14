import { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import { STATUSES, PRIORITIES, calcProgress } from '../utils/helpers';

export default function StatsDashboard({ plugins, t }) {
  const stats = useMemo(() => {
    const statusCounts = {};
    const priorityCounts = {};
    const tagCounts = {};
    let totalTasks = 0, doneTasks = 0, milestonesTotal = 0;

    STATUSES.forEach(s => statusCounts[s.value] = 0);
    PRIORITIES.forEach(p => priorityCounts[p.value] = 0);

    plugins.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
      (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
      (p.milestones || []).forEach(m => {
        milestonesTotal++;
        (m.tasks || []).forEach(t => { totalTasks++; if (t.done) doneTasks++; });
      });
    });

    return {
      milestones: milestonesTotal,
      total: plugins.length,
      statusCounts, priorityCounts,
      tagCounts: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
      completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      totalTasks, doneTasks,
      avgProgress: plugins.length > 0
        ? Math.round(plugins.reduce((s, p) => s + calcProgress(p.milestones), 0) / plugins.length)
        : 0,
    };
  }, [plugins]);

  if (plugins.length === 0) {
    return <EmptyState icon={BarChart3} title={t('stats.empty')} />;
  }

  const metrics = [
    { icon: Activity, labelKey: 'stats.plugins', value: stats.total, color: 'text-hermes-gold' },
    { icon: TrendingUp, labelKey: 'stats.rate', value: `${stats.completionRate}%`, color: 'text-emerald-400' },
    { icon: BarChart3, labelKey: 'stats.milestones', value: stats.milestones, color: 'text-blue-400' },
    { icon: PieChart, labelKey: 'stats.avgProgress', value: `${stats.avgProgress}%`, color: 'text-amber-400' },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hermes-text">{t('stats.title')}</h1>
        <p className="text-sm text-hermes-text-muted/60 mt-1">{t('stats.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((item, i) => (
          <GlassPanel key={i} className="text-center py-6">
            <item.icon size={20} className={`${item.color} mx-auto mb-3`} />
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-[11px] text-hermes-text-muted/50 mt-1">{t(item.labelKey)}</div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassPanel>
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.status')}</h3>
          <div className="space-y-3">
            {STATUSES.map(s => {
              const count = stats.statusCounts[s.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const color = s.color.includes('blue') ? 'bg-blue-400' : s.color.includes('amber') ? 'bg-amber-400' : 'bg-emerald-400';
              return (
                <div key={s.value}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-hermes-text-muted/70">{t(`status.${s.value}`)}</span>
                    <span className="text-hermes-gold">{count}</span>
                  </div>
                  <div className="progress-bar"><div style={{ width: `${pct}%`, background: color.replace('bg-', '') }} className="progress-bar-fill" /></div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel>
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.priority')}</h3>
          <div className="space-y-3">
            {PRIORITIES.map(p => {
              const count = stats.priorityCounts[p.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const color = p.value === 'high' ? 'bg-red-400' : p.value === 'medium' ? 'bg-amber-400' : 'bg-slate-400';
              return (
                <div key={p.value}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-hermes-text-muted/70">{t(`priority.${p.value}`)}</span>
                    <span className="text-hermes-gold">{count}</span>
                  </div>
                  <div className="progress-bar"><div style={{ width: `${pct}%`, background: color.replace('bg-', '') }} className="progress-bar-fill" /></div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {stats.tagCounts.length > 0 && (
        <GlassPanel>
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {stats.tagCounts.map(([tag, count]) => (
              <span key={tag} className="tag flex items-center gap-1.5">{tag}<span className="text-[10px] text-hermes-text-muted/60">×{count}</span></span>
            ))}
          </div>
        </GlassPanel>
      )}

      {stats.totalTasks > 0 && (
        <GlassPanel className="mt-6">
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.tasks')}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hermes-text-muted/70">{t('stats.tasks.detail', { done: stats.doneTasks, total: stats.totalTasks })}</span>
            <span className="text-lg font-bold text-hermes-gold">{stats.completionRate}%</span>
          </div>
          <div className="progress-bar h-3"><div className="progress-bar-fill" style={{ width: `${stats.completionRate}%` }} /></div>
        </GlassPanel>
      )}
    </div>
  );
}
