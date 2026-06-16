import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useStore } from './utils/store';
import { useT } from './utils/i18n';
import { Search, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import MilestoneTracker from './components/MilestoneTracker';
import IdeaVault from './components/IdeaVault';
import TimelineView from './components/TimelineView';
import DataManager from './components/DataManager';
import StatsDashboard from './components/StatsDashboard';
import SprintBoard from './components/SprintBoard';
import ReleaseLog from './components/ReleaseLog';
import TagManager from './components/TagManager';
import BookmarkManager from './components/BookmarkManager';
import SettingsPanel from './components/SettingsPanel';
import Modal from './components/Modal';
import ToastContainer, { toast } from './components/Toast';
import GlobalSearch from './components/GlobalSearch';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPluginId, setSelectedPluginId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [highlightPluginId, setHighlightPluginId] = useState(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const hideTimer = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    store, addPlugin, updatePlugin, deletePlugin, movePluginStatus, movePluginTo, reorderPlugins,
    addMilestone, updateMilestone, deleteMilestone,
    toggleTask, addTask, deleteTask,
    addIdea, updateIdea, deleteIdea, addPluginIdea,
    addRelease, deleteRelease, updateRelease, pinRelease,
    addTag, removeTag,
    addBookmarkCollection, removeBookmarkCollection, renameBookmarkCollection,
    addPluginToBookmark, removePluginFromBookmark,
    importStore, resetStore,
    updateSettings,
  } = useStore();

  const settings = store.settings || {};
  const lang = settings.language || 'zh';
  const t = useT(lang);
  const autoHide = settings.autoHide || false;

  // ── 响应式 ──
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── 同步主题类名到 <html> ──
  useEffect(() => {
    const root = document.documentElement;
    root.className = [
      `theme-${settings.theme || 'gold'}`,
      `accent-${settings.accent || 'gold'}`,
      `corner-${settings.corner || 'square'}`,
      `lang-${lang}`,
    ].join(' ');
  }, [settings.theme, settings.accent, settings.corner, lang]);

  const plugins = store.plugins || [];
  const standaloneIdeas = store.standaloneIdeas || [];

  const selectedPlugin = useMemo(
    () => plugins.find(p => p.id === selectedPluginId) || plugins[0] || null,
    [plugins, selectedPluginId]
  );

  /** 搜索选中 */
  const handleSearchResult = useCallback(({ type, id, to }) => {
    setGlobalSearchOpen(false);
    if (!to && type !== 'plugin' && type !== 'tag' && type !== 'idea') return;
    const dest = to || (type === 'tag' ? 'tags' : 'kanban');
    const pluginId = type === 'tag' ? null : id;
    setHighlightPluginId(pluginId || id);
    setActiveTab(dest);
    if (pluginId && (dest === 'milestones' || dest === 'kanban')) setSelectedPluginId(pluginId);
    setTimeout(() => setHighlightPluginId(null), 2500);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'settings') { setSettingsOpen(true); return; }
    setActiveTab(tab);
    if (tab === 'milestones' && !selectedPlugin && plugins.length > 0) {
      setSelectedPluginId(plugins[0].id);
    }
  };

  const handleDeletePlugin = (id) => {
    deletePlugin(id);
    if (selectedPluginId === id) setSelectedPluginId(null);
  };

  /** 从外部拖入文件创建插件 */
  const _dropOnce = useRef(0);
  const handleExternalDrop = (name, status) => {
    if (plugins.some(p => p.name === name)) {
      toast('warning', `插件「${name}」已存在`);
      return;
    }
    addPlugin({ name, status, priority: 'external' });
    _dropOnce.current++;
    if (_dropOnce.current === 1) {
      toast('success', `已从外部导入：${name}`);
      setTimeout(() => { _dropOnce.current = 0; }, 2000);
    }
  };

  // ── 自动隐藏侧边栏 ──
  const handleSidebarEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setSidebarHidden(false);
  }, []);

  const handleSidebarLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setSidebarHidden(true), 400);
  }, []);

  const handleTriggerEnter = useCallback(() => {
    setSidebarHidden(false);
  }, []);

  // ── 键盘快捷键 ──
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('kanban');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [settingsOpen]);

  return (
    <div className="min-h-screen">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* 触发区 - 桌面 autoHide */}
      {!isMobile && autoHide && sidebarHidden && (
        <div onMouseEnter={handleTriggerEnter}
          className="fixed left-0 top-0 bottom-0 w-[8px] z-50 cursor-default" />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        pluginCount={plugins.length}
        t={t}
        onOpenSettings={() => setSettingsOpen(true)}
        hidden={!isMobile && autoHide && sidebarHidden}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        isMobile={isMobile}
        onMobileClose={() => setSidebarCollapsed(true)}
      />

      {/* 移动端汉堡按钮 */}
      {isMobile && sidebarCollapsed && (
        <button onClick={() => setSidebarCollapsed(false)}
          className="fixed top-4 left-4 z-40 w-11 h-11 glass flex items-center justify-center tap-target"
          aria-label="打开菜单">
          <Menu size={20} className="text-hermes-text" />
        </button>
      )}

      <ToastContainer />

      <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)}
        onSelect={handleSearchResult} plugins={plugins} t={t} />

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t('settings.title')}>
        <SettingsPanel settings={settings} onUpdate={updateSettings} t={t} />
      </Modal>

      {/* Main Content */}
      <main
        className="relative z-10 min-h-screen transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : (autoHide && sidebarHidden ? 0 : (sidebarCollapsed ? 60 : 220)) }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* 搜索按钮 */}
          <button onClick={() => setGlobalSearchOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 glass flex items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all tap-target"
            aria-label={t('app.search')} title={t('app.search')}>
            <Search size={20} className="text-hermes-gold" />
          </button>

          {activeTab === 'kanban' && (
            <KanbanBoard
              plugins={plugins} highlightPluginId={highlightPluginId}
              bookmarkCollections={store.bookmarkCollections || []}
              onAddPluginToBookmark={addPluginToBookmark}
              onRemovePluginFromBookmark={removePluginFromBookmark}
              onAddBookmarkCollection={addBookmarkCollection}
              onAddPlugin={addPlugin} onUpdatePlugin={updatePlugin}
              onDeletePlugin={handleDeletePlugin}
              onMoveStatus={movePluginStatus} onMoveTo={movePluginTo}
              onReorder={reorderPlugins} onExternalDrop={handleExternalDrop} t={t}
            />
          )}

          {activeTab === 'milestones' && (
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="w-full md:w-56 flex-shrink-0">
                <div className="glass p-3">
                  <h3 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider mb-3 px-2">
                    {t('milestone.selectPlugin')}
                  </h3>
                  <div className="space-y-1">
                    {plugins.map(p => (
                      <button key={p.id} onClick={() => setSelectedPluginId(p.id)}
                        className={`w-full text-left px-3 py-2 text-sm transition-all ${selectedPluginId === p.id ? 'nav-active' : 'nav-inactive'}`}>
                        {p.name || t('kanban.noName')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <MilestoneTracker plugin={selectedPlugin} highlightPluginId={highlightPluginId}
                  onAddMilestone={addMilestone} onUpdateMilestone={updateMilestone}
                  onDeleteMilestone={deleteMilestone} onToggleTask={toggleTask}
                  onAddTask={addTask} onDeleteTask={deleteTask} t={t} />
              </div>
            </div>
          )}

          {activeTab === 'sprint' && <SprintBoard plugins={plugins} highlightPluginId={highlightPluginId} t={t} />}
          {activeTab === 'ideas' && (
            <IdeaVault plugins={plugins} storeIdeas={standaloneIdeas}
              onAddIdea={addIdea} onUpdateIdea={updateIdea} onDeleteIdea={deleteIdea} t={t} lang={lang} />
          )}
          {activeTab === 'timeline' && <TimelineView plugins={plugins} t={t} />}
          {activeTab === 'stats' && <StatsDashboard plugins={plugins} t={t} />}
          {activeTab === 'releases' && (
            <ReleaseLog plugins={plugins} highlightPluginId={highlightPluginId}
              onAddRelease={addRelease} onDeleteRelease={deleteRelease}
              onUpdateRelease={updateRelease} onPinRelease={pinRelease} t={t} />
          )}
          {activeTab === 'tags' && (
            <TagManager plugins={plugins} highlightPluginId={highlightPluginId}
              storeTags={store.tags || []} onAddTag={addTag} onRemoveTag={removeTag} t={t} />
          )}
          {activeTab === 'bookmarks' && (
            <BookmarkManager plugins={plugins} bookmarkCollections={store.bookmarkCollections || []}
              onAddCollection={addBookmarkCollection} onRemoveCollection={removeBookmarkCollection}
              onRenameCollection={renameBookmarkCollection}
              onAddPlugin={addPluginToBookmark} onRemovePlugin={removePluginFromBookmark} t={t} />
          )}
          {activeTab === 'data' && (
            <DataManager store={store} onImport={importStore} onReset={resetStore} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}
