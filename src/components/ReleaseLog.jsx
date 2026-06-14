import { useState, useMemo } from 'react';
import { Plus, Package, Clock, Trash2, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import { formatDate, timeAgo } from '../utils/helpers';

export default function ReleaseLog({ plugins, onAddRelease, onDeleteRelease, t }) {
  const [expanded, setExpanded] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ pluginId: '', version: '', title: '', notes: '' });

  const allReleases = useMemo(() => {
    const releases = [];
    plugins.forEach(p => {
      (p.releases || []).forEach(r => {
        releases.push({ ...r, _pluginName: p.name, _pluginVersion: p.version, _pluginStatus: p.status, _pluginId: p.id });
      });
    });
    return releases.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [plugins]);

  const handleSubmit = () => {
    if (!form.pluginId || !form.version) return;
    onAddRelease(form.pluginId, {
      version: form.version,
      title: form.title || `v${form.version}`,
      notes: form.notes,
      createdAt: Date.now(),
    });
    setForm({ pluginId: '', version: '', title: '', notes: '' });
    setFormVisible(false);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">版本发布</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">管理各个插件的版本发布记录</p>
        </div>
        <button onClick={() => setFormVisible(!formVisible)}
          className="glass-btn glass-btn-primary flex items-center gap-2">
          <Plus size={16} /> 新版本
        </button>
      </div>

      {/* 新增表单 */}
      {formVisible && (
        <GlassPanel className="mb-6 slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select value={form.pluginId} onChange={e => setForm(f => ({ ...f, pluginId: e.target.value }))}
              className="glass-input glass-select">
              <option value="" className="bg-white">选择插件 *</option>
              {plugins.map(p => <option key={p.id} value={p.id} className="bg-white">{p.name}</option>)}
            </select>
            <input type="text" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              className="glass-input" placeholder="版本号 ex: 1.0.0 *" />
          </div>
          <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="glass-input mb-3" placeholder="发布标题（可选）" />
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="glass-input min-h-[80px] resize-y mb-3" placeholder="发布说明…" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setFormVisible(false)} className="glass-btn">{t('app.cancel')}</button>
            <button onClick={handleSubmit} className="glass-btn glass-btn-primary">发布</button>
          </div>
        </GlassPanel>
      )}

      {/* 列表 */}
      {allReleases.length === 0 ? (
        <EmptyState icon={Package} title="暂无发布" description="发布插件的第一个版本" />
      ) : (
        <div className="space-y-3">
          {allReleases.map(r => {
            const isExpanded = expanded[r.id];
            return (
              <GlassPanel key={r.id} className="!p-0 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                  onClick={() => setExpanded(p => ({ ...p, [r.id]: !p[r.id] }))}>
                  <Package size={18} className="text-hermes-gold flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-hermes-text">{r._pluginName}</span>
                      <span className="tag text-[10px]">v{r.version}</span>
                      {r._pluginVersion !== r.version && (
                        <span className="tag text-[10px] bg-hermes-gold/10 text-hermes-gold">当前 v{r._pluginVersion}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-hermes-text-muted/70">{r.title}</span>
                      <span className="text-[10px] text-hermes-text-muted/40">{timeAgo(r.createdAt, t)}</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onDeleteRelease(r._pluginId, r.id); }}
                    className="glass-btn-danger !p-1.5 !border-0 opacity-0 hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
                {isExpanded && r.notes && (
                  <div className="px-5 pb-4 border-t border-hermes-border/30 pt-3">
                    <p className="text-sm text-hermes-text-muted/80 whitespace-pre-wrap">{r.notes}</p>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
