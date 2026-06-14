import { useState, useMemo } from 'react';
import { Plus, Package, Clock, Trash2, Edit3, Pin, PinOff, ChevronDown, ChevronRight } from 'lucide-react';
import GlassPanel from './GlassPanel';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { timeAgo } from '../utils/helpers';
import { toast } from '../components/Toast';

export default function ReleaseLog({ plugins, onAddRelease, onDeleteRelease, onUpdateRelease, onPinRelease, t }) {
  const [expanded, setExpanded] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [form, setForm] = useState({ pluginId: '', version: '', title: '', notes: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const allReleases = useMemo(() => {
    const releases = [];
    plugins.forEach(p => {
      (p.releases || []).forEach(r => {
        releases.push({ ...r, _pluginName: p.name, _pluginId: p.id });
      });
    });
    return releases.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [plugins]);

  const openNewForm = () => {
    setEditingRelease(null);
    setForm({ pluginId: '', version: '', title: '', notes: '' });
    setFormVisible(true);
  };

  const openEditForm = (r) => {
    setEditingRelease(r);
    setForm({ pluginId: r._pluginId, version: r.version, title: r.title || '', notes: r.notes || '' });
    setFormVisible(true);
  };

  const handleSubmit = () => {
    if (!form.pluginId) { toast('warning', '请选择对应版本发布的插件'); return; }
    if (!form.version) { toast('warning', '请输入版本号'); return; }

    if (editingRelease) {
      onUpdateRelease(editingRelease._pluginId, editingRelease.id, {
        version: form.version,
        title: form.title || `v${form.version}`,
        notes: form.notes,
      });
      toast('success', '发布已更新');
    } else {
      onAddRelease(form.pluginId, {
        version: form.version,
        title: form.title || `v${form.version}`,
        notes: form.notes,
        createdAt: Date.now(),
      });
    }
    setForm({ pluginId: '', version: '', title: '', notes: '' });
    setEditingRelease(null);
    setFormVisible(false);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">版本发布</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">管理各个插件的版本发布记录</p>
        </div>
        <button onClick={openNewForm}
          className="glass-btn glass-btn-primary flex items-center gap-2">
          <Plus size={16} /> {editingRelease ? '编辑中' : '新版本'}
        </button>
      </div>

      {/* 新增/编辑表单 */}
      {formVisible && (
        <GlassPanel className="mb-6 slide-up">
          <h3 className="text-sm font-semibold text-hermes-text mb-3">
            {editingRelease ? '编辑发布' : '新建发布'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select value={form.pluginId} onChange={e => setForm(f => ({ ...f, pluginId: e.target.value }))}
              disabled={!!editingRelease}
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
            <button onClick={() => { setFormVisible(false); setEditingRelease(null); }} className="glass-btn">{t('app.cancel')}</button>
            <button onClick={handleSubmit} className="glass-btn glass-btn-primary">
              {editingRelease ? '保存' : '发布'}
            </button>
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
              <GlassPanel key={r.id} className={`!p-0 overflow-hidden group ${r.pinned ? 'ring-1 ring-hermes-gold/30' : ''}`}>
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                  onClick={() => setExpanded(p => ({ ...p, [r.id]: !p[r.id] }))}>
                  {r.pinned ? (
                    <Pin size={14} className="text-hermes-gold flex-shrink-0" />
                  ) : (
                    <Package size={18} className="text-hermes-gold/60 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-hermes-text">{r._pluginName}</span>
                      <span className="tag text-[10px]">v{r.version}</span>
                      {r.pinned && <span className="tag text-[10px] bg-hermes-gold/10 text-hermes-gold">置顶</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-hermes-text-muted/70">{r.title}</span>
                      <span className="text-[10px] text-hermes-text-muted/40">{timeAgo(r.createdAt, t)}</span>
                    </div>
                  </div>
                  {/* 操作按钮 */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); onPinRelease(r._pluginId, r.id); }}
                      className={`glass-btn !p-1.5 !border-0 ${r.pinned ? '!bg-hermes-gold/10' : ''}`}
                      title={r.pinned ? '取消置顶' : '置顶'}>
                      {r.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEditForm(r); }}
                      className="glass-btn !p-1.5 !border-0" title="编辑">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete({ pluginId: r._pluginId, releaseId: r.id, name: `${r._pluginName} v${r.version}` }); }}
                      className="glass-btn-danger !p-1.5 !border-0" title="删除">
                      <Trash2 size={12} />
                    </button>
                  </div>
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

      {/* 删除确认弹窗 */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        title="确认删除">
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-hermes-text-muted/70">
            确定要删除 <span className="text-hermes-text font-medium">{confirmDelete?.name}</span> 的发布记录吗？
          </p>
          <p className="text-xs text-hermes-text-muted/40">此操作不可撤销。</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="glass-btn">取消</button>
            <button onClick={() => {
              onDeleteRelease(confirmDelete.pluginId, confirmDelete.releaseId);
              setConfirmDelete(null);
            }} className="glass-btn glass-btn-primary !bg-red-500/80 hover:!bg-red-500">删除</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
