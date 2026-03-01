import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card px-8 py-6 text-center max-w-sm">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have permission to view this area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
