import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Banner, SiteSettings } from '../../shared/types';
import OptimizedImage from '../../shared/components/OptimizedImage';
import DemoNoticeBanner from '../../shared/components/DemoNoticeBanner';
import { createDemoSvgDataUrl } from '../../shared/utils/format';

interface HeroSectionProps {
  banners: Banner[];
  settings: SiteSettings;
}

export default function HeroSection({ banners, settings }: HeroSectionProps) {
  const heroBanners = banners.filter((b) => b.placement === 'hero');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const active = heroBanners[index];
  const title = active?.title || settings.heroFallbackTitle;
  const subtitle = active?.subtitle || settings.heroFallbackSubtitle;
  const ctaLabel = active?.ctaLabel || 'Explore Collections';
  const ctaLink = active?.ctaLink || '/products';
  const imageUrl =
    active?.imageUrl || createDemoSvgDataUrl(settings.siteName, 'LUXURY SHOWCASE');

  return (
    <section className="relative overflow-hidden bg-zed-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
        <div className="animate-fade-up space-y-6 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.35em] text-zed-gold">
              {settings.siteName} Editorial
            </span>
            {active?.isDemo && <DemoNoticeBanner />}
          </div>
          <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-wide text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-neutral-300">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={ctaLink}
              className="group inline-flex items-center gap-3 bg-zed-gold px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.24em] text-zed-black transition hover:bg-zed-gold-light"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="border border-zed-gold/40 px-7 py-3.5 text-xs uppercase tracking-[0.24em] text-zed-gold-light transition hover:border-zed-gold hover:text-white"
            >
              Private Concierge
            </Link>
          </div>

          {heroBanners.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {heroBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setIndex(idx)}
                  className={`h-1.5 transition-all ${
                    idx === index ? 'w-8 bg-zed-gold' : 'w-3 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6">
          <div className="relative border border-zed-gold/30 p-2">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              priority
              aspectClass="aspect-[4/3] w-full"
              className="transition-transform duration-1000 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
