import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { AdPlacement, Advertisement } from '../../shared/types';
import { getActiveAdsForPlacement } from '../../firebase/ads';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { isSafeUrl } from '../../shared/utils/validation';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    let active = true;
    getActiveAdsForPlacement(placement)
      .then((res) => {
        if (active) setAds(res);
      })
      .catch(() => {
        if (active) setAds([]);
      });
    return () => {
      active = false;
    };
  }, [placement]);

  if (ads.length === 0) return null;

  const ad = ads[0];
  const isInternal = ad.targetUrl.startsWith('/');
  const safeHref = isSafeUrl(ad.targetUrl) ? ad.targetUrl : '/products';

  const content = (
    <div className="group relative overflow-hidden border border-zed-gold/30 bg-zed-black text-white shadow-lg">
      <div className="grid grid-cols-1 items-center md:grid-cols-12">
        <div className="md:col-span-5">
          <OptimizedImage
            src={ad.imageUrl}
            alt={ad.title}
            aspectClass="aspect-[16/9] w-full"
            className="group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-6 md:col-span-7 md:p-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zed-gold">
              Sponsored Spotlight
            </span>
            {ad.isDemo && (
              <span className="border border-zed-gold/40 px-2 py-0.5 text-[9px] uppercase tracking-widest text-zed-gold-light">
                Demo Ad
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">{ad.title}</h3>
          {ad.description && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">{ad.description}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zed-gold transition group-hover:text-zed-gold-light">
            <span>Discover More</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <aside className={className} aria-label="Advertisement">
      {isInternal ? (
        <Link to={safeHref}>{content}</Link>
      ) : (
        <a href={safeHref} target="_blank" rel="noopener noreferrer sponsored">
          {content}
        </a>
      )}
    </aside>
  );
}
