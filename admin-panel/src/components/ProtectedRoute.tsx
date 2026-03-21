import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, authenticated } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
