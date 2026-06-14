import { useState, useMemo } from 'react';
import { Plus, Lightbulb, Link2, Code, Trash2 } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';

export default function IdeaVault({ plugins, storeIdeas, onAddIdea, onUpdateIdea, onDeleteIdea, t }) {
  const [newIdea, setNewIdea] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCode, setNewCode] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState('');
  const [search, setSearch] = useState('');
  const [expandedIdea, setExpandedIdea] = useState(null);

  const allIdeas = useMemo(() => {
    const pluginIdeas = plugins.flatMap(p =>
      (p.ideas || []).map(idea => ({ ...idea, _pluginName: p.name }))
    );
    const standalone = (storeIdeas || []).map(i => ({ ...i, _pluginName: null }));
    return [...pluginIdeas, ...standalone].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [plugins, storeIdeas]);

  const filtered = useMemo(() => {
    if (!search) return allIdeas;
    const q = search.toLowerCase();
    return allIdeas.filter(i =>
      (i.text || '').toLowerCase().includes(q) ||
      (i._pluginName || '').toLowerCase().includes(q) ||
      (i.links || []).some(l => l.toLowerCase().includes(q))
    );
  }, [allIdeas, search]);

  const handleAdd = () => {
    if (!newIdea.trim()) return;
    onAddIdea({
      text: newIdea.trim(),
      pluginId: selectedPlugin || null,
      links: newLink.trim() ? [newLink.trim()] : [],
      codeSnippets: newCode.trim() ? [newCode.trim()] : [],
    });
    setNewIdea(''); setNewLink(''); setNewCode(''); setSelectedPlugin('');
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">{t('idea.title')}</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">{t('idea.subtitle')}</p>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder={t('app.search')} />
      </div>

      <GlassPanel className="mb-8">
        <h3 className="text-sm font-semibold text-hermes-text mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-hermes-gold" /> {t('idea.new')}
        </h3>
        <div className="space-y-3">
          <textarea value={newIdea} onChange={e => setNewIdea(e.target.value)}
            className="glass-input min-h-[80px] resize-y" placeholder={t('idea.text.placeholder')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-hermes-text-muted/50 mb-1">{t('idea.link')}</label>
              <input type="text" value={newLink} onChange={e => setNewLink(e.target.value)}
                className="glass-input text-sm" placeholder={t('idea.link.placeholder')} />
            </div>
            <div>
              <label className="block text-[11px] text-hermes-text-muted/50 mb-1">{t('idea.plugin')}</label>
              <select value={selectedPlugin} onChange={e => setSelectedPlugin(e.target.value)}
                className="glass-input glass-select text-sm">
                <option value="" className="bg-white">{t('idea.noPlugin')}</option>
                {plugins.map(p => (<option key={p.id} value={p.id} className="bg-white">{p.name}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-hermes-text-muted/50 mb-1">{t('idea.code')}</label>
            <textarea value={newCode} onChange={e => setNewCode(e.target.value)}
              className="glass-input text-sm font-mono min-h-[50px] resize-y" placeholder={t('idea.code.placeholder')} />
          </div>
          <div className="flex justify-end">
            <button onClick={handleAdd} className="glass-btn glass-btn-primary flex items-center gap-2">
              <Plus size={16} /> {t('idea.add')}
            </button>
          </div>
        </div>
      </GlassPanel>

      {filtered.length === 0 ? (
        <EmptyState icon={Lightbulb}
          title={search ? t('app.empty') : t('idea.noIdeas')}
          description={search ? undefined : undefined} />
      ) : (
        <div className="space-y-3">
          {filtered.map(idea => (
            <GlassPanel key={idea.id} className="!p-0 overflow-hidden">
              <div className="px-5 py-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                onClick={() => setExpandedIdea(prev => prev === idea.id ? null : idea.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-hermes-text leading-relaxed">{idea.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {idea._pluginName && <span className="tag text-[10px]">{idea._pluginName}</span>}
                      {idea.links?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-hermes-text-muted/50">
                          <Link2 size={10} /> {idea.links.length}
                        </span>
                      )}
                      {idea.codeSnippets?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-hermes-text-muted/50">
                          <Code size={10} /> {idea.codeSnippets.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteIdea(idea.id); }}
                    className="glass-btn-danger !p-1.5 !border-0 opacity-0 hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
                </div>
              </div>

              {expandedIdea === idea.id && (
                <div className="px-5 pb-4 border-t border-hermes-border/30 pt-3 space-y-3">
                  {idea.links?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-hermes-text-muted/50 mb-1 flex items-center gap-1"><Link2 size={11} /> {t('idea.link')}</p>
                      {idea.links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                          className="block text-sm text-hermes-gold/80 hover:text-hermes-gold underline break-all">{link}</a>
                      ))}
                    </div>
                  )}
                  {idea.codeSnippets?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-hermes-text-muted/50 mb-1 flex items-center gap-1"><Code size={11} /> {t('idea.code')}</p>
                      {idea.codeSnippets.map((snippet, i) => (
                        <pre key={i} className="code-snippet text-xs">{snippet}</pre>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
