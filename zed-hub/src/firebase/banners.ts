import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { requireFirestore, isFirebaseConfigured } from './config';
import { AdminUser, Banner } from '../shared/types';
import { getCached, setCached, invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

const CACHE_KEY = 'banners:public';

export async function getPublicBanners(): Promise<Banner[]> {
  if (!isFirebaseConfigured) return [];
  const cached = getCached<Banner[]>(CACHE_KEY);
  if (cached) return cached;

  const db = requireFirestore();
  const q = query(
    collection(db, 'banners'),
    where('active', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Banner, 'id'>) }));
  setCached(CACHE_KEY, items, 90_000);
  return items;
}

export async function getAllBanners(): Promise<Banner[]> {
  const db = requireFirestore();
  const snap = await getDocs(query(collection(db, 'banners'), orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Banner, 'id'>) }));
}

export async function createBanner(
  data: Omit<Banner, 'id' | 'createdAt'>,
  admin: AdminUser
): Promise<string> {
  const db = requireFirestore();
  const ref = await addDoc(collection(db, 'banners'), {
    ...data,
    createdAt: Date.now(),
  });
  invalidateCache('banners:');
  await recordAdminLog(admin, 'create', 'banner', `Created banner "${data.title}"`);
  return ref.id;
}

export async function updateBanner(
  id: string,
  data: Partial<Omit<Banner, 'id' | 'createdAt'>>,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, 'banners', id), data);
  invalidateCache('banners:');
  await recordAdminLog(admin, 'update', 'banner', `Updated banner "${data.title || id}"`);
}

export async function deleteBanner(id: string, title: string, admin: AdminUser): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, 'banners', id));
  invalidateCache('banners:');
  await recordAdminLog(admin, 'delete', 'banner', `Deleted banner "${title}"`);
}
