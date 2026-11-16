export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin';
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  imageUrl?: string;
  order: number;
  active: boolean;
  isDemo?: boolean;
  createdAt: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  stock: number;
  categoryId: string;
  subcategoryId?: string | null;
  images: string[];
  featured: boolean;
  trending: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  isDemo?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string;
  placement: 'hero' | 'promo';
  order: number;
  active: boolean;
  isDemo?: boolean;
  createdAt: number;
}

export type AdPlacement = 'homepage_banner' | 'category_page' | 'bottom_page';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  enabled: boolean;
  startDate: number;
  endDate: number;
  priority: number;
  isDemo?: boolean;
  createdAt: number;
}

export interface NavLinkItem {
  label: string;
  path: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  heroFallbackTitle: string;
  heroFallbackSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  currencySymbol: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  navigation: NavLinkItem[];
  footerAbout: string;
  footerLinks: NavLinkItem[];
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
    ogImageUrl: string;
  };
  updatedAt: number;
}

export interface AdminLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'seed';
  entity: string;
  details: string;
  createdAt: number;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: unknown | null;
  hasMore: boolean;
}
