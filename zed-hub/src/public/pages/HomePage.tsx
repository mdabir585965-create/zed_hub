import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { PublicContextValue } from '../layouts/PublicLayout';
import HeroSection from '../components/HeroSection';
import PromoBannerStrip from '../components/PromoBannerStrip';
import ProductCard from '../components/ProductCard';
import AdSlot from '../components/AdSlot';
import { getPublicBanners } from '../../firebase/banners';
import { getPublicProducts } from '../../firebase/products';
import { Banner, Product } from '../../shared/types';
import { EmptyState, ErrorNotice, ProductGridSkeleton } from '../../shared/components/StateViews';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { isFirebaseConfigured } from '../../firebase/config';

export default function HomePage() {
  const { settings, categories } = useOutletContext<PublicContextValue>();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [b, feat, trend, lat] = await Promise.all([
        getPublicBanners(),
        getPublicProducts({ featured: true, pageSize: 4 }),
        getPublicProducts({ trending: true, pageSize: 4 }),
        getPublicProducts({ pageSize: 8 }),
      ]);
      setBanners(b);
      setFeatured(feat.items);
      setTrending(trend.items);
      setLatest(lat.items);
    } catch {
      setError('Unable to load storefront catalog right now. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <HeroSection banners={banners} settings={settings} />

      {!isFirebaseConfigured && (
        <div className="mx-auto mt-8 max-w-4xl border border-zed-gold bg-white p-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-zed-gold-dark">
            Firebase Setup Required
          </p>
          <p className="mt-2 text-sm text-neutral-700">
            Configure your <code className="bg-zed-cream px-1.5 py-0.5">.env</code> file with
            Firebase credentials, then sign in at <Link to="/admin" className="underline">/admin</Link>{' '}
            to publish products, banners, and advertisements.
          </p>
        </div>
      )}

      {rootCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zed-gold-dark">Curated</p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Departments</h2>
            </div>
            <Link
              to="/products"
              className="text-xs uppercase tracking-[0.22em] text-zed-black underline underline-offset-4 hover:text-zed-gold-dark"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rootCategories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden border border-zed-gold/25 bg-zed-black text-white"
              >
                <OptimizedImage
                  src={cat.imageUrl || ''}
                  alt={cat.name}
                  aspectClass="aspect-[16/10] w-full"
                  className="opacity-75 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-zed-black/90 via-zed-black/30 to-transparent p-6">
                  <h3 className="font-serif text-2xl text-white">{cat.name}</h3>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.25em] text-zed-gold">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdSlot
        placement="homepage_banner"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      />

      <PromoBannerStrip banners={banners} />

      {error && <ErrorNotice message={error} onRetry={loadData} />}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zed-gold-dark">Signature</p>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Featured Pieces</h2>
          </div>
          <Link to="/products?filter=featured" className="text-xs uppercase tracking-[0.22em] underline">
            See All
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} currencySymbol={settings.currencySymbol} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Published Featured Products Yet"
            description="Publish featured items or seed clearly labeled demo items from the Admin Dashboard."
          />
        )}
      </section>

      {trending.length > 0 && (
        <section className="border-y border-zed-gold/20 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zed-gold-dark">In Demand</p>
                <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Trending Now</h2>
              </div>
              <Link to="/products?filter=trending" className="text-xs uppercase tracking-[0.22em] underline">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trending.map((p) => (
                <ProductCard key={p.id} product={p} currencySymbol={settings.currencySymbol} />
              ))}
            </div>
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zed-gold-dark">New Season</p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Latest Arrivals</h2>
            </div>
            <Link to="/products" className="text-xs uppercase tracking-[0.22em] underline">
              Browse Catalog
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} currencySymbol={settings.currencySymbol} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
