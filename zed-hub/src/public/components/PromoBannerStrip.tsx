import { Link } from 'react-router-dom';
import { Banner } from '../../shared/types';
import OptimizedImage from '../../shared/components/OptimizedImage';

export default function PromoBannerStrip({ banners }: { banners: Banner[] }) {
  const promos = banners.filter((b) => b.placement === 'promo');
  if (promos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {promos.map((banner) => (
          <Link
            key={banner.id}
            to={banner.ctaLink || '/products'}
            className="group relative overflow-hidden border border-zed-gold/30 bg-zed-black text-white"
          >
            <OptimizedImage
              src={banner.imageUrl}
              alt={banner.title}
              aspectClass="aspect-[16/9] w-full"
              className="opacity-70 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-zed-black/90 via-zed-black/40 to-transparent p-7">
              <h3 className="font-serif text-2xl text-white">{banner.title}</h3>
              <p className="mt-1 text-sm text-neutral-300">{banner.subtitle}</p>
              <span className="mt-3 text-xs uppercase tracking-[0.25em] text-zed-gold">
                {banner.ctaLabel || 'Explore'} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
