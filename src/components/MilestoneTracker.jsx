import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Calendar, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import GlassPanel from './GlassPanel';
import EmptyState from './EmptyState';
import { calcProgress, formatDate } from '../utils/helpers';

export default function MilestoneTracker({ plugin, onAddMilestone, onUpdateMilestone, onDeleteMilestone, onToggleTask, onAddTask, onDeleteTask }) {
  const [expanded, setExpanded] = useState({});
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState({});

  const progress = useMemo(() => calcProgress(plugin?.milestones), [plugin?.milestones]);
  const milestones = plugin?.milestones || [];

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    onAddMilestone(plugin.id, { title: newMilestoneTitle.trim(), deadline: '', tasks: [] });
    setNewMilestoneTitle('');
  };

  const handleAddTask = (milestoneId) => {
    const text = newTaskText[milestoneId]?.trim();
    if (!text) return;
    onAddTask(plugin.id, milestoneId, { text, deadline: '' });
    setNewTaskText(prev => ({ ...prev, [milestoneId]: '' }));
  };

  if (!plugin) {
    return (
      <EmptyState
        icon={ListTodo}
        title="选择一个插件"
        description="从看板中选择一个插件来管理其里程碑与任务"
      />
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hermes-text">{plugin.name} — 里程碑</h1>
          <p className="text-sm text-hermes-text-muted/60 mt-1">拆解开发任务，追踪完成进度</p>
        </div>
      </div>

      {/* Overall Progress */}
      <GlassPanel className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-hermes-text-muted">总进度</span>
          <span className="text-lg font-bold text-hermes-gold">{progress}%</span>
        </div>
        <div className="progress-bar h-2">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </GlassPanel>

      {/* Add Milestone */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newMilestoneTitle}
          onChange={e => setNewMilestoneTitle(e.target.value)}
          className="glass-input flex-1"
          placeholder="新增里程碑名称…"
          onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
        />
        <button onClick={handleAddMilestone} className="glass-btn glass-btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> 添加里程碑
        </button>
      </div>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="尚无里程碑"
          description="添加里程碑来拆分插件开发任务"
        />
      ) : (
        <div className="space-y-3">
          {milestones.map(m => {
            const tasks = m.tasks || [];
            const doneTasks = tasks.filter(t => t.done).length;
            const mProgress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
            const isExpanded = expanded[m.id] !== false; // default expanded

            return (
              <GlassPanel key={m.id} className="!p-0 overflow-hidden">
                {/* Milestone Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-hermes-gold/[0.06] transition-colors"
                  onClick={() => toggleExpand(m.id)}
                >
                  <button className="text-hermes-text-muted/50 hover:text-hermes-gold/70 transition-colors">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-hermes-text">{m.title || '未命名里程碑'}</h3>
                      {m.deadline && (
                        <span className="text-[10px] text-hermes-text-muted/50 flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(m.deadline)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="progress-bar flex-1 max-w-[200px]">
                        <div className="progress-bar-fill" style={{ width: `${mProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-hermes-text-muted/50">{doneTasks}/{tasks.length} 任务</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteMilestone(plugin.id, m.id); }}
                    className="glass-btn-danger !p-1.5 !border-0 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-hermes-border/30 pt-3">
                    {/* Tasks */}
                    {tasks.length === 0 && (
                      <p className="text-xs text-hermes-text-muted/40 py-2">暂无任务，添加一个吧</p>
                    )}
                    <div className="space-y-1.5 mb-3">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 group py-1.5 px-2 hover:bg-hermes-gold/[0.06] transition-colors">
                          <button
                            onClick={() => onToggleTask(plugin.id, m.id, task.id)}
                            className="flex-shrink-0"
                          >
                            {task.done
                              ? <CheckCircle2 size={16} className="text-hermes-gold" />
                              : <Circle size={16} className="text-hermes-text-muted/40 hover:text-hermes-gold/60 transition-colors" />
                            }
                          </button>
                          <span className={`flex-1 text-sm ${task.done ? 'line-through text-hermes-text-muted/40' : 'text-hermes-text'}`}>
                            {task.text}
                          </span>
                          {task.deadline && (
                            <span className="text-[10px] text-hermes-text-muted/40">{formatDate(task.deadline)}</span>
                          )}
                          <button
                            onClick={() => onDeleteTask(plugin.id, m.id, task.id)}
                            className="text-hermes-text-muted/20 hover:text-red-400/60 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Task Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskText[m.id] || ''}
                        onChange={e => setNewTaskText(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="glass-input !py-1.5 !px-3 text-sm flex-1"
                        placeholder="新增任务…"
                        onKeyDown={e => e.key === 'Enter' && handleAddTask(m.id)}
                      />
                      <button
                        onClick={() => handleAddTask(m.id)}
                        className="glass-btn !py-1.5 !px-3 text-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
