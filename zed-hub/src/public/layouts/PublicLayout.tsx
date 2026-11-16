import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdSlot from '../components/AdSlot';
import { DEFAULT_SETTINGS, getSiteSettings } from '../../firebase/settings';
import { getPublicCategories } from '../../firebase/categories';
import { Category, SiteSettings } from '../../shared/types';
import { useSEO } from '../../shared/hooks/useSEO';

export interface PublicContextValue {
  settings: SiteSettings;
  categories: Category[];
}

export default function PublicLayout() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getSiteSettings(), getPublicCategories()])
      .then(([s, c]) => {
        if (!active) return;
        setSettings(s);
        setCategories(c);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useSEO({
    title: settings.seo.defaultTitle,
    description: settings.seo.defaultDescription,
    keywords: settings.seo.keywords,
    ogImage: settings.seo.ogImageUrl,
    faviconUrl: settings.faviconUrl,
  });

  return (
    <div className="flex min-h-screen flex-col bg-zed-ivory text-zed-black">
      <Navbar settings={settings} categories={categories} />
      <main className="flex-1">
        <Outlet context={{ settings, categories } satisfies PublicContextValue} />
      </main>
      <AdSlot placement="bottom_page" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" />
      <Footer settings={settings} />
    </div>
  );
}
