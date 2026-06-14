import { useState } from 'react';
import { Plus, Tag, X, Search } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';

/**
 * 补充功能：标签管理系统
 * 统一管理所有标签，支持颜色和筛选
 */
export default function TagManager({ plugins, storeTags, onAddTag, onRemoveTag }) {
  const [newTagName, setNewTagName] = useState('');
  const [searchTag, setSearchTag] = useState('');

  // 从插件提取所有标签并计数
  const allTagCounts = {};
  plugins.forEach(p => {
    (p.tags || []).forEach(t => {
      allTagCounts[t] = (allTagCounts[t] || 0) + 1;
    });
  });

  const allTags = Object.keys(allTagCounts).sort();
  const filtered = searchTag
    ? allTags.filter(t => t.toLowerCase().includes(searchTag.toLowerCase()))
    : allTags;

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    onAddTag({ name });
    setNewTagName('');
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hermes-text">标签管理</h1>
        <p className="text-sm text-hermes-text-muted/60 mt-1">统一管理所有插件标签</p>
      </div>

      {/* Add Tag */}
      <GlassPanel className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            className="glass-input flex-1"
            placeholder="新标签名称…"
            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
          />
          <button onClick={handleAddTag} className="glass-btn glass-btn-primary flex items-center gap-2">
            <Plus size={16} /> 添加标签
          </button>
        </div>
      </GlassPanel>

      {/* Search & Filter */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hermes-text-muted/40" />
        <input
          type="text"
          value={searchTag}
          onChange={e => setSearchTag(e.target.value)}
          className="glass-input pl-9 text-sm"
          placeholder="筛选标签…"
        />
      </div>

      {/* Tag List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={searchTag ? '未找到匹配标签' : '暂无标签'}
          description={searchTag ? '尝试其他关键词' : '创建插件时添加标签会自动出现在这里'}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map(tag => (
            <GlassPanel key={tag} className="!py-2 !px-3 flex items-center gap-2">
              <Tag size={12} className="text-hermes-gold/60" />
              <span className="text-sm text-hermes-text">{tag}</span>
              <span className="text-[10px] text-hermes-text-muted/50 bg-hermes-gold/8 px-1.5 py-0.5">
                {allTagCounts[tag]}
              </span>
              <button
                onClick={() => onRemoveTag(tag)}
                className="text-hermes-text-muted/30 hover:text-red-400/60 transition-colors"
              >
                <X size={12} />
              </button>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* Plugin Tags Matrix */}
      <GlassPanel className="mt-6">
        <h3 className="text-sm font-semibold text-hermes-text mb-4">标签分布</h3>
        {plugins.length === 0 ? (
          <p className="text-sm text-hermes-text-muted/40">暂无数据</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hermes-border/30">
                  <th className="text-left py-2 px-2 text-hermes-text-muted/60 font-medium">插件</th>
                  {allTags.map(t => (
                    <th key={t} className="text-center py-2 px-2 text-hermes-text-muted/60 font-medium text-xs">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plugins.map(p => (
                  <tr key={p.id} className="border-b border-hermes-border/30 hover:bg-hermes-gold/[0.06]">
                    <td className="py-2 px-2 text-hermes-text text-sm">{p.name}</td>
                    {allTags.map(t => (
                      <td key={t} className="text-center py-2 px-2">
                        {(p.tags || []).includes(t)
                          ? <span className="text-hermes-gold">●</span>
                          : <span className="text-hermes-border/40">○</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
