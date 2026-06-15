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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">{t('stats.title')}</h1>
        <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">{t('stats.subtitle')}</p>
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

      {/* 环形图 + 柱状图 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassPanel>
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.status')}</h3>
          <div className="flex items-center gap-4">
            {/* Donut */}
            <svg width="100" height="100" viewBox="0 0 36 36" className="flex-shrink-0">
              {STATUSES.reduce((acc, s, i) => {
                const count = stats.statusCounts[s.value] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const colors = ['#2563eb', '#b45309', '#059669'];
                const offset = acc.offset;
                const dash = (pct / 100) * 25.13;
                acc.elements.push(
                  <circle key={s.value} cx="18" cy="18" r="15.915" fill="none"
                    stroke={colors[i]} strokeWidth="3.5" strokeDasharray={`${dash} ${25.13 - dash}`}
                    strokeDashoffset={offset} strokeLinecap="butt"
                    transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                );
                acc.offset = offset - dash;
                return acc;
              }, { offset: 0, elements: [] }).elements}
            </svg>
            <div className="flex-1 space-y-2">
              {STATUSES.map((s, i) => {
                const count = stats.statusCounts[s.value] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const dots = ['bg-blue-400', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div key={s.value} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${dots[i]} flex-shrink-0`} />
                    <span className="text-hermes-text-muted/70 flex-1">{t(`status.${s.value}`)}</span>
                    <span className="text-hermes-gold font-medium">{count}</span>
                    <span className="text-hermes-text-muted/40 w-8 text-right">{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('stats.priority')}</h3>
          <div className="space-y-3">
            {PRIORITIES.map(p => {
              const count = stats.priorityCounts[p.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const bars = { high: { bg: '#ef4444', w: 'bg-red-400' }, medium: { bg: '#f59e0b', w: 'bg-amber-400' }, low: { bg: '#94a3b8', w: 'bg-slate-400' } };
              const bar = bars[p.value] || bars.low;
              return (
                <div key={p.value} className="flex items-center gap-3">
                  <span className="text-xs text-hermes-text-muted/70 w-12 flex-shrink-0">{t(`priority.${p.value}`)}</span>
                  <div className="flex-1 h-6 bg-hermes-line/50 rounded-sm relative overflow-hidden">
                    <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${pct}%`, background: bar.bg }} />
                  </div>
                  <span className="text-xs text-hermes-gold w-8 text-right font-medium">{count}</span>
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
