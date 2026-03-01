import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessageSquare, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string | null;
  event?: { title: string } | null;
  team?: { name: string; id: string } | null;
  createdBy?: { name: string } | null;
  assignments?: Array<{ userId: string; user: { name: string } }>;
}

interface Team {
  id: string;
  name: string;
  teamLead: { id: string; name: string };
  members: Array<{ userId: string; user: { id: string; name: string } }>;
}

const columns: { key: Task['status']; label: string; color: string }[] = [
  { key: 'PENDING', label: 'Pending', color: 'border-t-warning' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-primary' },
  { key: 'COMPLETED', label: 'Completed', color: 'border-t-success' },
];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, teamsRes] = await Promise.all([
        api.get<Task[]>('/tasks/my'),
        api.get<Team[]>('/teams'),
      ]);
      setTasks(tasksRes);
      setTeams(teamsRes);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const submitComment = async (taskId: string) => {
    if (!comment.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: comment });
      setComment('');
      setCommentTaskId(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim() || !selectedTeam) return;
    try {
      await api.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        teamId: selectedTeam,
      });
      setNewTask({ title: '', description: '' });
      setShowCreateTask(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Check if user is a team lead for any team
  const userTeamLeadTeams = teams.filter(t => t.teamLead.id === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
            <p className="text-sm text-muted-foreground">Your assigned tasks organized by status</p>
          </div>
          {userTeamLeadTeams.length > 0 && (
            <button
              onClick={() => setShowCreateTask(!showCreateTask)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateTask && userTeamLeadTeams.length > 0 && (
          <div className="glass-card p-4 border border-primary/30 space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-foreground">Create New Task</h3>
              <button
                onClick={() => setShowCreateTask(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Select Team
              </label>
              <select
                value={selectedTeam || ''}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose a team --</option>
                {userTeamLeadTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description (optional)
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description..."
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateTask(false)}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title.trim() || !selectedTeam}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No tasks assigned to you.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className={`glass-card p-4 border-t-2 ${col.color}`}>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {col.label}{' '}
                    <span className="text-muted-foreground font-normal">({colTasks.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <div key={task.id} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                        <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-col gap-1 text-[11px]">
                          {task.team && (
                            <p className="text-primary">👥 {task.team.name}</p>
                          )}
                          {task.event && (
                            <p className="text-primary">📅 {task.event.title}</p>
                          )}
                          {task.createdBy && (
                            <p className="text-muted-foreground">Created by: {task.createdBy.name}</p>
                          )}
                        </div>

                        {task.assignments && task.assignments.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">
                            Assigned to: {task.assignments.map(a => a.user.name).join(', ')}
                          </div>
                        )}

                        {task.deadline && (
                          <p className="text-[11px] text-muted-foreground">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          {col.key !== 'TODO' && (
                            <button
                              onClick={() => updateStatus(task.id, col.key === 'IN_PROGRESS' ? 'TODO' : 'IN_PROGRESS')}
                              className="text-[11px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                            >
                              ← {col.key === 'IN_PROGRESS' ? 'To Do' : 'In Progress'}
                            </button>
                          )}
                          {col.key !== 'COMPLETED' && (
                            <button
                              onClick={() => updateStatus(task.id, col.key === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED')}
                              className="text-[11px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                            >
                              {col.key === 'TODO' ? 'In Progress' : 'Complete'} →
                            </button>
                          )}
                          <button
                            onClick={() => setCommentTaskId(commentTaskId === task.id ? null : task.id)}
                            className="ml-auto text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {commentTaskId === task.id && (
                          <div className="flex gap-2 pt-1">
                            <input
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Add comment…"
                              className="flex-1 rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => submitComment(task.id)}
                              className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
