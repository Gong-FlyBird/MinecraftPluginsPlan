import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, ListTodo, Lightbulb, Clock, Database,
  BarChart3, Target, Tag, ChevronLeft, Package, Settings, X, Bookmark,
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
  { id: 'releases', labelKey: 'sidebar.releases', icon: Package, descKey: 'sidebar.releases.desc' },
  { id: 'bookmarks', labelKey: 'sidebar.bookmarks', icon: Bookmark, descKey: 'sidebar.bookmarks.desc' },
];

export default function Sidebar({
  activeTab, onTabChange, collapsed, onToggle, pluginCount, t, onOpenSettings,
  visible = true, autoHide = false,
  onMouseEnter, onMouseLeave,
  isMobile, onMobileClose,
}) {
  const [mobileTop, setMobileTop] = useState(0);
  const prevCollapsed = useRef(collapsed);
  const widthClass = collapsed ? 'w-[60px]' : isMobile ? 'w-[280px] max-w-[85vw]' : 'w-[220px]';

  // 手机侧边栏打开时记录当前 scrollY → 固定在该位置而非顶部
  useEffect(() => {
    if (isMobile && !collapsed && prevCollapsed.current) {
      setMobileTop(window.scrollY);
    }
    prevCollapsed.current = collapsed;
  }, [isMobile, collapsed]);
  // 手机用 transform 滑入滑出；桌面不下任何 translate（transform 会禁用 sticky）
  // autoHide 模式下用 invisible+opacity 替代 translate 隐藏
  const hiddenClass = isMobile
    ? (collapsed ? '-translate-x-full' : 'translate-x-0')
    : (autoHide && !visible ? 'invisible opacity-0 pointer-events-none' : '');

  return (
    <>
      {/* 移动端遮罩 */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`${isMobile ? 'fixed left-0 h-full' : 'sticky top-0 h-screen flex-shrink-0 self-start'} z-40 transition-all duration-300 ease-in-out ${widthClass} ${hiddenClass}`}
        style={isMobile ? { top: collapsed ? 0 : mobileTop } : undefined}
      >
        <div className="absolute inset-0 sidebar-glass" />

      <div className="relative flex flex-col h-full py-4">
        {/* 移动端关闭按钮 */}
        {isMobile && !collapsed && (
          <button
            onClick={onMobileClose}
            className="absolute top-3 right-3 w-8 h-8 glass flex items-center justify-center tap-target z-20"
            aria-label="关闭菜单"
          >
            <X size={18} className="text-hermes-text-muted/60" />
          </button>
        )}

        {/* Logo */}
        <div className={`px-4 mb-8 flex items-center gap-3 ${isMobile && !collapsed ? 'pr-12' : ''}`}>
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

        {/* Toggle Button - 桌面端专用 */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className={`absolute -right-3 top-6 w-6 h-6 sidebar-glass flex items-center justify-center hover:bg-black/5 transition-colors z-10 ${
              autoHide && !visible ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft size={12} className={`text-hermes-gold transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); if (isMobile) onMobileClose?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-3 transition-all duration-200 text-left tap-target-nav ${
                  isActive ? 'nav-active' : 'nav-inactive'
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
            onClick={() => { onOpenSettings(); if (isMobile) onMobileClose?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 transition-all duration-200 text-left tap-target-nav ${
              activeTab === 'settings' ? 'nav-active' : 'nav-inactive'
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
    </>
  );
}
