import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  Megaphone,
  Settings,
  ClipboardList,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { logoutAdmin } from '../../firebase/auth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { to: '/admin/settings', label: 'Site & SEO Settings', icon: Settings },
  { to: '/admin/logs', label: 'Activity Logs', icon: ClipboardList },
];

export default function AdminLayout() {
  const admin = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-zed-ivory text-zed-black">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zed-gold/25 bg-zed-black text-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-zed-gold/20 px-6">
          <div>
            <p className="font-serif text-xl tracking-[0.2em]">ZED HUB</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-zed-gold">Admin Studio</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-neutral-400 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.18em] transition ${
                  isActive
                    ? 'bg-zed-gold font-semibold text-zed-black'
                    : 'text-neutral-300 hover:bg-zed-charcoal hover:text-zed-gold-light'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zed-gold/20 p-4 space-y-3">
          <div className="px-2">
            <p className="truncate text-xs font-medium text-white">{admin.displayName}</p>
            <p className="truncate text-[11px] text-neutral-400">{admin.email}</p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 border border-zed-gold/30 py-2 text-[11px] uppercase tracking-widest text-zed-gold-light hover:border-zed-gold"
          >
            <span>View Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 bg-white/10 py-2 text-[11px] uppercase tracking-widest text-white hover:bg-red-900/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-zed-gold/20 bg-white px-4 sm:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zed-black"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif text-lg tracking-widest">ZED HUB ADMIN</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
