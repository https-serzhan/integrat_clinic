import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, storeToken } from '../lib/api';
import type { AuthResponse, SessionUser } from '../types/models';

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  applyAuthResponse: (response: AuthResponse) => void;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await api.getSessionUser();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    if (response.access_token) {
      storeToken(response.access_token);
    }
    setUser(response.user);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      applyAuthResponse,
      refreshSession,
      logout
    }),
    [applyAuthResponse, loading, logout, refreshSession, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
