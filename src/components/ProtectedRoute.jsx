import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
          <p className="text-slate-400 text-sm">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

// Separate guard for admin-only routes — blocks direct URL access even if user knows the path
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user?.isAdmin) {
    return <Navigate to="/stadium" replace />;
  }

  return children;
}
