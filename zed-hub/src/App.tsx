import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './public/layouts/PublicLayout';
import HomePage from './public/pages/HomePage';
import ProductsPage from './public/pages/ProductsPage';
import ProductDetailPage from './public/pages/ProductDetailPage';
import ContactPage from './public/pages/ContactPage';
import { LoadingScreen } from './shared/components/StateViews';

const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminGuard = lazy(() => import('./admin/components/AdminGuard'));
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./admin/pages/AdminCategoriesPage'));
const AdminBannersPage = lazy(() => import('./admin/pages/AdminBannersPage'));
const AdminAdsPage = lazy(() => import('./admin/pages/AdminAdsPage'));
const AdminSettingsPage = lazy(() => import('./admin/pages/AdminSettingsPage'));
const AdminLogsPage = lazy(() => import('./admin/pages/AdminLogsPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading ZED Hub..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:slug" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="ads" element={<AdminAdsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
