import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Plus, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  startTime: string;
  endTime: string;
  location: string;
  registrationCap: number | null;
}

export default function EventsPage() {
  const { hasRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const canManage = hasRole('SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'CLUB_COORDINATOR');

  const fetchEvents = () => {
    setLoading(true);
    api.get<Event[]>('/events').then(setEvents).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const statusColor = (s: string) => {
    if (s === 'PUBLISHED') return 'bg-success/10 text-success border-success/20';
    if (s === 'CLOSED') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-warning/10 text-warning border-warning/20';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Events</h2>
            <p className="text-sm text-muted-foreground">Manage and view Tech Fest events</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          )}
        </div>

        {showForm && canManage && (
          <CreateEventForm onCreated={() => { setShowForm(false); fetchEvents(); }} />
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No events found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <span className="inline-block mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {event.category}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(event.startTime), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                  {event.registrationCap && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>Cap: {event.registrationCap}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function CreateEventForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    startTime: '', endTime: '', registrationCap: '',
    status: 'DRAFT' as const,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post('/events', {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        registrationCap: form.registrationCap ? parseInt(form.registrationCap) : null,
      });
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
      <h3 className="font-semibold text-foreground">New Event</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className={inputCls} placeholder="Title" required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
        <input className={inputCls} placeholder="Category" required value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} />
        <input className={inputCls} placeholder="Location" required value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
        <input className={inputCls} placeholder="Registration Cap" type="number" value={form.registrationCap} onChange={e => setForm(f => ({...f, registrationCap: e.target.value}))} />
        <input className={inputCls} type="datetime-local" required value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} />
        <input className={inputCls} type="datetime-local" required value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} />
      </div>
      <textarea className={inputCls} placeholder="Description (min 10 chars)" required rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {saving ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  );
}
