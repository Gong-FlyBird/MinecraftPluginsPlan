import { useState, useMemo } from 'react';
import { useStore } from './utils/store';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import MilestoneTracker from './components/MilestoneTracker';
import IdeaVault from './components/IdeaVault';
import TimelineView from './components/TimelineView';
import DataManager from './components/DataManager';
import StatsDashboard from './components/StatsDashboard';
import SprintBoard from './components/SprintBoard';
import TagManager from './components/TagManager';
import { createPlugin, createMilestone, createTask } from './utils/helpers';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPluginId, setSelectedPluginId] = useState(null);

  const {
    store, addPlugin, updatePlugin, deletePlugin, movePluginStatus,
    addMilestone, updateMilestone, deleteMilestone,
    toggleTask, addTask, deleteTask,
    addIdea, updateIdea, deleteIdea, addPluginIdea,
    addTag, removeTag,
    importStore, resetStore,
  } = useStore();

  const plugins = store.plugins || [];
  const standaloneIdeas = store.standaloneIdeas || [];

  // Selected plugin for milestones view
  const selectedPlugin = useMemo(
    () => plugins.find(p => p.id === selectedPluginId) || plugins[0] || null,
    [plugins, selectedPluginId]
  );

  // When switching to milestones tab, auto-select first plugin
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'milestones' && !selectedPlugin && plugins.length > 0) {
      setSelectedPluginId(plugins[0].id);
    }
  };

  const handleDeletePlugin = (id) => {
    if (window.confirm('确认删除此插件？关联的里程碑和任务也会被移除。')) {
      deletePlugin(id);
      if (selectedPluginId === id) setSelectedPluginId(null);
    }
  };

  // ── 样式补偿：左侧边栏占用空间 ──
  const sidebarWidth = sidebarCollapsed ? '60px' : '220px';

  return (
    <div className="min-h-screen bg-hermes-bg">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        pluginCount={plugins.length}
      />

      {/* Main Content */}
      <main
        style={{ marginLeft: sidebarWidth }}
        className="relative z-10 min-h-screen transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Tab Views */}
          {activeTab === 'kanban' && (
            <KanbanBoard
              plugins={plugins}
              onAddPlugin={addPlugin}
              onUpdatePlugin={updatePlugin}
              onDeletePlugin={handleDeletePlugin}
              onMoveStatus={movePluginStatus}
            />
          )}

          {activeTab === 'milestones' && (
            <div className="flex gap-4">
              {/* Plugin Selector Sidebar */}
              <div className="w-56 flex-shrink-0">
                <div className="glass rounded-xl p-3">
                  <h3 className="text-xs font-semibold text-hermes-text-muted/60 uppercase tracking-wider mb-3 px-2">
                    选择插件
                  </h3>
                  <div className="space-y-1">
                    {plugins.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPluginId(p.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedPluginId === p.id
                            ? 'nav-active'
                            : 'nav-inactive'
                        }`}
                      >
                        {p.name || '未命名'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1">
                <MilestoneTracker
                  plugin={selectedPlugin}
                  onAddMilestone={addMilestone}
                  onUpdateMilestone={updateMilestone}
                  onDeleteMilestone={deleteMilestone}
                  onToggleTask={toggleTask}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                />
              </div>
            </div>
          )}

          {activeTab === 'sprint' && (
            <SprintBoard plugins={plugins} />
          )}

          {activeTab === 'ideas' && (
            <IdeaVault
              plugins={plugins}
              storeIdeas={standaloneIdeas}
              onAddIdea={addIdea}
              onUpdateIdea={updateIdea}
              onDeleteIdea={deleteIdea}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView plugins={plugins} />
          )}

          {activeTab === 'stats' && (
            <StatsDashboard plugins={plugins} />
          )}

          {activeTab === 'tags' && (
            <TagManager
              plugins={plugins}
              storeTags={store.tags || []}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          )}

          {activeTab === 'data' && (
            <DataManager
              store={store}
              onImport={importStore}
              onReset={resetStore}
            />
          )}
        </div>
      </main>
    </div>
  );
}
