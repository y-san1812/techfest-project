import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notification[]>('/notifications')
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`glass-card p-4 flex items-start gap-4 transition-colors ${
                  !n.read ? 'border-primary/20' : 'opacity-70'
                }`}
              >
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-primary animate-pulse-glow' : 'bg-muted-foreground/30'}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="shrink-0 flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
