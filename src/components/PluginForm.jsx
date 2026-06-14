import { useState, useEffect } from 'react';
import Modal from './Modal';
import { STATUSES, PRIORITIES } from '../utils/helpers';

export default function PluginForm({ open, onClose, onSave, plugin }) {
  const isEdit = !!plugin;
  const [form, setForm] = useState({
    name: '', version: '1.0.0', mcVersion: '1.20.4',
    status: 'planning', priority: 'medium',
    tags: '', description: '', changelog: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (plugin) {
      setForm({
        name: plugin.name || '',
        version: plugin.version || '1.0.0',
        mcVersion: plugin.mcVersion || '1.20.4',
        status: plugin.status || 'planning',
        priority: plugin.priority || 'medium',
        tags: (plugin.tags || []).join(', '),
        description: plugin.description || '',
        changelog: plugin.changelog || '',
      });
      setTagInput('');
    } else {
      setForm({ name: '', version: '1.0.0', mcVersion: '1.20.4', status: 'planning', priority: 'medium', tags: '', description: '', changelog: '' });
      setTagInput('');
    }
  }, [plugin, open]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '编辑插件' : '新建插件'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 名称 */}
        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">插件名称 *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            className="glass-input"
            placeholder="输入插件名称"
            autoFocus
          />
        </div>

        {/* 版本 + MC 版本 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">版本</label>
            <input
              type="text"
              value={form.version}
              onChange={e => handleChange('version', e.target.value)}
              className="glass-input"
            />
          </div>
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">Minecraft 版本</label>
            <input
              type="text"
              value={form.mcVersion}
              onChange={e => handleChange('mcVersion', e.target.value)}
              className="glass-input"
              placeholder="1.20.4"
            />
          </div>
        </div>

        {/* 状态 + 优先级 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">状态</label>
            <select
              value={form.status}
              onChange={e => handleChange('status', e.target.value)}
              className="glass-input glass-select"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value} className="bg-white">{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">优先级</label>
            <select
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
              className="glass-input glass-select"
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value} className="bg-white">{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">标签（逗号分隔）</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => handleChange('tags', e.target.value)}
            className="glass-input"
            placeholder="战斗, 经济, 管理"
          />
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">描述</label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            className="glass-input min-h-[80px] resize-y"
            placeholder="插件功能概述…"
          />
        </div>

        {/* 更新日志 */}
        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">更新日志</label>
          <textarea
            value={form.changelog}
            onChange={e => handleChange('changelog', e.target.value)}
            className="glass-input min-h-[60px] resize-y"
            placeholder="本次更新内容…"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="glass-btn">取消</button>
          <button type="submit" className="glass-btn glass-btn-primary">
            {isEdit ? '保存修改' : '创建插件'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
