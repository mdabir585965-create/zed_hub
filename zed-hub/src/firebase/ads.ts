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
import { AdPlacement, AdminUser, Advertisement } from '../shared/types';
import { getCached, setCached, invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

export async function getActiveAdsForPlacement(
  placement: AdPlacement
): Promise<Advertisement[]> {
  if (!isFirebaseConfigured) return [];
  const cacheKey = `ads:${placement}`;
  const cached = getCached<Advertisement[]>(cacheKey);

  const now = Date.now();
  if (cached) {
    return cached.filter((ad) => ad.enabled && ad.startDate <= now && ad.endDate >= now);
  }

  const db = requireFirestore();
  const q = query(
    collection(db, 'ads'),
    where('enabled', '==', true),
    where('placement', '==', placement),
    orderBy('priority', 'desc')
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Advertisement, 'id'>),
  }));

  setCached(cacheKey, items, 60_000);
  return items.filter((ad) => ad.startDate <= now && ad.endDate >= now);
}

export async function getAllAds(): Promise<Advertisement[]> {
  const db = requireFirestore();
  const snap = await getDocs(query(collection(db, 'ads'), orderBy('priority', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Advertisement, 'id'>) }));
}

export async function createAd(
  data: Omit<Advertisement, 'id' | 'createdAt'>,
  admin: AdminUser
): Promise<string> {
  const db = requireFirestore();
  const ref = await addDoc(collection(db, 'ads'), {
    ...data,
    createdAt: Date.now(),
  });
  invalidateCache('ads:');
  await recordAdminLog(admin, 'create', 'advertisement', `Created ad "${data.title}" (${data.placement})`);
  return ref.id;
}

export async function updateAd(
  id: string,
  data: Partial<Omit<Advertisement, 'id' | 'createdAt'>>,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, 'ads', id), data);
  invalidateCache('ads:');
  await recordAdminLog(admin, 'update', 'advertisement', `Updated ad "${data.title || id}"`);
}

export async function deleteAd(id: string, title: string, admin: AdminUser): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, 'ads', id));
  invalidateCache('ads:');
  await recordAdminLog(admin, 'delete', 'advertisement', `Deleted ad "${title}"`);
}
