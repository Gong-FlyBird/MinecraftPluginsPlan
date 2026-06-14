import { useLocalStorage } from '../hooks/useLocalStorage';
import { uid } from './helpers';

const STORE_KEY = 'mc-plugins-store';

/** 全局数据结构 */
const INITIAL_STORE = {
  plugins: [],
  standaloneIdeas: [],
  tags: [],
  settings: {
    sprintDays: 14,
    theme: 'gold',
    accent: 'gold',
    corner: 'square',
    language: 'zh',
  },
};

/** 应用状态 Hook — 所有数据操作集中在此 */
export function useStore() {
  const [store, setStore] = useLocalStorage(STORE_KEY, INITIAL_STORE);

  /* ──────── Plugin CRUD ──────── */

  const addPlugin = (plugin) => setStore(prev => ({
    ...prev,
    plugins: [...prev.plugins, {
      ...plugin,
      id: uid(),
      timeline: [{ action: 'created', detail: '创建插件', timestamp: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }],
  }));

  const updatePlugin = (id, patch) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === id
        ? { ...p, ...patch, updatedAt: Date.now(), timeline: [
            ...p.timeline,
            { action: 'updated', detail: patch.name ? `更新: ${patch.name}` : '更新信息', timestamp: Date.now() },
          ]}
        : p
    ),
  }));

  const deletePlugin = (id) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.filter(p => p.id !== id),
    // 同时清理关联的独立灵感
    standaloneIdeas: prev.standaloneIdeas.filter(idea => idea.pluginId !== id),
  }));

  const movePluginStatus = (id, newStatus) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === id
        ? { ...p, status: newStatus, updatedAt: Date.now(), timeline: [
            ...p.timeline,
            { action: 'status', detail: `状态变更 → ${newStatus}`, timestamp: Date.now() },
          ]}
        : p
    ),
  }));

  /* ──────── Milestone & Task ──────── */

  const addMilestone = (pluginId, milestone) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: [...(p.milestones || []), { ...milestone, id: uid() }], updatedAt: Date.now() }
        : p
    ),
  }));

  const updateMilestone = (pluginId, milestoneId, patch) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: (p.milestones || []).map(m =>
            m.id === milestoneId ? { ...m, ...patch } : m
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  const deleteMilestone = (pluginId, milestoneId) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: (p.milestones || []).filter(m => m.id !== milestoneId), updatedAt: Date.now() }
        : p
    ),
  }));

  const toggleTask = (pluginId, milestoneId, taskId) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: (p.milestones || []).map(m =>
            m.id === milestoneId
              ? { ...m, tasks: (m.tasks || []).map(t =>
                  t.id === taskId ? { ...t, done: !t.done } : t
                )}
              : m
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  const addTask = (pluginId, milestoneId, task) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: (p.milestones || []).map(m =>
            m.id === milestoneId
              ? { ...m, tasks: [...(m.tasks || []), { ...task, id: uid(), done: false }] }
              : m
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  const deleteTask = (pluginId, milestoneId, taskId) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, milestones: (p.milestones || []).map(m =>
            m.id === milestoneId
              ? { ...m, tasks: (m.tasks || []).filter(t => t.id !== taskId) }
              : m
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  /* ──────── Ideas ──────── */

  const addIdea = (idea) => setStore(prev => ({
    ...prev,
    standaloneIdeas: [...prev.standaloneIdeas, { ...idea, id: uid(), createdAt: Date.now() }],
  }));

  const updateIdea = (id, patch) => setStore(prev => ({
    ...prev,
    standaloneIdeas: prev.standaloneIdeas.map(idea =>
      idea.id === id ? { ...idea, ...patch } : idea
    ),
  }));

  const deleteIdea = (id) => setStore(prev => ({
    ...prev,
    standaloneIdeas: prev.standaloneIdeas.filter(idea => idea.id !== id),
  }));

  const addPluginIdea = (pluginId, idea) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, ideas: [...(p.ideas || []), { ...idea, id: uid(), createdAt: Date.now() }], updatedAt: Date.now() }
        : p
    ),
  }));

  /* ──────── Tags ──────── */

  const addTag = (tag) => setStore(prev => ({
    ...prev,
    tags: prev.tags.some(t => t.name === tag.name) ? prev.tags : [...prev.tags, { ...tag, id: uid() }],
  }));

  const removeTag = (tagName) => setStore(prev => ({
    ...prev,
    tags: prev.tags.filter(t => t.name !== tagName),
    plugins: prev.plugins.map(p => ({
      ...p,
      tags: (p.tags || []).filter(t => t !== tagName),
    })),
  }));

  /* ──────── 设置 ──────── */

  const updateSettings = (patch) => setStore(prev => ({
    ...prev,
    settings: { ...prev.settings, ...patch },
  }));

  /* ──────── 全局 ──────── */

  const importStore = (data) => {
    setStore({
      ...INITIAL_STORE,
      ...data,
      plugins: data.plugins || [],
      standaloneIdeas: data.standaloneIdeas || [],
      tags: data.tags || [],
    });
  };

  const resetStore = () => setStore(INITIAL_STORE);

  return {
    store,
    setStore,
    // Plugin
    addPlugin, updatePlugin, deletePlugin, movePluginStatus,
    // Milestone & Task
    addMilestone, updateMilestone, deleteMilestone,
    toggleTask, addTask, deleteTask,
    // Ideas
    addIdea, updateIdea, deleteIdea, addPluginIdea,
    // Tags
    addTag, removeTag,
    // System
    importStore, resetStore,
    // Settings
    updateSettings,
  };
}
