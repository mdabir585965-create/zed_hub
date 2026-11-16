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
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { requireFirestore, isFirebaseConfigured } from './config';
import { AdminUser, PaginatedResult, Product } from '../shared/types';
import { getCached, setCached, invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

export interface PublicProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  featured?: boolean;
  trending?: boolean;
  pageSize?: number;
  cursor?: DocumentSnapshot | null;
}

export async function getPublicProducts(
  filters: PublicProductFilters = {}
): Promise<PaginatedResult<Product>> {
  if (!isFirebaseConfigured) return { items: [], lastDoc: null, hasMore: false };

  const pageSize = filters.pageSize ?? 12;
  const cacheKey = !filters.cursor
    ? `products:pub:${filters.categoryId || 'all'}:${filters.subcategoryId || 'all'}:${
        filters.featured ? 'f' : ''
      }:${filters.trending ? 't' : ''}:${pageSize}`
    : null;

  if (cacheKey) {
    const cached = getCached<PaginatedResult<Product>>(cacheKey);
    if (cached) return cached;
  }

  const db = requireFirestore();
  const constraints: QueryConstraint[] = [where('published', '==', true)];

  if (filters.categoryId) constraints.push(where('categoryId', '==', filters.categoryId));
  if (filters.subcategoryId) constraints.push(where('subcategoryId', '==', filters.subcategoryId));
  if (filters.featured) constraints.push(where('featured', '==', true));
  if (filters.trending) constraints.push(where('trending', '==', true));

  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.cursor) constraints.push(startAfter(filters.cursor));
  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, 'products'), ...constraints));
  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  const result: PaginatedResult<Product> = {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore,
  };

  if (cacheKey) setCached(cacheKey, result, 60_000);
  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isFirebaseConfigured) return null;
  const cacheKey = `products:slug:${slug}`;
  const cached = getCached<Product>(cacheKey);
  if (cached) return cached;

  const db = requireFirestore();
  const q = query(
    collection(db, 'products'),
    where('published', '==', true),
    where('slug', '==', slug),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const product = { id: d.id, ...(d.data() as Omit<Product, 'id'>) };
  setCached(cacheKey, product, 60_000);
  return product;
}

export async function getAdminProducts(
  pageSize = 20,
  cursor?: DocumentSnapshot | null
): Promise<PaginatedResult<Product>> {
  const db = requireFirestore();
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, 'products'), ...constraints));
  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  return {
    items: docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })),
    lastDoc: docs.length ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  admin: AdminUser
): Promise<string> {
  const db = requireFirestore();
  const now = Date.now();
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  invalidateCache('products:');
  await recordAdminLog(admin, 'create', 'product', `Created product "${data.title}" (SKU: ${data.sku})`);
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: Date.now(),
  });
  invalidateCache('products:');
  await recordAdminLog(admin, 'update', 'product', `Updated product "${data.title || id}"`);
}

export async function toggleProductPublish(
  id: string,
  published: boolean,
  title: string,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await updateDoc(doc(db, 'products', id), {
    published,
    updatedAt: Date.now(),
  });
  invalidateCache('products:');
  await recordAdminLog(
    admin,
    published ? 'publish' : 'unpublish',
    'product',
    `${published ? 'Published' : 'Unpublished'} product "${title}"`
  );
}

export async function deleteProduct(id: string, title: string, admin: AdminUser): Promise<void> {
  const db = requireFirestore();
  await deleteDoc(doc(db, 'products', id));
  invalidateCache('products:');
  await recordAdminLog(admin, 'delete', 'product', `Deleted product "${title}"`);
}
