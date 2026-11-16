import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { PublicContextValue } from '../layouts/PublicLayout';
import { getProductBySlug } from '../../firebase/products';
import { Product } from '../../shared/types';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { EmptyState, ErrorNotice, LoadingScreen } from '../../shared/components/StateViews';
import { formatCurrency } from '../../shared/utils/format';
import { useSEO } from '../../shared/hooks/useSEO';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings, categories } = useOutletContext<PublicContextValue>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);
    getProductBySlug(slug)
      .then((res) => {
        if (!active) return;
        setProduct(res);
        setSelectedImage(0);
      })
      .catch(() => {
        if (active) setError('Unable to load product details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useSEO({
    title: product
      ? `${product.seoTitle || product.title} | ${settings.siteName}`
      : settings.seo.defaultTitle,
    description: product?.seoDescription || product?.description || settings.seo.defaultDescription,
    ogImage: product?.images?.[0] || settings.seo.ogImageUrl,
  });

  if (loading) return <LoadingScreen label="Loading Product Details..." />;
  if (error) return <ErrorNotice message={error} />;
  if (!product) {
    return (
      <EmptyState
        title="Piece Not Available"
        description="This item may have been unpublished or moved."
        action={
          <Link
            to="/products"
            className="inline-block bg-zed-black px-6 py-3 text-xs uppercase tracking-widest text-white"
          >
            Return to Collections
          </Link>
        }
      />
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const hasDiscount =
    typeof product.discountPrice === 'number' &&
    product.discountPrice >= 0 &&
    product.discountPrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-neutral-600 transition hover:text-zed-black"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Collections</span>
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="border border-zed-gold/30 bg-white p-2">
            <OptimizedImage
              src={product.images[selectedImage] || product.images[0] || ''}
              alt={product.title}
              priority
              aspectClass="aspect-[4/3] w-full"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`border p-1 transition ${
                    idx === selectedImage
                      ? 'border-zed-gold ring-1 ring-zed-gold'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <OptimizedImage src={img} alt={`${product.title} ${idx + 1}`} aspectClass="aspect-square" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="text-[11px] uppercase tracking-[0.28em] text-zed-gold-dark hover:underline"
                >
                  {category.name}
                </Link>
              )}
              {product.isDemo && (
                <span className="bg-zed-black px-2 py-0.5 text-[10px] uppercase tracking-widest text-zed-gold">
                  Clearly Labeled Demo
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-4xl leading-tight text-zed-black">
              {product.title}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-neutral-400">
              SKU: {product.sku}
            </p>

            <div className="mt-6 flex items-baseline gap-4 border-y border-zed-gold/25 py-5">
              {hasDiscount ? (
                <>
                  <span className="font-serif text-3xl font-semibold text-zed-black">
                    {formatCurrency(product.discountPrice!, settings.currencySymbol)}
                  </span>
                  <span className="text-lg text-neutral-400 line-through">
                    {formatCurrency(product.price, settings.currencySymbol)}
                  </span>
                </>
              ) : (
                <span className="font-serif text-3xl font-semibold text-zed-black">
                  {formatCurrency(product.price, settings.currencySymbol)}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {product.description}
              </p>

              <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
                <CheckCircle2
                  className={`h-4 w-4 ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}
                />
                <span>
                  {product.stock > 0 ? `Available (${product.stock} in stock)` : 'Currently Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 border border-zed-gold/30 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zed-gold-dark">
              Private Acquisition Inquiry
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Contact the ZED Hub concierge team regarding availability, bespoke presentation, or private viewing.
            </p>
            <a
              href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(
                `Inquiry: ${product.title} (${product.sku})`
              )}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-zed-black px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-zed-gold hover:text-zed-black"
            >
              <Mail className="h-4 w-4" />
              <span>Inquire with Concierge</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
