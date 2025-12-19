
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
        <div className="relative">
          <Loader2 size={64} className="text-pink-500 animate-spin" />
          <ShieldCheck size={32} className="text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Establishing Secure Link</p>
      </div>
    );
  }

  // No user session found
  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Strict role check
  const isAdmin = user.role && String(user.role).toUpperCase() === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
