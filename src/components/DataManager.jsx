import { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import GlassPanel from './GlassPanel';
import { exportData, importData } from '../utils/helpers';

export default function DataManager({ store, onImport, onReset, t }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    exportData(store);
    showMsg('success', t('data.success.export'));
  };

  const doImport = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const data = await importData(file);
      onImport(data);
      showMsg('success', t('data.success.import', { count: data.plugins?.length || 0 }));
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setImporting(false);
      setDragOver(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    await doImport(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      await doImport(file);
    } else {
      showMsg('error', '仅支持 .json 文件');
    }
  };

  const handleReset = () => {
    if (window.confirm(t('confirm.reset'))) {
      onReset();
      showMsg('success', t('data.success.reset'));
    }
  };

  const stats = {
    plugins: store.plugins?.length || 0,
    ideas: store.standaloneIdeas?.length || 0,
    milestones: store.plugins?.reduce((a, p) => a + (p.milestones?.length || 0), 0) || 0,
    tasks: store.plugins?.reduce((a, p) => a + (p.milestones?.reduce((b, m) => b + (m.tasks?.length || 0), 0) || 0), 0) || 0,
  };

  const statItems = [
    { labelKey: 'data.plugins', value: stats.plugins },
    { labelKey: 'data.ideas', value: stats.ideas },
    { labelKey: 'data.milestones', value: stats.milestones },
    { labelKey: 'data.tasks', value: stats.tasks },
  ];

  return (
    <div className="fade-in">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-hermes-text">{t('data.title')}</h1>
        <p className="text-xs sm:text-sm text-hermes-text-muted/60 mt-1">{t('data.subtitle')}</p>
      </div>

      {message && (
        <div className={`mb-4 glass-card !py-3 !px-4 flex items-center gap-3 ${message.type === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'} slide-up`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{message.text}</span>
        </div>
      )}

      <GlassPanel className="mb-6">
        <h3 className="text-sm font-semibold text-hermes-text mb-4">{t('data.overview')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map(item => (
            <div key={item.labelKey} className="text-center">
              <div className="text-2xl font-bold text-hermes-gold">{item.value}</div>
              <div className="text-[11px] text-hermes-text-muted/50 mt-1">{t(item.labelKey)}</div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassPanel className="flex flex-col items-center text-center py-8">
          <Download size={32} className="text-hermes-gold/40 mb-4" />
          <h3 className="text-base font-semibold text-hermes-text mb-2">{t('data.export')}</h3>
          <p className="text-xs text-hermes-text-muted/60 mb-6 max-w-xs">{t('data.export.desc')}</p>
          <button onClick={handleExport} className="glass-btn glass-btn-primary flex items-center gap-2">
            <Download size={16} /> {t('data.export.btn')}
          </button>
        </GlassPanel>

        <GlassPanel
          className={`flex flex-col items-center text-center py-8 relative transition-all ${
            dragOver ? 'ring-2 ring-hermes-gold/50 bg-hermes-gold/10 scale-[1.02]' : ''
          }`}
          onDragOver={e => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-hermes-gold/5 backdrop-blur-sm rounded-sm z-10">
              <p className="text-lg font-semibold text-hermes-gold">松开导入数据</p>
            </div>
          )}
          <Upload size={32} className="text-hermes-gold/40 mb-4" />
          <h3 className="text-base font-semibold text-hermes-text mb-2">{t('data.import')}</h3>
          <p className="text-xs text-hermes-text-muted/60 mb-6 max-w-xs">{t('data.import.desc')}</p>
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="glass-btn glass-btn-primary flex items-center gap-2">
            <Upload size={16} /> {importing ? t('data.import.progress') : t('data.import.btn')}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </GlassPanel>
      </div>

      <GlassPanel className="border-red-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2"><RotateCcw size={16} /> {t('data.danger')}</h3>
            <p className="text-xs text-hermes-text-muted/60 mt-1">{t('data.danger.desc')}</p>
          </div>
          <button onClick={handleReset} className="glass-btn glass-btn-danger whitespace-nowrap tap-target">{t('data.danger.btn')}</button>
        </div>
      </GlassPanel>
    </div>
  );
}
