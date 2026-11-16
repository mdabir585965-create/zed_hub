import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { requireAuth, requireFirestore, auth } from './config';
import { AdminUser } from '../shared/types';
import { recordAdminLog } from './logs';

async function fetchAdminRecord(user: User): Promise<AdminUser | null> {
  const db = requireFirestore();
  const snap = await getDoc(doc(db, 'admins', user.uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.active || !['super_admin', 'admin'].includes(data.role)) {
    return null;
  }
  return {
    uid: user.uid,
    email: user.email || data.email || '',
    displayName: data.displayName || user.email || 'ZED Admin',
    role: data.role,
    active: Boolean(data.active),
  };
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const firebaseAuth = requireAuth();
  const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  const admin = await fetchAdminRecord(cred.user);

  if (!admin) {
    await signOut(firebaseAuth);
    throw new Error(
      'Access denied. This account is not registered as an active ZED Hub administrator.'
    );
  }

  await recordAdminLog(admin, 'login', 'auth', `Administrator signed in (${admin.email})`);
  return admin;
}

export async function logoutAdmin(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeAdminAuth(
  callback: (state: { loading: boolean; admin: AdminUser | null }) => void
): () => void {
  if (!auth) {
    callback({ loading: false, admin: null });
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ loading: false, admin: null });
      return;
    }
    try {
      const admin = await fetchAdminRecord(user);
      callback({ loading: false, admin });
    } catch {
      callback({ loading: false, admin: null });
    }
  });
}
