import {
  LayoutDashboard, ListTodo, Lightbulb, Clock, Database,
  BarChart3, Target, Tag, ChevronLeft, Package, Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'kanban', labelKey: 'sidebar.kanban', icon: LayoutDashboard, descKey: 'sidebar.kanban.desc' },
  { id: 'milestones', labelKey: 'sidebar.milestones', icon: ListTodo, descKey: 'sidebar.milestones.desc' },
  { id: 'sprint', labelKey: 'sidebar.sprint', icon: Target, descKey: 'sidebar.sprint.desc' },
  { id: 'ideas', labelKey: 'sidebar.ideas', icon: Lightbulb, descKey: 'sidebar.ideas.desc' },
  { id: 'timeline', labelKey: 'sidebar.timeline', icon: Clock, descKey: 'sidebar.timeline.desc' },
  { id: 'stats', labelKey: 'sidebar.stats', icon: BarChart3, descKey: 'sidebar.stats.desc' },
  { id: 'tags', labelKey: 'sidebar.tags', icon: Tag, descKey: 'sidebar.tags.desc' },
  { id: 'data', labelKey: 'sidebar.data', icon: Database, descKey: 'sidebar.data.desc' },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle, pluginCount, t, onOpenSettings }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out ${collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
    >
      <div className="absolute inset-0 sidebar-glass" />

      <div className="relative flex flex-col h-full py-4">
        {/* Logo */}
        <div className="px-4 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-hermes-gold/10 border border-hermes-gold/20 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-hermes-gold" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-hermes-text leading-tight">{t('app.title')}</h2>
              <p className="text-[10px] text-hermes-text-muted/50">{t('app.subtitle', { count: pluginCount })}</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 sidebar-glass flex items-center justify-center hover:bg-black/5 transition-colors z-10"
        >
          <ChevronLeft size={12} className={`text-hermes-gold transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Nav Items */}
        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-left ${isActive
                    ? 'nav-active'
                    : 'nav-inactive'
                  }`}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <div className="min-w-0">
                    <span className="text-sm font-medium block leading-tight">{t(item.labelKey)}</span>
                    <span className="text-[10px] text-hermes-text-muted/40">{t(item.descKey)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-2 mt-2">
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-left ${activeTab === 'settings'
                ? 'nav-active'
                : 'nav-inactive'
              }`}
            title={collapsed ? t('sidebar.settings') : undefined}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium block">{t('sidebar.settings')}</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
