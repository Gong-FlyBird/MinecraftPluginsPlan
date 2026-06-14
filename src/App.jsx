import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useStore } from './utils/store';
import { useT } from './utils/i18n';
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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const hideTimer = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    store, addPlugin, updatePlugin, deletePlugin, movePluginStatus,
    addMilestone, updateMilestone, deleteMilestone,
    toggleTask, addTask, deleteTask,
    addIdea, updateIdea, deleteIdea, addPluginIdea,
    addRelease, deleteRelease,
    addTag, removeTag,
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

  const handleTabChange = (tab) => {
    if (tab === 'settings') { setSettingsOpen(true); return; }
    setActiveTab(tab);
    if (tab === 'milestones' && !selectedPlugin && plugins.length > 0) {
      setSelectedPluginId(plugins[0].id);
    }
  };

  const handleDeletePlugin = (id) => {
    if (window.confirm(t('confirm.deletePlugin'))) {
      deletePlugin(id);
      if (selectedPluginId === id) setSelectedPluginId(null);
    }
  };

  // ── 自动隐藏侧边栏 ──
  const handleSidebarEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setSidebarVisible(true);
  }, []);

  const handleSidebarLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setSidebarVisible(false), 400);
  }, []);

  const handleTriggerEnter = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  // 主内容左边距（移动端侧边栏覆盖，不计入）
  const sidebarWidth = isMobile ? '0px' : (
    autoHide
      ? (sidebarVisible ? (sidebarCollapsed ? '60px' : '220px') : '0px')
      : (sidebarCollapsed ? '60px' : '220px')
  );
  const sidebarOverlay = isMobile && !sidebarCollapsed;

  // ── 键盘快捷键 ──
  useEffect(() => {
    const handleKey = (e) => {
      // Ctrl+N / ⌘+N → 切换到看板并打开新建
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('kanban');
      }
      // Ctrl+F / ⌘+F → 聚焦搜索（触发看板的搜索）
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // 触发全局搜索弹窗
        setGlobalSearchOpen(true);
      }
      // Escape → 关闭设置
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

      {/* 触发区 */}
      {((autoHide && !sidebarVisible) || isMobile) && (
        <div
          onMouseEnter={handleTriggerEnter}
          className="fixed left-0 top-0 bottom-0 w-[6px] z-50 cursor-default"
        />
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
        visible={sidebarVisible || isMobile}
        autoHide={autoHide}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        isMobile={isMobile}
        onMobileClose={() => setSidebarCollapsed(true)}
      />

      <ToastContainer />

      {/* Global Search */}
      <GlobalSearch
        open={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        plugins={plugins}
        t={t}
      />

      {/* Settings Modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t('settings.title')}>
        <div className="px-6 py-4">
          <SettingsPanel settings={settings} onUpdate={updateSettings} t={t} />
        </div>
      </Modal>

      {/* 移动端汉堡按钮 */}
      {isMobile && sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 w-10 h-10 glass flex items-center justify-center md:hidden"
        >
          <div className="space-y-1">
            <span className="block w-5 h-[2px] bg-hermes-text rounded" />
            <span className="block w-5 h-[2px] bg-hermes-text rounded" />
            <span className="block w-5 h-[2px] bg-hermes-text rounded" />
          </div>
        </button>
      )}

      {/* Main Content */}
      <main
        style={{ marginLeft: sidebarWidth }}
        className="relative z-10 min-h-screen transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'kanban' && (
            <KanbanBoard
              plugins={plugins}
              onAddPlugin={addPlugin}
              onUpdatePlugin={updatePlugin}
              onDeletePlugin={handleDeletePlugin}
              onMoveStatus={movePluginStatus}
              t={t}
            />
          )}

          {activeTab === 'milestones' && (
            <div className="flex gap-4">
              <div className="w-56 flex-shrink-0">
                <div className="glass p-3">
                  <h3 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider mb-3 px-2">
                    {t('milestone.selectPlugin')}
                  </h3>
                  <div className="space-y-1">
                    {plugins.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPluginId(p.id)}
                        className={`w-full text-left px-3 py-2 text-sm transition-all ${
                          selectedPluginId === p.id ? 'nav-active' : 'nav-inactive'
                        }`}
                      >
                        {p.name || t('kanban.noName')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <MilestoneTracker
                  plugin={selectedPlugin}
                  onAddMilestone={addMilestone}
                  onUpdateMilestone={updateMilestone}
                  onDeleteMilestone={deleteMilestone}
                  onToggleTask={toggleTask}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                  t={t}
                />
              </div>
            </div>
          )}

          {activeTab === 'sprint' && <SprintBoard plugins={plugins} t={t} />}
          {activeTab === 'ideas' && (
            <IdeaVault
              plugins={plugins} storeIdeas={standaloneIdeas}
              onAddIdea={addIdea} onUpdateIdea={updateIdea} onDeleteIdea={deleteIdea}
              t={t} lang={lang}
            />
          )}
          {activeTab === 'timeline' && <TimelineView plugins={plugins} t={t} />}
          {activeTab === 'stats' && <StatsDashboard plugins={plugins} t={t} />}
          {activeTab === 'releases' && (
            <ReleaseLog
              plugins={plugins}
              onAddRelease={addRelease}
              onDeleteRelease={deleteRelease}
              t={t}
            />
          )}
          {activeTab === 'tags' && (
            <TagManager
              plugins={plugins} storeTags={store.tags || []}
              onAddTag={addTag} onRemoveTag={removeTag} t={t}
            />
          )}
          {activeTab === 'data' && (
            <DataManager store={store} onImport={importStore} onReset={resetStore} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}
