import { useState } from 'react';
import { Plus, Tag, X, Search } from 'lucide-react';
import GlassPanel from './GlassPanel';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { timeAgo, calcProgress } from '../utils/helpers';

export default function TagManager({ plugins, storeTags, onAddTag, onRemoveTag, t }) {
  const [newTagName, setNewTagName] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [detailPlugin, setDetailPlugin] = useState(null);

  const allTagCounts = {};
  plugins.forEach(p => {
    (p.tags || []).forEach(t => { allTagCounts[t] = (allTagCounts[t] || 0) + 1; });
  });

  const allTags = Object.keys(allTagCounts).sort();
  const filtered = searchTag ? allTags.filter(t => t.toLowerCase().includes(searchTag.toLowerCase())) : allTags;

  const handleAddTag = () => { const name = newTagName.trim(); if (!name) return; onAddTag({ name }); setNewTagName(''); };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hermes-text">{t('tag.title')}</h1>
        <p className="text-sm text-hermes-text-muted/60 mt-1">{t('tag.subtitle')}</p>
      </div>

      <GlassPanel className="mb-6">
        <div className="flex gap-3">
          <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)}
            className="glass-input flex-1" placeholder={t('tag.title')}
            onKeyDown={e => e.key === 'Enter' && handleAddTag()} />
          <button onClick={handleAddTag} className="glass-btn glass-btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('app.create')}
          </button>
        </div>
      </GlassPanel>

      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hermes-text-muted/40" />
        <input type="text" value={searchTag} onChange={e => setSearchTag(e.target.value)}
          className="glass-input pl-9 text-sm" placeholder={t('app.search')} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Tag}
          title={searchTag ? t('tag.noData') : t('tag.noTags')}
          description={searchTag ? undefined : undefined} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map(tag => (
            <GlassPanel key={tag} className="!py-2 !px-3 flex items-center gap-2">
              <Tag size={12} className="text-hermes-gold/60" />
              <span className="text-sm text-hermes-text">{tag}</span>
              <span className="text-[10px] text-hermes-text-muted/50 bg-hermes-gold/8 px-1.5 py-0.5">{allTagCounts[tag]}</span>
              <button onClick={() => onRemoveTag(tag)}
                className="text-hermes-text-muted/30 hover:text-red-400/60 transition-colors"><X size={12} /></button>
            </GlassPanel>
          ))}
        </div>
      )}

      <GlassPanel className="mt-6">
        <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('tag.distribution')}</h3>
        {plugins.length === 0 ? (
          <p className="text-sm text-hermes-text-muted/40">{t('tag.noData')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hermes-border/30">
                  <th className="text-left py-2 px-2 text-hermes-text-muted/60 font-medium">{t('tag.plugin')}</th>
                  {allTags.map(t => (<th key={t} className="text-center py-2 px-2 text-hermes-text-muted/60 font-medium text-xs">{t}</th>))}
                </tr>
              </thead>
              <tbody>
                {plugins.map(p => (
                  <tr key={p.id} className="border-b border-hermes-border/30 hover:bg-hermes-gold/[0.06]">
                    <td className="py-2 px-2">
                      <button className="text-hermes-text text-sm hover:text-hermes-gold transition-colors text-left"
                        onClick={() => setDetailPlugin(p)}>
                        {p.name}
                      </button>
                    </td>
                    {allTags.map(t => (
                      <td key={t} className="text-center py-2 px-2">
                        {(p.tags || []).includes(t) ? <span className="text-hermes-gold">●</span> : <span className="text-hermes-border/40">○</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

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
