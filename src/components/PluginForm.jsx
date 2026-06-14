import { useState, useEffect } from 'react';
import Modal from './Modal';
import { STATUSES, PRIORITIES } from '../utils/helpers';
import { useT } from '../utils/i18n';

export default function PluginForm({ open, onClose, onSave, plugin, t: propT }) {
  const isEdit = !!plugin;
  const t = propT || useT('zh');

  const [form, setForm] = useState({
    name: '', version: '1.0.0', mcVersion: '1.20.4',
    status: 'planning', priority: 'medium',
    tags: '', description: '', changelog: '',
  });

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
    } else {
      setForm({ name: '', version: '1.0.0', mcVersion: '1.20.4', status: 'planning', priority: 'medium', tags: '', description: '', changelog: '' });
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
    <Modal open={open} onClose={onClose} title={isEdit ? t('plugin.edit') : t('plugin.new')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.name')} *</label>
          <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
            className="glass-input" placeholder={t('plugin.name.placeholder')} autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.version')}</label>
            <input type="text" value={form.version} onChange={e => handleChange('version', e.target.value)} className="glass-input" />
          </div>
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.mcVersion')}</label>
            <input type="text" value={form.mcVersion} onChange={e => handleChange('mcVersion', e.target.value)}
              className="glass-input" placeholder="1.20.4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.status')}</label>
            <select value={form.status} onChange={e => handleChange('status', e.target.value)} className="glass-input glass-select">
              {STATUSES.map(s => (
                <option key={s.value} value={s.value} className="bg-white">{t(`status.${s.value}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.priority')}</label>
            <select value={form.priority} onChange={e => handleChange('priority', e.target.value)} className="glass-input glass-select">
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value} className="bg-white">{t(`priority.${p.value}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.tags')}</label>
          <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)}
            className="glass-input" placeholder={t('plugin.tags.placeholder')} />
        </div>

        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.description')}</label>
          <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
            className="glass-input min-h-[80px] resize-y" placeholder={t('plugin.description.placeholder')} />
        </div>

        <div>
          <label className="block text-sm text-hermes-text-muted mb-1.5">{t('plugin.changelog')}</label>
          <textarea value={form.changelog} onChange={e => handleChange('changelog', e.target.value)}
            className="glass-input min-h-[60px] resize-y" placeholder={t('plugin.changelog.placeholder')} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="glass-btn">{t('app.cancel')}</button>
          <button type="submit" className="glass-btn glass-btn-primary">
            {isEdit ? t('plugin.save') : t('plugin.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
