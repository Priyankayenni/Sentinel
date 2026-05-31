import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/database.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border border-cyan-500/10" />
          </div>
          <p className="text-xs text-cyan-400 font-mono animate-pulse tracking-widest">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen bg-[#050a0f] flex items-center justify-center">
        <div className="text-center cyber-card p-8 max-w-sm border border-red-500/30">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400">
            You don't have permission to view this page. Required role:{' '}
            <span className="text-cyan-400 font-mono">{requiredRole}</span>
          </p>
          <a href="/dashboard" className="mt-4 inline-block btn-ghost text-sm">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
