import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessageSquare } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string | null;
  event?: { title: string } | null;
  team?: { name: string } | null;
}

const columns: { key: Task['status']; label: string; color: string }[] = [
  { key: 'TODO', label: 'To Do', color: 'border-t-warning' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-primary' },
  { key: 'COMPLETED', label: 'Completed', color: 'border-t-success' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentTaskId, setCommentTaskId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get<Task[]>('/tasks/my').then(setTasks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch {
      // ignore
    }
  };

  const submitComment = async (taskId: string) => {
    if (!comment.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: comment });
      setComment('');
      setCommentTaskId(null);
    } catch {
      // ignore
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
          <p className="text-sm text-muted-foreground">Your assigned tasks organized by status</p>
        </div>

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
                        {task.event && (
                          <p className="text-[11px] text-primary">📅 {task.event.title}</p>
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
