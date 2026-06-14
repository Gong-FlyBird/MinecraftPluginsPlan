import { useState, useMemo } from 'react';
import { Plus, Lightbulb, Link2, Code, Trash2, FileImage } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';

export default function IdeaVault({ plugins, storeIdeas, onAddIdea, onUpdateIdea, onDeleteIdea }) {
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
    setNewIdea('');
    setNewLink('');
    setNewCode('');
    setSelectedPlugin('');
  };

  const toggleExpand = (id) => setExpandedIdea(prev => prev === id ? null : id);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">灵感库</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">记录灵光一现，关联到具体插件</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="搜索灵感、关联插件…" />
      </div>

      {/* Add New Idea */}
      <GlassPanel className="mb-8">
        <h3 className="text-sm font-semibold text-hermes-text mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-hermes-gold" /> 新灵感
        </h3>
        <div className="space-y-3">
          <textarea
            value={newIdea}
            onChange={e => setNewIdea(e.target.value)}
            className="glass-input min-h-[80px] resize-y"
            placeholder="记录你的灵感…"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-hermes-text-muted/50 mb-1">参考链接</label>
              <input
                type="text"
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                className="glass-input text-sm"
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="block text-[11px] text-hermes-text-muted/50 mb-1">关联插件（可选）</label>
              <select
                value={selectedPlugin}
                onChange={e => setSelectedPlugin(e.target.value)}
                className="glass-input glass-select text-sm"
              >
                <option value="" className="bg-white">不关联</option>
                {plugins.map(p => (
                  <option key={p.id} value={p.id} className="bg-white">{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-hermes-text-muted/50 mb-1">代码片段</label>
            <textarea
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              className="glass-input text-sm font-mono min-h-[50px] resize-y"
              placeholder="// 代码片段…"
            />
          </div>
          <div className="flex justify-end">
            <button onClick={handleAdd} className="glass-btn glass-btn-primary flex items-center gap-2">
              <Plus size={16} /> 记录灵感
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Ideas List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={search ? '未找到匹配灵感' : '灵感库为空'}
          description={search ? '尝试其他关键词' : '记录你的第一个插件创意'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(idea => (
            <GlassPanel key={idea.id} className="!p-0 overflow-hidden">
              <div
                className="px-5 py-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                onClick={() => toggleExpand(idea.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-hermes-text leading-relaxed">{idea.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {idea._pluginName && (
                        <span className="tag text-[10px]">📦 {idea._pluginName}</span>
                      )}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteIdea(idea.id); }}
                    className="glass-btn-danger !p-1.5 !rounded-lg !border-0 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedIdea === idea.id && (
                <div className="px-5 pb-4 border-t border-hermes-border/30 pt-3 space-y-3">
                  {idea.links?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-hermes-text-muted/50 mb-1 flex items-center gap-1">
                        <Link2 size={11} /> 参考链接
                      </p>
                      {idea.links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                          className="block text-sm text-hermes-gold/80 hover:text-hermes-gold underline break-all">
                          {link}
                        </a>
                      ))}
                    </div>
                  )}
                  {idea.codeSnippets?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-hermes-text-muted/50 mb-1 flex items-center gap-1">
                        <Code size={11} /> 代码片段
                      </p>
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
