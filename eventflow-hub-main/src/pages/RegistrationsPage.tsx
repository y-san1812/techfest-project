import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Check, X as XIcon } from 'lucide-react';

interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: { email: string; name: string };
  team?: { name: string } | null;
}

interface Event {
  id: string;
  title: string;
}

export default function RegistrationsPage() {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const canApprove = hasRole('SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR');

  useEffect(() => {
    api.get<Event[]>('/events').then(setEvents).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    api
      .get<Registration[]>(`/registrations/event/${selectedEvent}`)
      .then(setRegistrations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/registrations/${id}/status`, { status });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      // ignore
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'APPROVED') return 'bg-success/10 text-success border-success/20';
    if (s === 'REJECTED') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registrations</h2>
          <p className="text-sm text-muted-foreground">View and manage event registrations</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Select Event</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Choose an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading registrations…</p>
        ) : !selectedEvent ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            Select an event to view registrations.
          </div>
        ) : registrations.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No registrations for this event.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Team</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    {canApprove && (
                      <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-foreground">{reg.user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.team?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>
                      {canApprove && (
                        <td className="px-4 py-3">
                          {reg.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(reg.id, 'APPROVED')}
                                className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20 transition-colors"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => updateStatus(reg.id, 'REJECTED')}
                                className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                              >
                                <XIcon className="h-3 w-3" /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
