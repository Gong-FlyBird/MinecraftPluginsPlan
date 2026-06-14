import { useState } from 'react';
import { Plus, Tag, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { calcProgress, timeAgo } from '../utils/helpers';

export default function TagManager({ plugins, storeTags, onAddTag, onRemoveTag, t }) {
  const [newTagName, setNewTagName] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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
          title={searchTag ? t('tag.noData') : t('tag.noTags')} />
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
          <div className="space-y-2">
            {plugins.map(p => {
              const isExpanded = expandedId === p.id;
              return (
                <div key={p.id}>
                  {/* 折叠头 */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-hermes-gold/[0.06] transition-colors cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <span className="text-hermes-text-muted/30 flex-shrink-0">
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                    <span className="text-sm text-hermes-text flex-1">{p.name}</span>
                    {allTags.map(t => (
                      <span key={t} className="text-xs text-center w-5 flex-shrink-0">
                        {(p.tags || []).includes(t)
                          ? <span className="text-hermes-gold">●</span>
                          : <span className="text-hermes-border/40">○</span>}
                      </span>
                    ))}
                    <span className="tag text-[10px] ml-auto">{t(`status.${p.status}`)}</span>
                  </div>
                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="px-8 pb-3 pt-1 slide-up space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <PriorityBadge priority={p.priority} t={t} />
                        <span className="text-xs text-hermes-text-muted/50">v{p.version} · MC {p.mcVersion}</span>
                      </div>

                      {p.milestones?.length > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-hermes-text-muted/60 mb-1">
                            <span>{t('app.progress')}</span>
                            <span>{calcProgress(p.milestones)}%</span>
                          </div>
                          <div className="progress-bar h-1.5">
                            <div className="progress-bar-fill" style={{ width: `${calcProgress(p.milestones)}%` }} />
                          </div>
                        </div>
                      )}

                      {p.description && (
                        <p className="text-xs text-hermes-text-muted/70">{p.description}</p>
                      )}

                      <div className="text-[10px] text-hermes-text-muted/40">
                        {t('timeline.updated')}: {timeAgo(p.updatedAt, t)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
