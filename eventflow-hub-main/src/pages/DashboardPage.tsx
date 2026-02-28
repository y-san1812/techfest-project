import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, CalendarDays, ClipboardList, IndianRupee, ListTodo, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Summary {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasRole('SUPER_ADMIN', 'ADMIN')) return;
    setLoading(true);
    api
      .get<Summary>('/reports/summary')
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminCards = [
    { label: 'Total Users', value: summary?.totalUsers ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Events', value: summary?.totalEvents ?? 0, icon: CalendarDays, color: 'text-primary' },
    { label: 'Registrations', value: summary?.totalRegistrations ?? 0, icon: ClipboardList, color: 'text-primary' },
    { label: 'Revenue (₹)', value: summary?.totalRevenue ?? 0, icon: IndianRupee, color: 'text-success' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's your role-based overview of Tech Fest activity.
          </p>
        </div>

        {hasRole('SUPER_ADMIN', 'ADMIN') && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminCards.map((card) => (
              <div key={card.label} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {loading ? '—' : card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasRole('TEAM_LEAD', 'VOLUNTEER') && (
            <QuickLink
              to="/tasks"
              icon={ListTodo}
              title="Your Tasks"
              desc="View and update your assigned tasks"
            />
          )}
          {hasRole('CAMPUS_AMBASSADOR') && (
            <QuickLink
              to="/registrations"
              icon={Link2}
              title="Referral Dashboard"
              desc="Track registrations via your referral code"
            />
          )}
          {hasRole('FACULTY_COORDINATOR', 'CLUB_COORDINATOR') && (
            <QuickLink
              to="/events"
              icon={CalendarDays}
              title="Manage Events"
              desc="View and manage your assigned events"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <Link to={to} className="glass-card p-4 hover:border-primary/30 transition-colors group block">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
