import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderTree, Megaphone, ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAdminProducts } from '../../firebase/products';
import { getAllCategories } from '../../firebase/categories';
import { getAllBanners } from '../../firebase/banners';
import { getAllAds } from '../../firebase/ads';
import { getAdminLogs } from '../../firebase/logs';
import { seedClearlyLabeledDemoData } from '../../firebase/seedDemo';
import { useAdmin } from '../context/AdminContext';
import { AdminLog, Product } from '../../shared/types';
import { formatDateTime } from '../../shared/utils/format';
import { ErrorNotice } from '../../shared/components/StateViews';

export default function DashboardPage() {
  const admin = useAdmin();
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    categories: 0,
    banners: 0,
    activeAds: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setError(null);
    try {
      const [prods, cats, bans, ads, logs] = await Promise.all([
        getAdminProducts(100),
        getAllCategories(),
        getAllBanners(),
        getAllAds(),
        getAdminLogs(6),
      ]);
      const now = Date.now();
      setStats({
        totalProducts: prods.items.length,
        publishedProducts: prods.items.filter((p) => p.published).length,
        categories: cats.length,
        banners: bans.length,
        activeAds: ads.filter((a) => a.enabled && a.startDate <= now && a.endDate >= now).length,
      });
      setLowStock(prods.items.filter((p) => p.stock <= 5).slice(0, 5));
      setRecentLogs(logs.items);
    } catch {
      setError('Unable to load dashboard analytics. Verify Firestore permissions.');
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    setError(null);
    try {
      await seedClearlyLabeledDemoData(admin);
      setSeedSuccess(
        'Clearly labeled [DEMO] categories, products, banner, and scheduled ads created in Firestore.'
      );
      await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed demo data.');
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    {
      label: 'Published / Total Products',
      value: `${stats.publishedProducts} / ${stats.totalProducts}`,
      icon: Package,
      to: '/admin/products',
    },
    { label: 'Categories', value: stats.categories, icon: FolderTree, to: '/admin/categories' },
    { label: 'Active Banners', value: stats.banners, icon: ImageIcon, to: '/admin/banners' },
    { label: 'Live Scheduled Ads', value: stats.activeAds, icon: Megaphone, to: '/admin/ads' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zed-gold/25 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zed-gold-dark">Executive Overview</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">ZED Hub Studio</h1>
        </div>
        <button
          type="button"
          onClick={handleSeedDemo}
          disabled={seeding}
          className="inline-flex items-center gap-2 border border-zed-black bg-zed-black px-5 py-2.5 text-xs uppercase tracking-widest text-zed-gold transition hover:bg-zed-gold hover:text-zed-black disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{seeding ? 'Seeding Demo Data...' : 'Seed Clearly Labeled Demo Data'}</span>
        </button>
      </div>

      {error && <ErrorNotice message={error} onRetry={loadAnalytics} />}

      {seedSuccess && (
        <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{seedSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="border border-zed-gold/25 bg-white p-6 transition hover:border-zed-gold hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-500">{label}</span>
              <Icon className="h-5 w-5 text-zed-gold-dark" />
            </div>
            <p className="mt-4 font-serif text-3xl font-semibold text-zed-black">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="border border-zed-gold/25 bg-white p-6">
          <h2 className="font-serif text-2xl">Low Stock Attention</h2>
          <div className="mt-4 divide-y divide-neutral-100">
            {lowStock.length === 0 ? (
              <p className="py-4 text-sm text-neutral-500">All products have healthy stock levels.</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-neutral-400">SKU: {p.sku}</p>
                  </div>
                  <span className="bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-zed-gold/25 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent Activity Logs</h2>
            <Link to="/admin/logs" className="text-xs uppercase tracking-widest underline">
              View All
            </Link>
          </div>
          <div className="mt-4 divide-y divide-neutral-100">
            {recentLogs.length === 0 ? (
              <p className="py-4 text-sm text-neutral-500">No activity recorded yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zed-gold-dark">
                      {log.action} · {log.entity}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-neutral-700">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
