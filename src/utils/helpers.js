/** 生成短 UUID */
export function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 深拷贝 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** 格式化日期：YYYY-MM-DD */
export function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

/** 格式化日期时间：YYYY-MM-DD HH:mm */
export function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 5);
}

/** 相对时间 */
export function timeAgo(ts, t) {
  const fn = t || ((key, p) => {
    const fallback = { 'time.justNow':'刚刚','time.minAgo':'{n} 分钟前','time.hourAgo':'{n} 小时前','time.dayAgo':'{n} 天前','time.monthAgo':'{n} 个月前','time.yearAgo':'{n} 年前' };
    let s = fallback[key] || key;
    if (p) for (const [k,v] of Object.entries(p)) s = s.replace(`{${k}}`, v);
    return s;
  });
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return fn('time.justNow');
  if (mins < 60) return fn('time.minAgo', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fn('time.hourAgo', { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return fn('time.dayAgo', { n: days });
  const months = Math.floor(days / 30);
  return fn('time.monthAgo', { n: months });
}

/** 计算里程碑完成百分比 */
export function calcProgress(milestones) {
  if (!milestones?.length) return 0;
  let total = 0, done = 0;
  for (const m of milestones) {
    if (m.tasks?.length) {
      total += m.tasks.length;
      done += m.tasks.filter(t => t.done).length;
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** 状态列表 */
export const STATUSES = [
  { value: 'planning', label: '计划中', color: 'text-blue-400 border-blue-400/20 bg-blue-400/5' },
  { value: 'developing', label: '开发中', color: 'text-amber-400 border-amber-400/20 bg-amber-400/5' },
  { value: 'released', label: '已发布', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
];

export const PRIORITIES = [
  { value: 'external', label: '外部', color: 'text-purple-400' },
  { value: 'low', label: '低', color: 'text-slate-400' },
  { value: 'medium', label: '中', color: 'text-amber-400' },
  { value: 'high', label: '高', color: 'text-red-400' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.value, s]));
export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map(p => [p.value, p]));

/** 空插件模板 */
export function createPlugin(data = {}) {
  return {
    id: uid(),
    name: '',
    version: '1.0.0',
    mcVersion: '1.20.4',
    status: 'planning',
    priority: 'medium',
    tags: [],
    description: '',
    changelog: '',
    milestones: [],
    ideas: [],
    timeline: [{ action: 'created', timestamp: Date.now() }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...data,
  };
}

/** 空里程碑模板 */
export function createMilestone(data = {}) {
  return {
    id: uid(),
    title: '',
    deadline: '',
    tasks: [],
    ...data,
  };
}

/** 空任务模板 */
export function createTask(data = {}) {
  return {
    id: uid(),
    text: '',
    done: false,
    deadline: '',
    ...data,
  };
}

/** 空灵感模板 */
export function createIdea(data = {}) {
  return {
    id: uid(),
    text: '',
    pluginId: null,
    links: [],
    screenshots: [],
    codeSnippets: [],
    createdAt: Date.now(),
    ...data,
  };
}

/** 导出全部数据 */
export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mc-plugins-plan-${formatDate(Date.now())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 导入数据 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error('JSON 解析失败，请检查文件格式'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
