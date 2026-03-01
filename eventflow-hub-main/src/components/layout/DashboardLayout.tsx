import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Role } from '@/types/auth';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  ListTodo,
  Bell,
  BarChart3,
  Link2,
  LogOut,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarLink {
  label: string;
  to: string;
  icon: React.ElementType;
  roles?: Role[];
}

const links: SidebarLink[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Events',
    to: '/events',
    icon: CalendarDays,
    roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'CLUB_COORDINATOR'],
  },
  {
    label: 'Registrations',
    to: '/registrations',
    icon: ClipboardList,
    roles: ['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'CLUB_COORDINATOR'],
  },
  {
    label: 'Referrals',
    to: '/referrals',
    icon: Link2,
    roles: ['CAMPUS_AMBASSADOR'],
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: ListTodo,
    roles: ['TEAM_LEAD', 'VOLUNTEER', 'SUPER_ADMIN', 'ADMIN'],
  },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  {
    label: 'Reports',
    to: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredLinks = links.filter(
    (link) => !link.roles || hasRole(...link.roles)
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-sidebar-foreground">Tech Fest</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="px-5 py-3 border-b border-sidebar-border">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.roles.join(', ')}</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {filteredLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
                }`
              }
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
