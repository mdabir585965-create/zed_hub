import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X, ChevronDown } from 'lucide-react';
import { Category, SiteSettings } from '../../shared/types';

interface NavbarProps {
  settings: SiteSettings;
  categories: Category[];
}

export default function Navbar({ settings, categories }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const rootCategories = categories.filter((c) => !c.parentId);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zed-gold/25 bg-zed-black/95 text-white backdrop-blur-md">
      {settings.announcementEnabled && settings.announcementText && (
        <Link
          to={settings.announcementLink || '/products'}
          className="block border-b border-zed-gold/20 bg-zed-charcoal px-4 py-2 text-center text-[11px] uppercase tracking-[0.25em] text-zed-gold-light transition hover:text-white"
        >
          {settings.announcementText}
        </Link>
      )}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zed-gold-light lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link to="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-[0.24em] text-white">
                {settings.siteName}
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-zed-gold">
                {settings.tagline}
              </span>
            </div>
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {settings.navigation.map((item) => (
            <Link
              key={item.path + item.label}
              to={item.path}
              className="text-xs uppercase tracking-[0.22em] text-neutral-200 transition hover:text-zed-gold"
            >
              {item.label}
            </Link>
          ))}

          {rootCategories.length > 0 && (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-neutral-200 transition hover:text-zed-gold"
              >
                <span>Categories</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="invisible absolute left-0 top-full w-64 border border-zed-gold/30 bg-zed-black p-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                {rootCategories.map((cat) => {
                  const subs = categories.filter((c) => c.parentId === cat.id);
                  return (
                    <div key={cat.id} className="py-1">
                      <Link
                        to={`/category/${cat.slug}`}
                        className="block px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zed-charcoal hover:text-zed-gold"
                      >
                        {cat.name}
                      </Link>
                      {subs.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          className="block py-1 pl-6 pr-3 text-[11px] text-neutral-400 transition hover:text-zed-gold-light"
                        >
                          — {sub.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search Products"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 border border-zed-gold/30 px-3.5 py-2 text-xs uppercase tracking-widest text-zed-gold-light transition hover:border-zed-gold hover:text-white"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-zed-gold/20 bg-zed-charcoal px-4 py-4">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search luxury products, SKU, or collections..."
              className="flex-1 border border-zed-gold/30 bg-zed-black px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-zed-gold focus:outline-none"
            />
            <button
              type="submit"
              className="bg-zed-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-zed-black transition hover:bg-zed-gold-light"
            >
              Find
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-zed-gold/20 bg-zed-black px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {settings.navigation.map((item) => (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-[0.22em] text-neutral-200 hover:text-zed-gold"
              >
                {item.label}
              </Link>
            ))}
            {rootCategories.length > 0 && (
              <div className="border-t border-zed-gold/20 pt-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-zed-gold">
                  Categories
                </p>
                {rootCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm text-neutral-300 hover:text-zed-gold"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
