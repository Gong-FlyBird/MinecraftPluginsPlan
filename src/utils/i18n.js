import { useCallback } from 'react';
import ALL_TRANSLATIONS from '../i18n/translations';

/**
 * 翻译 Hook
 * @param {string} lang - 当前语言代码 ('zh' | 'en' | 'ja')
 * @returns {function} t(key, params?) — 翻译函数
 */
export function useT(lang) {
  const t = useCallback((key, params = {}) => {
    const dict = ALL_TRANSLATIONS[lang] || ALL_TRANSLATIONS.zh;
    let text = dict[key];
    if (text === undefined) {
      // fallback: 从中文翻译取
      text = ALL_TRANSLATIONS.zh[key] || key;
    }
    // 替换 {xxx} 占位符
    return text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }, [lang]);

  return t;
}

/**
 * 获取语言标签（中英日互译用）
 */
export function langLabel(code) {
  const map = { zh: '中文', en: 'English', ja: '日本語' };
  return map[code] || code;
}
