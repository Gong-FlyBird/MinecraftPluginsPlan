import { THEMES, ACCENTS, CORNERS, LANGUAGES } from '../i18n/translations';

export default function SettingsPanel({ settings, onUpdate, t }) {
  const s = settings || {};

  return (
    <div className="space-y-6">
      {/* ── 主题 ── */}
      <div>
        <label className="block text-sm font-semibold text-hermes-text mb-3">{t('settings.theme')}</label>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(th => (
            <button
              key={th.id}
              onClick={() => onUpdate({ theme: th.id })}
              className={`glass-btn text-center !py-3 !px-2 text-xs ${
                s.theme === th.id ? 'glass-btn-primary' : ''
              }`}
            >
              <div className="flex justify-center gap-1.5 mb-2">
                <span className="w-4 h-4 rounded-sm border border-hermes-border" style={{ background: th.id === 'gold' ? '#f6f2ea' : th.id === 'ivory' ? '#f5f0e8' : '#eef0f2' }} />
                <span className="w-4 h-4 rounded-sm" style={{
                  background: th.id === 'gold' ? '#c9a94e' : th.id === 'ivory' ? '#b8956a' : '#6b7280'
                }} />
              </div>
              <span>{th.label[t.code] || th.label.zh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 强调色 ── */}
      <div>
        <label className="block text-sm font-semibold text-hermes-text mb-3">{t('settings.accent')}</label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map(ac => (
            <button
              key={ac.id}
              onClick={() => onUpdate({ accent: ac.id })}
              className={`glass-btn !p-2 !min-w-[48px] flex flex-col items-center gap-1 ${
                s.accent === ac.id ? 'glass-btn-primary' : ''
              }`}
              title={ac.label[t.code] || ac.label.zh}
            >
              <span className="w-5 h-5 rounded-sm border border-hermes-border" style={{ background: ac.color }} />
              <span className="text-[10px]">{ac.label[t.code] || ac.label.zh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 边角 ── */}
      <div>
        <label className="block text-sm font-semibold text-hermes-text mb-3">{t('settings.corner')}</label>
        <div className="flex gap-3">
          {CORNERS.map(c => (
            <button
              key={c.id}
              onClick={() => onUpdate({ corner: c.id })}
              className={`glass-btn flex-1 !py-3 text-xs ${
                s.corner === c.id ? 'glass-btn-primary' : ''
              }`}
            >
              {c.label[t.code] || c.label.zh}
            </button>
          ))}
        </div>
      </div>

      {/* ── 语言 ── */}
      <div>
        <label className="block text-sm font-semibold text-hermes-text mb-3">{t('settings.language')}</label>
        <div className="flex gap-3">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => onUpdate({ language: l.code })}
              className={`glass-btn flex-1 !py-3 text-xs ${
                s.language === l.code ? 'glass-btn-primary' : ''
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 自动隐藏侧边栏 ── */}
      <div className="border-t border-hermes-border/30 pt-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-sm font-semibold text-hermes-text">{t('settings.autoHide')}</span>
            <p className="text-[11px] text-hermes-text-muted/50 mt-0.5">
              {s.autoHide ? '鼠标移至屏幕左侧边缘显示' : '侧边栏始终固定显示'}
            </p>
          </div>
          <button
            onClick={() => onUpdate({ autoHide: !s.autoHide })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              s.autoHide ? 'bg-hermes-gold' : 'bg-hermes-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                s.autoHide ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
