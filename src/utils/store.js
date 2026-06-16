import { useLocalStorage } from '../hooks/useLocalStorage';
import { uid } from './helpers';
import { toast } from '../components/Toast';
import { migrateData, CURRENT_VERSION } from './migrate';

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
    autoHide: false,
  },
  bookmarkCollections: [
    { id: 'default', name: '我的收藏', pluginIds: [], createdAt: Date.now() },
  ],
};

/** 应用状态 Hook — 所有数据操作集中在此 */
export function useStore() {
  const [store, setStore] = useLocalStorage(STORE_KEY, { ...INITIAL_STORE, _version: CURRENT_VERSION }, migrateData);

  /* ──────── Plugin CRUD ──────── */

  let _toastOnce = (msg) => { toast('success', msg); _toastOnce = () => {}; };
  const addPlugin = (plugin) => {
    _toastOnce('插件已创建');
    setStore(prev => ({
      ...prev,
      plugins: [...prev.plugins, {
        ...plugin,
        id: uid(),
        timeline: [{ action: 'created', detailKey: 'timeline.created', timestamp: Date.now() }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
    }));
  };

  const updatePlugin = (id, patch) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === id
        ? { ...p, ...patch, updatedAt: Date.now(), timeline: [
            ...p.timeline,
            { action: 'updated', detailKey: 'timeline.updated', timestamp: Date.now() },
          ]}
        : p
    ),
  }));

  const deletePlugin = (id) => {
    toast('success', '插件已删除');
    setStore(prev => ({
      ...prev,
      plugins: prev.plugins.filter(p => p.id !== id),
      standaloneIdeas: prev.standaloneIdeas.filter(idea => idea.pluginId !== id),
    }));
  };

  const movePluginStatus = (id, newStatus) => setStore(prev => {
    const plugin = prev.plugins.find(p => p.id === id);
    if (!plugin || plugin.status === newStatus) return prev;
    return {
      ...prev,
      plugins: prev.plugins.map(p =>
        p.id === id
          ? { ...p, status: newStatus, updatedAt: Date.now(), timeline: [
              ...p.timeline,
              { action: 'status', detailKey: 'timeline.status', detailParams: { status: newStatus }, timestamp: Date.now() },
            ]}
          : p
      ),
    };
  });

  /** 跨列移动到指定位置 */
  const movePluginTo = (id, newStatus, targetIdx) => setStore(prev => {
    const plugins = [...prev.plugins];
    const idx = plugins.findIndex(p => p.id === id);
    if (idx === -1 || plugins[idx].status === newStatus) return prev;
    const plugin = plugins.splice(idx, 1)[0];
    plugin.status = newStatus;
    plugin.updatedAt = Date.now();
    plugin.timeline = [
      ...(plugin.timeline || []),
      { action: 'status', detailKey: 'timeline.status', detailParams: { status: newStatus }, timestamp: Date.now() },
    ];
    // 计算插入位置
    let insertAt = plugins.length;
    let colIdx = -1;
    for (let i = 0; i <= plugins.length; i++) {
      if (i === plugins.length || plugins[i]?.status !== newStatus) continue;
      colIdx++;
      if (colIdx === (targetIdx ?? 999)) { insertAt = i; break; }
    }
    plugins.splice(insertAt, 0, plugin);
    return { ...prev, plugins };
  });

  /** 同列重排序 */
  const reorderPlugins = (orderedIds) => setStore(prev => {
    const map = {};
    prev.plugins.forEach(p => { map[p.id] = p; });
    const reordered = orderedIds.map(id => map[id]).filter(Boolean);
    const others = prev.plugins.filter(p => !orderedIds.includes(p.id));
    return { ...prev, plugins: [...reordered, ...others] };
  });

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

  const deleteMilestone = (pluginId, milestoneId) => {
    toast('success', '里程碑已删除');
    setStore(prev => ({
      ...prev,
      plugins: prev.plugins.map(p =>
        p.id === pluginId
          ? { ...p, milestones: (p.milestones || []).filter(m => m.id !== milestoneId), updatedAt: Date.now() }
          : p
      ),
    }));
  };

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

  const deleteTask = (pluginId, milestoneId, taskId) => {
    toast('success', '任务已删除');
    setStore(prev => ({
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
  };

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

  const deleteIdea = (id) => {
    toast('success', '灵感已删除');
    setStore(prev => ({
      ...prev,
      standaloneIdeas: prev.standaloneIdeas.filter(idea => idea.id !== id),
    }));
  };

  const addPluginIdea = (pluginId, idea) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, ideas: [...(p.ideas || []), { ...idea, id: uid(), createdAt: Date.now() }], updatedAt: Date.now() }
        : p
    ),
  }));

  /* ──────── Releases ──────── */

  const addRelease = (pluginId, release) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, releases: [...(p.releases || []), { ...release, id: uid() }], updatedAt: Date.now() }
        : p
    ),
  }));

  const deleteRelease = (pluginId, releaseId) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, releases: (p.releases || []).filter(r => r.id !== releaseId), updatedAt: Date.now() }
        : p
    ),
  }));

  const updateRelease = (pluginId, releaseId, patch) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, releases: (p.releases || []).map(r =>
            r.id === releaseId ? { ...r, ...patch } : r
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  const pinRelease = (pluginId, releaseId) => setStore(prev => ({
    ...prev,
    plugins: prev.plugins.map(p =>
      p.id === pluginId
        ? { ...p, releases: (p.releases || []).map(r =>
            r.id === releaseId ? { ...r, pinned: !r.pinned } : r
          ), updatedAt: Date.now() }
        : p
    ),
  }));

  /* ──────── Tags ──────── */

  const addTag = (tag) => setStore(prev => ({
    ...prev,
    tags: prev.tags.some(t => t.name === tag.name) ? prev.tags : [...prev.tags, { ...tag, id: uid() }],
  }));

  const removeTag = (tagName) => {
    toast('success', `标签「${tagName}」已删除`);
    setStore(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.name !== tagName),
      plugins: prev.plugins.map(p => ({
        ...p,
        tags: (p.tags || []).filter(t => t !== tagName),
      })),
    }));
  };

  /* ──────── 设置 ──────── */

  const updateSettings = (patch) => setStore(prev => ({
    ...prev,
    settings: { ...prev.settings, ...patch },
  }));

  /* ──────── 收藏夹 CRUD ──────── */

  const addBookmarkCollection = (name) => {
    if (!name.trim()) return;
    setStore(prev => ({
      ...prev,
      bookmarkCollections: [
        ...prev.bookmarkCollections,
        { id: uid(), name: name.trim(), pluginIds: [], createdAt: Date.now() },
      ],
    }));
  };

  const removeBookmarkCollection = (id) => {
    setStore(prev => ({
      ...prev,
      bookmarkCollections: prev.bookmarkCollections.filter(c => c.id !== id),
    }));
  };

  const renameBookmarkCollection = (id, name) => {
    setStore(prev => ({
      ...prev,
      bookmarkCollections: prev.bookmarkCollections.map(c =>
        c.id === id ? { ...c, name } : c
      ),
    }));
  };

  const addPluginToBookmark = (pluginId, collectionId) => {
    setStore(prev => ({
      ...prev,
      bookmarkCollections: prev.bookmarkCollections.map(c =>
        c.id === collectionId && !c.pluginIds.includes(pluginId)
          ? { ...c, pluginIds: [...c.pluginIds, pluginId] }
          : c
      ),
    }));
  };

  const removePluginFromBookmark = (pluginId, collectionId) => {
    setStore(prev => ({
      ...prev,
      bookmarkCollections: prev.bookmarkCollections.map(c =>
        c.id === collectionId
          ? { ...c, pluginIds: c.pluginIds.filter(id => id !== pluginId) }
          : c
      ),
    }));
  };

  /* ──────── 全局 ──────── */

  const importStore = (data) => {
    setStore(prev => {
      const existingNames = new Set(prev.plugins.map(p => p.name));
      const newPlugins = (data.plugins || []).filter(p => !existingNames.has(p.name));
      const dupCount = (data.plugins?.length || 0) - newPlugins.length;
      const msg = dupCount > 0
        ? `导入 ${newPlugins.length} 个新插件，跳过 ${dupCount} 个重复`
        : `导入 ${newPlugins.length} 个插件`;
      toast(dupCount > 0 ? 'warning' : 'success', msg);
      return {
        ...prev,
        plugins: [...prev.plugins, ...newPlugins],
        standaloneIdeas: data.standaloneIdeas || [],
        tags: data.tags || [],
        bookmarkCollections: data.bookmarkCollections || prev.bookmarkCollections || [],
      };
    });
  };

  const resetStore = () => {
    toast('success', '数据已重置');
    setStore(prev => ({
      ...INITIAL_STORE,
      settings: prev.settings,
    }));
  };

  return {
    store,
    setStore,
    // Plugin
    addPlugin, updatePlugin, deletePlugin, movePluginStatus, movePluginTo, reorderPlugins,
    // Milestone & Task
    addMilestone, updateMilestone, deleteMilestone,
    toggleTask, addTask, deleteTask,
    // Ideas
    addIdea, updateIdea, deleteIdea, addPluginIdea,
    // Releases
    addRelease, deleteRelease, updateRelease, pinRelease,
    // Tags
    addTag, removeTag,
    // Bookmarks
    addBookmarkCollection, removeBookmarkCollection, renameBookmarkCollection,
    addPluginToBookmark, removePluginFromBookmark,
    // System
    importStore, resetStore,
    // Settings
    updateSettings,
  };
}
