import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { AuthResponse, AuthUser, Role } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('techfest_token');
    const storedUser = localStorage.getItem('techfest_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('techfest_token');
        localStorage.removeItem('techfest_user');
      }
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('techfest_token', data.token);
    localStorage.setItem('techfest_user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    persistAuth(data);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/register', { name, email, password });
    persistAuth(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techfest_token');
    localStorage.removeItem('techfest_user');
  };

  const hasRole = (...roles: Role[]) =>
    !!user && user.roles.some((role) => roles.includes(role));

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, register, logout, hasRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
