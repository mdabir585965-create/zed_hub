import { Link } from 'react-router-dom';
import { Product } from '../../shared/types';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { formatCurrency } from '../../shared/utils/format';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
}

export default function ProductCard({ product, currencySymbol = '$' }: ProductCardProps) {
  const hasDiscount =
    typeof product.discountPrice === 'number' &&
    product.discountPrice >= 0 &&
    product.discountPrice < product.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col border border-zed-gold/20 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zed-gold hover:shadow-xl"
    >
      <div className="relative overflow-hidden">
        <OptimizedImage
          src={product.images?.[0] || ''}
          alt={product.title}
          aspectClass="aspect-[3/4] w-full"
          className="group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isDemo && (
            <span className="bg-zed-black/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zed-gold">
              DEMO
            </span>
          )}
          {hasDiscount && (
            <span className="bg-zed-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zed-black">
              Privilege Price
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-neutral-900/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">
              Sold Out
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            SKU · {product.sku}
          </p>
          <h3 className="mt-1.5 line-clamp-2 font-serif text-xl text-zed-black transition group-hover:text-zed-gold-dark">
            {product.title}
          </h3>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5 border-t border-zed-cream pt-3">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-zed-black">
                {formatCurrency(product.discountPrice!, currencySymbol)}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(product.price, currencySymbol)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-zed-black">
              {formatCurrency(product.price, currencySymbol)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
