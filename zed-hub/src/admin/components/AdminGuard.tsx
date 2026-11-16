import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { subscribeAdminAuth } from '../../firebase/auth';
import { AdminUser } from '../../shared/types';
import { AdminProvider } from '../context/AdminContext';
import { LoadingScreen } from '../../shared/components/StateViews';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; admin: AdminUser | null }>({
    loading: true,
    admin: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeAdminAuth(setState);
    return () => unsubscribe();
  }, []);

  if (state.loading) {
    return <LoadingScreen label="Verifying Administrator Session..." />;
  }

  if (!state.admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminProvider value={state.admin}>{children}</AdminProvider>;
}
