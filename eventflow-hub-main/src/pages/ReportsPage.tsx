import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, BarChart3 } from 'lucide-react';

interface Summary {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  eventStats: { id: string; title: string; _count: { registrations: number } }[];
  volunteerTasks: { status: string; _count: { _all: number } }[];
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Summary>('/reports/summary').then(setSummary).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCsv = async () => {
    const token = localStorage.getItem('techfest_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const res = await fetch(`${baseUrl}/reports/registrations/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reports</h2>
            <p className="text-sm text-muted-foreground">Analytics and data exports</p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading reports…</p>
        ) : !summary ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            Failed to load report data.
          </div>
        ) : (
          <>
            {/* Event Registration Stats */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Event-wise Registrations
              </h3>
              <div className="glass-card p-4 space-y-3">
                {summary.eventStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events yet.</p>
                ) : (
                  summary.eventStats.map((ev) => {
                    const max = Math.max(...summary.eventStats.map((e) => e._count.registrations), 1);
                    const pct = (ev._count.registrations / max) * 100;
                    return (
                      <div key={ev.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{ev.title}</span>
                          <span className="text-muted-foreground">{ev._count.registrations}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Task Status */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Task Progress</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {summary.volunteerTasks.map((t) => {
                  const color = t.status === 'COMPLETED' ? 'text-success' : t.status === 'IN_PROGRESS' ? 'text-primary' : 'text-warning';
                  return (
                    <div key={t.status} className="glass-card p-4 text-center">
                      <p className={`text-2xl font-bold ${color}`}>{t._count._all}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.status.replace('_', ' ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
