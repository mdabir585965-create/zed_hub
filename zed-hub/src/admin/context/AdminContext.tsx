import { createContext, useContext } from 'react';
import { AdminUser } from '../../shared/types';

const AdminContext = createContext<AdminUser | null>(null);

export const AdminProvider = AdminContext.Provider;

export function useAdmin(): AdminUser {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used inside AdminGuard');
  }
  return ctx;
}
