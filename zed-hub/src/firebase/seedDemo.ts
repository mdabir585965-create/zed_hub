import { writeBatch, doc, collection } from 'firebase/firestore';
import { requireFirestore } from './config';
import { AdminUser } from '../shared/types';
import { createDemoSvgDataUrl } from '../shared/utils/format';
import { invalidateCache } from '../shared/utils/cache';
import { recordAdminLog } from './logs';

export async function seedClearlyLabeledDemoData(admin: AdminUser): Promise<void> {
  const db = requireFirestore();
  const batch = writeBatch(db);
  const now = Date.now();

  const catWatchesRef = doc(collection(db, 'categories'));
  const catLeatherRef = doc(collection(db, 'categories'));
  const subChronoRef = doc(collection(db, 'categories'));

  batch.set(catWatchesRef, {
    name: '[DEMO] Timepieces',
    slug: 'demo-timepieces',
    description: 'Clearly labeled demo category for horology showcase.',
    parentId: null,
    imageUrl: createDemoSvgDataUrl('TIMEPIECES', 'DEMO CATEGORY'),
    order: 1,
    active: true,
    isDemo: true,
    createdAt: now,
  });

  batch.set(catLeatherRef, {
    name: '[DEMO] Atelier Goods',
    slug: 'demo-atelier-goods',
    description: 'Clearly labeled demo category for accessories and objects.',
    parentId: null,
    imageUrl: createDemoSvgDataUrl('ATELIER GOODS', 'DEMO CATEGORY'),
    order: 2,
    active: true,
    isDemo: true,
    createdAt: now,
  });

  batch.set(subChronoRef, {
    name: '[DEMO] Automatic Editions',
    slug: 'demo-automatic-editions',
    description: 'Clearly labeled demo subcategory.',
    parentId: catWatchesRef.id,
    imageUrl: createDemoSvgDataUrl('AUTOMATIC EDITIONS', 'DEMO SUBCATEGORY'),
    order: 3,
    active: true,
    isDemo: true,
    createdAt: now,
  });

  const demoProducts = [
    {
      title: '[DEMO] Obsidian Sovereign Chronograph',
      slug: 'demo-obsidian-sovereign-chronograph',
      description:
        'DEMO PRODUCT: Sample luxury timepiece entry demonstrating ZED Hub product specifications, multi-image gallery, discount pricing, and SEO metadata.',
      price: 2450,
      discountPrice: 2150,
      sku: 'DEMO-ZH-001',
      stock: 14,
      categoryId: catWatchesRef.id,
      subcategoryId: subChronoRef.id,
      images: [
        createDemoSvgDataUrl('SOVEREIGN CHRONOGRAPH', 'DEMO PRODUCT 01'),
        createDemoSvgDataUrl('CASEBACK DETAIL', 'DEMO GALLERY 02'),
      ],
      featured: true,
      trending: true,
      published: true,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: '[DEMO] Champagne Gold Desk Valet',
      slug: 'demo-champagne-gold-desk-valet',
      description:
        'DEMO PRODUCT: Sample architectural object showcasing stock tracking and category filtering.',
      price: 480,
      discountPrice: null,
      sku: 'DEMO-ZH-002',
      stock: 28,
      categoryId: catLeatherRef.id,
      subcategoryId: null,
      images: [createDemoSvgDataUrl('CHAMPAGNE DESK VALET', 'DEMO PRODUCT 02')],
      featured: true,
      trending: false,
      published: true,
      isDemo: true,
      createdAt: now - 1000,
      updatedAt: now - 1000,
    },
    {
      title: '[DEMO] Ivory Archive Folio',
      slug: 'demo-ivory-archive-folio',
      description:
        'DEMO PRODUCT: Sample executive folio illustrating trending placement and clean typography.',
      price: 690,
      discountPrice: 590,
      sku: 'DEMO-ZH-003',
      stock: 9,
      categoryId: catLeatherRef.id,
      subcategoryId: null,
      images: [createDemoSvgDataUrl('IVORY ARCHIVE FOLIO', 'DEMO PRODUCT 03')],
      featured: false,
      trending: true,
      published: true,
      isDemo: true,
      createdAt: now - 2000,
      updatedAt: now - 2000,
    },
  ];

  for (const item of demoProducts) {
    batch.set(doc(collection(db, 'products')), item);
  }

  batch.set(doc(collection(db, 'banners')), {
    title: '[DEMO] The Obsidian & Gold Showcase',
    subtitle:
      'Sample dynamic hero banner managed via Firestore. Replace or delete this banner anytime from Admin -> Banners.',
    ctaLabel: 'Explore Collections',
    ctaLink: '/products',
    imageUrl: createDemoSvgDataUrl('ZED HUB FLAGSHIP', 'DEMO HERO BANNER'),
    placement: 'hero',
    order: 1,
    active: true,
    isDemo: true,
    createdAt: now,
  });

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  batch.set(doc(collection(db, 'ads')), {
    title: '[DEMO] Private Atelier Preview',
    description: 'Sample Homepage Banner Advertisement controlled via Advertisement Management.',
    imageUrl: createDemoSvgDataUrl('PRIVATE ATELIER PREVIEW', 'DEMO HOMEPAGE AD'),
    targetUrl: '/products',
    placement: 'homepage_banner',
    enabled: true,
    startDate: now - 60_000,
    endDate: now + thirtyDays,
    priority: 10,
    isDemo: true,
    createdAt: now,
  });

  batch.set(doc(collection(db, 'ads')), {
    title: '[DEMO] Category Curated Spotlight',
    description: 'Sample Category Page Advertisement automatically hidden if disabled or expired.',
    imageUrl: createDemoSvgDataUrl('CATEGORY SPOTLIGHT', 'DEMO CATEGORY AD'),
    targetUrl: '/products',
    placement: 'category_page',
    enabled: true,
    startDate: now - 60_000,
    endDate: now + thirtyDays,
    priority: 10,
    isDemo: true,
    createdAt: now,
  });

  batch.set(doc(collection(db, 'ads')), {
    title: '[DEMO] Concierge Seasonal Notice',
    description: 'Sample Bottom-of-Page Advertisement slot.',
    imageUrl: createDemoSvgDataUrl('SEASONAL CONCIERGE', 'DEMO FOOTER AD'),
    targetUrl: '/contact',
    placement: 'bottom_page',
    enabled: true,
    startDate: now - 60_000,
    endDate: now + thirtyDays,
    priority: 10,
    isDemo: true,
    createdAt: now,
  });

  await batch.commit();
  invalidateCache();
  await recordAdminLog(admin, 'seed', 'demo-data', 'Seeded clearly labeled [DEMO] data');
}
