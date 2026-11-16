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
import { AdminUser, Category } from '../shared/types';
import { getCached, setCached, invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

const CACHE_KEY = 'categories:public';

export async function getPublicCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured) return [];
  const cached = getCached<Category[]>(CACHE_KEY);
  if (cached) return cached;

  const db = requireFirestore();
  const q = query(
    collection(db, 'categories'),
    where('active', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
  setCached(CACHE_KEY, items, 120_000);
  return items;
}

export async function getAllCategories(): Promise<Category[]> {
  const db = requireFirestore();
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
}

export async function createCategory(
  data: Omit<Category, 'id' | 'createdAt'>,
  admin: AdminUser
): Promise<string> {
  const db = requireFirestore();
  const ref = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: Date.now(),
  });
  invalidateCache('categories:');
  await recordAdminLog(admin, 'create', 'category', `Created category "${data.name}"`);
  return ref.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id' | 'createdAt'>>,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, 'categories', id), data);
  invalidateCache('categories:');
  await recordAdminLog(admin, 'update', 'category', `Updated category "${data.name || id}"`);
}

export async function deleteCategory(id: string, name: string, admin: AdminUser): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, 'categories', id));
  invalidateCache('categories:');
  await recordAdminLog(admin, 'delete', 'category', `Deleted category "${name}"`);
}
