import { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import GlassPanel from './GlassPanel';
import { exportData, importData } from '../utils/helpers';

export default function DataManager({ store, onImport, onReset }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [importing, setImporting] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = () => {
    exportData(store);
    showMsg('success', '数据已导出为 JSON 文件');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await importData(file);
      onImport(data);
      showMsg('success', `成功导入 ${data.plugins?.length || 0} 个插件`);
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('⚠️ 确认清空所有数据？此操作不可撤销！')) {
      onReset();
      showMsg('success', '已重置所有数据');
    }
  };

  const stats = {
    plugins: store.plugins?.length || 0,
    ideas: store.standaloneIdeas?.length || 0,
    milestones: store.plugins?.reduce((a, p) => a + (p.milestones?.length || 0), 0) || 0,
    tasks: store.plugins?.reduce((a, p) => a + (p.milestones?.reduce((b, m) => b + (m.tasks?.length || 0), 0) || 0), 0) || 0,
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hermes-text">数据管理</h1>
        <p className="text-sm text-hermes-text-muted/60 mt-1">备份、迁移与恢复你的插件计划数据</p>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mb-4 glass-card !py-3 !px-4 flex items-center gap-3 ${message.type === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'} slide-up`}>
          {message.type === 'success'
            ? <CheckCircle2 size={18} className="text-emerald-400" />
            : <AlertCircle size={18} className="text-red-400" />
          }
          <span className={`text-sm ${message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Stats */}
      <GlassPanel className="mb-6">
        <h3 className="text-sm font-semibold text-hermes-text mb-4">当前数据概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '插件项目', value: stats.plugins },
            { label: '灵感记录', value: stats.ideas },
            { label: '里程碑', value: stats.milestones },
            { label: '任务', value: stats.tasks },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-hermes-gold">{item.value}</div>
              <div className="text-[11px] text-hermes-text-muted/50 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassPanel className="flex flex-col items-center text-center py-8">
          <Download size={32} className="text-hermes-gold/40 mb-4" />
          <h3 className="text-base font-semibold text-hermes-text mb-2">导出数据</h3>
          <p className="text-xs text-hermes-text-muted/60 mb-6 max-w-xs">
            将所有插件、里程碑、任务和灵感导出为标准 JSON 文件
          </p>
          <button onClick={handleExport} className="glass-btn glass-btn-primary flex items-center gap-2">
            <Download size={16} /> 导出 JSON
          </button>
        </GlassPanel>

        <GlassPanel className="flex flex-col items-center text-center py-8">
          <Upload size={32} className="text-hermes-gold/40 mb-4" />
          <h3 className="text-base font-semibold text-hermes-text mb-2">导入数据</h3>
          <p className="text-xs text-hermes-text-muted/60 mb-6 max-w-xs">
            从之前导出的 JSON 文件恢复所有数据（会覆盖当前数据）
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="glass-btn glass-btn-primary flex items-center gap-2"
          >
            <Upload size={16} /> {importing ? '导入中…' : '导入 JSON'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </GlassPanel>
      </div>

      {/* Danger Zone */}
      <GlassPanel className="border-red-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <RotateCcw size={16} /> 危险区域
            </h3>
            <p className="text-xs text-hermes-text-muted/60 mt-1">清空所有数据，不可恢复。建议先导出备份。</p>
          </div>
          <button onClick={handleReset} className="glass-btn glass-btn-danger">
            清空全部数据
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
