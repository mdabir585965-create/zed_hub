import { useState } from 'react';
import { createDemoSvgDataUrl } from '../utils/format';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectClass?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  aspectClass = '',
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const fallback = createDemoSvgDataUrl(alt || 'ZED HUB', 'IMAGE UNAVAILABLE');
  const finalSrc = errored || !src ? fallback : src;

  return (
    <div className={`relative overflow-hidden bg-zed-cream ${aspectClass}`}>
      {!loaded && <div className="luxury-shimmer absolute inset-0" />}
      <img
        src={finalSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
