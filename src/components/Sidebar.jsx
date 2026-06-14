import {
  LayoutDashboard, ListTodo, Lightbulb, Clock, Database,
  BarChart3, Target, Tag, ChevronLeft, Package,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'kanban', label: '插件看板', icon: LayoutDashboard, desc: 'Kanban 状态管理' },
  { id: 'milestones', label: '里程碑', icon: ListTodo, desc: '任务拆解与追踪' },
  { id: 'sprint', label: '冲刺看板', icon: Target, desc: '周/月冲刺视图' },
  { id: 'ideas', label: '灵感库', icon: Lightbulb, desc: '创意与参考' },
  { id: 'timeline', label: '时间线', icon: Clock, desc: '变更历史' },
  { id: 'stats', label: '统计面板', icon: BarChart3, desc: '数据可视化' },
  { id: 'tags', label: '标签管理', icon: Tag, desc: '分类与筛选' },
  { id: 'data', label: '数据管理', icon: Database, desc: '导入/导出' },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle, pluginCount }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[60px]' : 'w-[220px]'
      }`}
    >
      {/* Glass background */}
      <div className="absolute inset-0 sidebar-glass" />

      {/* Content */}
      <div className="relative flex flex-col h-full py-4">
        {/* Logo */}
        <div className="px-4 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-hermes-gold/10 border border-hermes-gold/20 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-hermes-gold" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-hermes-text leading-tight">MC 插件计划</h2>
              <p className="text-[10px] text-hermes-text-muted/50">{pluginCount} 个项目</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full sidebar-glass flex items-center justify-center hover:bg-black/5 transition-colors z-10"
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? 'nav-active'
                    : 'nav-inactive'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <div className="min-w-0">
                    <span className="text-sm font-medium block leading-tight">{item.label}</span>
                    <span className="text-[10px] text-hermes-text-muted/40">{item.desc}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 mt-auto">
            <p className="text-[10px] text-hermes-text-muted/30 text-center">
              Hermes · 液态玻璃
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
