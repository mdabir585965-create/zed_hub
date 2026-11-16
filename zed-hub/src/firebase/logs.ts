import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { requireFirestore } from './config';
import { AdminLog, AdminUser, PaginatedResult } from '../shared/types';

export async function recordAdminLog(
  admin: Pick<AdminUser, 'uid' | 'email'>,
  action: AdminLog['action'],
  entity: string,
  details: string
): Promise<void> {
  const db = requireFirestore();
  await addDoc(collection(db, 'admin_logs'), {
    adminUid: admin.uid,
    adminEmail: admin.email,
    action,
    entity,
    details,
    createdAt: Date.now(),
  });
}

export async function getAdminLogs(
  pageSize = 20,
  cursor?: DocumentSnapshot | null
): Promise<PaginatedResult<AdminLog>> {
  const db = requireFirestore();
  const constraints = [
    orderBy('createdAt', 'desc'),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize + 1),
  ];
  const snap = await getDocs(query(collection(db, 'admin_logs'), ...constraints));
  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  return {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminLog, 'id'>) })),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore,
  };
}
