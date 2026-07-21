import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from '../pages/Login';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--atlas-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-white/10"
            style={{ borderTopColor: 'var(--atlas-accent)' }}
          />
          <p className="text-xs text-[var(--atlas-text-tertiary)]">Loading ATLAS…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}
