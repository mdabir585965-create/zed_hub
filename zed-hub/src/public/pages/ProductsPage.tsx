import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { PublicContextValue } from '../layouts/PublicLayout';
import { getPublicProducts } from '../../firebase/products';
import { Product } from '../../shared/types';
import ProductCard from '../components/ProductCard';
import AdSlot from '../components/AdSlot';
import { EmptyState, ErrorNotice, ProductGridSkeleton } from '../../shared/components/StateViews';
import { useSEO } from '../../shared/hooks/useSEO';

type SortOption = 'latest' | 'price_asc' | 'price_desc' | 'name_asc';

export default function ProductsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, categories } = useOutletContext<PublicContextValue>();

  const initialQuery = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<unknown | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(initialFilter === 'featured');
  const [onlyTrending, setOnlyTrending] = useState(initialFilter === 'trending');

  const activeCategory = useMemo(
    () => (slug ? categories.find((c) => c.slug === slug) : undefined),
    [slug, categories]
  );

  const isSubcategory = Boolean(activeCategory?.parentId);

  useSEO({
    title: activeCategory
      ? `${activeCategory.name} | ${settings.siteName}`
      : `Collections | ${settings.siteName}`,
    description: activeCategory?.description || settings.seo.defaultDescription,
  });

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicProducts({
        categoryId: activeCategory && !isSubcategory ? activeCategory.id : undefined,
        subcategoryId: activeCategory && isSubcategory ? activeCategory.id : undefined,
        featured: onlyFeatured || undefined,
        trending: onlyTrending || undefined,
        pageSize: 12,
      });
      setProducts(res.items);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory?.id, onlyFeatured, onlyTrending]);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getPublicProducts({
        categoryId: activeCategory && !isSubcategory ? activeCategory.id : undefined,
        subcategoryId: activeCategory && isSubcategory ? activeCategory.id : undefined,
        featured: onlyFeatured || undefined,
        trending: onlyTrending || undefined,
        pageSize: 12,
        cursor: cursor as never,
      });
      setProducts((prev) => [...prev, ...res.items]);
      setCursor(res.lastDoc);
      setHasMore(res.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (onlyInStock && p.stock <= 0) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      return b.createdAt - a.createdAt;
    });
  }, [products, search, sortBy, onlyInStock]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-zed-gold/30 pb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-zed-gold-dark">
          {settings.siteName} Catalog
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
          {activeCategory ? activeCategory.name : 'All Collections'}
        </h1>
        {activeCategory?.description && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">{activeCategory.description}</p>
        )}
      </div>

      <AdSlot placement="category_page" className="my-8" />

      <div className="my-8 grid grid-cols-1 gap-4 border border-zed-gold/25 bg-white p-5 md:grid-cols-12">
        <div className="md:col-span-5">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setSearchParams({ q: e.target.value });
              else setSearchParams({});
            }}
            placeholder="Filter by name, description, or SKU..."
            className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:border-zed-gold focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 md:col-span-4">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <input
              type="checkbox"
              checked={onlyFeatured}
              onChange={(e) => setOnlyFeatured(e.target.checked)}
              className="accent-zed-black"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <input
              type="checkbox"
              checked={onlyTrending}
              onChange={(e) => setOnlyTrending(e.target.checked)}
              className="accent-zed-black"
            />
            Trending
          </label>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-zed-black"
            />
            In Stock
          </label>
        </div>

        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:border-zed-gold focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {error && <ErrorNotice message={error} onRetry={loadInitial} />}

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={settings.currencySymbol}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="border border-zed-black bg-zed-black px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-zed-gold hover:text-zed-black disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Pieces'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No Matching Pieces Found"
          description="Try clearing your search or filters to browse the full catalog."
        />
      )}
    </div>
  );
}
