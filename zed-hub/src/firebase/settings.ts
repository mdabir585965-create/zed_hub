import { doc, getDoc, setDoc } from 'firebase/firestore';
import { requireFirestore, isFirebaseConfigured } from './config';
import { AdminUser, SiteSettings } from '../shared/types';
import { getCached, setCached, invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'ZED HUB',
  tagline: 'International Luxury Commerce',
  logoUrl: '',
  faviconUrl: '',
  announcementEnabled: true,
  announcementText: 'Complimentary Global Express Presentation · Curated Season Showcase',
  announcementLink: '/products',
  heroFallbackTitle: 'Timeless Form, Modern Distinction',
  heroFallbackSubtitle:
    'Discover curated objects, refined silhouettes, and limited seasonal editions managed live from the ZED Hub Studio.',
  contactEmail: 'concierge@zedhub.example',
  contactPhone: '+1 (555) 019-2834',
  contactAddress: 'Suite 400, Obsidian Avenue, New York / London',
  currencySymbol: '$',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    twitter: 'https://x.com',
    youtube: 'https://youtube.com',
  },
  navigation: [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/products' },
    { label: 'Contact', path: '/contact' },
  ],
  footerAbout:
    'ZED Hub is an international luxury digital flagship crafted around timeless design, disciplined curation, and effortless elegance.',
  footerLinks: [
    { label: 'All Products', path: '/products' },
    { label: 'Contact Concierge', path: '/contact' },
    { label: 'Admin Portal', path: '/admin' },
  ],
  seo: {
    defaultTitle: 'ZED Hub | Curated Luxury & Modern Commerce',
    defaultDescription:
      'Explore ZED Hub — an international luxury commerce destination crafted in obsidian black, ivory, and champagne gold.',
    keywords: 'ZED Hub, luxury commerce, curated goods, editorial storefront',
    ogImageUrl: '',
  },
  updatedAt: Date.now(),
};

const CACHE_KEY = 'settings:site';

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isFirebaseConfigured) return DEFAULT_SETTINGS;
  const cached = getCached<SiteSettings>(CACHE_KEY);
  if (cached) return cached;

  try {
    const db = requireFirestore();
    const snap = await getDoc(doc(db, 'settings', 'site'));
    if (!snap.exists()) {
      setCached(CACHE_KEY, DEFAULT_SETTINGS, 120_000);
      return DEFAULT_SETTINGS;
    }
    const merged: SiteSettings = {
      ...DEFAULT_SETTINGS,
      ...(snap.data() as Partial<SiteSettings>),
      socialLinks: {
        ...DEFAULT_SETTINGS.socialLinks,
        ...((snap.data() as Partial<SiteSettings>).socialLinks || {}),
      },
      seo: {
        ...DEFAULT_SETTINGS.seo,
        ...((snap.data() as Partial<SiteSettings>).seo || {}),
      },
    };
    setCached(CACHE_KEY, merged, 120_000);
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(
  data: SiteSettings,
  admin: AdminUser
): Promise<void> {
  const db = requireFirestore();
  await setDoc(doc(db, 'settings', 'site'), {
    ...data,
    updatedAt: Date.now(),
  });
  invalidateCache('settings:');
  await recordAdminLog(admin, 'update', 'settings', 'Updated global site settings, navigation, and SEO');
}
