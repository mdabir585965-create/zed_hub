import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  toggleProductPublish,
  updateProduct,
} from '../../firebase/products';
import { getAllCategories } from '../../firebase/categories';
import { deleteStorageFileByUrl, uploadImage } from '../../firebase/storage';
import { useAdmin } from '../context/AdminContext';
import { Category, Product } from '../../shared/types';
import { slugify, formatCurrency } from '../../shared/utils/format';
import { validateProductInput } from '../../shared/utils/validation';

interface ProductFormState {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  sku: string;
  stock: string;
  categoryId: string;
  subcategoryId: string;
  images: string[];
  featured: boolean;
  trending: boolean;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_FORM: ProductFormState = {
  title: '',
  slug: '',
  description: '',
  price: '',
  discountPrice: '',
  sku: '',
  stock: '10',
  categoryId: '',
  subcategoryId: '',
  images: [],
  featured: false,
  trending: false,
  published: false,
  seoTitle: '',
  seoDescription: '',
};

export default function AdminProductsPage() {
  const admin = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cursor, setCursor] = useState<unknown | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [prodRes, cats] = await Promise.all([getAdminProducts(20), getAllCategories()]);
      setProducts(prodRes.items);
      setCursor(prodRes.lastDoc);
      setHasMore(prodRes.hasMore);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const loadMore = async () => {
    if (!cursor) return;
    const res = await getAdminProducts(20, cursor as never);
    setProducts((prev) => [...prev, ...res.items]);
    setCursor(res.lastDoc);
    setHasMore(res.hasMore);
  };

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      categoryId: categories.find((c) => !c.parentId)?.id || '',
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      discountPrice: p.discountPrice !== null && p.discountPrice !== undefined ? String(p.discountPrice) : '',
      sku: p.sku,
      stock: String(p.stock),
      categoryId: p.categoryId,
      subcategoryId: p.subcategoryId || '',
      images: p.images || [],
      featured: p.featured,
      trending: p.trending,
      published: p.published,
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setFeedback(null);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadImage(file, 'products', true))
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Image upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
    await deleteStorageFileByUrl(url);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const discountPrice = form.discountPrice.trim() ? Number(form.discountPrice) : null;
    const stock = Number(form.stock);

    const validationError = validateProductInput({
      title: form.title,
      price,
      discountPrice,
      stock,
      sku: form.sku,
      categoryId: form.categoryId,
    });
    if (validationError) {
      setFeedback({ type: 'error', msg: validationError });
      return;
    }

    setSaving(true);
    setFeedback(null);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() ? slugify(form.slug) : slugify(form.title),
      description: form.description.trim(),
      price,
      discountPrice,
      sku: form.sku.trim().toUpperCase(),
      stock,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      images: form.images,
      featured: form.featured,
      trending: form.trending,
      published: form.published,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
    };

    try {
      if (form.id) {
        await updateProduct(form.id, payload, admin);
      } else {
        await createProduct(payload, admin);
      }
      setModalOpen(false);
      await loadInitial();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save product.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (p: Product) => {
    await toggleProductPublish(p.id, !p.published, p.title, admin);
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, published: !p.published } : item))
    );
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.title}" permanently?`)) return;
    await deleteProduct(p.id, p.title, admin);
    setProducts((prev) => prev.filter((item) => item.id !== p.id));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === 'published' && !p.published) return false;
      if (statusFilter === 'draft' && p.published) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, search, statusFilter, categoryFilter]);

  const rootCategories = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter((c) => c.parentId === form.categoryId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zed-gold/25 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl">Products Catalog</h1>
          <p className="text-xs text-neutral-500">Create, edit, publish, and manage multi-image inventory.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-zed-black px-5 py-2.5 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 border border-zed-gold/20 bg-white p-4 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or SKU..."
          className="border border-neutral-300 px-3 py-2 text-sm focus:border-zed-gold focus:outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {rootCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Unpublished / Drafts</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-zed-gold/25 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zed-gold/20 bg-zed-cream text-[11px] uppercase tracking-widest text-neutral-600">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-zed-ivory/60">
                  <td className="flex items-center gap-3 p-4">
                    <img
                      src={p.images?.[0] || ''}
                      alt={p.title}
                      className="h-12 w-12 border border-neutral-200 object-cover bg-zed-cream"
                    />
                    <div>
                      <p className="font-medium text-zed-black">{p.title}</p>
                      <p className="text-xs text-neutral-400">/{p.slug}</p>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono">{p.sku}</td>
                  <td className="p-4">
                    {p.discountPrice ? (
                      <span>
                        <strong>{formatCurrency(p.discountPrice)}</strong>{' '}
                        <span className="text-xs text-neutral-400 line-through">
                          {formatCurrency(p.price)}
                        </span>
                      </span>
                    ) : (
                      formatCurrency(p.price)
                    )}
                  </td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                        p.published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {p.published ? 'Published' : 'Unpublished'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        title={p.published ? 'Unpublish' : 'Publish'}
                        onClick={() => handleTogglePublish(p)}
                        className="border border-neutral-200 p-2 hover:border-zed-gold"
                      >
                        {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => openEdit(p)}
                        className="border border-neutral-200 p-2 hover:border-zed-gold"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(p)}
                        className="border border-neutral-200 p-2 text-red-700 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            className="border border-zed-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-zed-black hover:text-white"
          >
            Load More Products
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-zed-gold/40 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <h2 className="font-serif text-2xl">
                {form.id ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mt-4 p-3 text-xs ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.id ? prev.slug : slugify(e.target.value),
                      }))
                    }
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">Slug *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-neutral-600">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountPrice}
                    onChange={(e) => setForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">SKU *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">
                    Category *
                  </label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, categoryId: e.target.value, subcategoryId: '' }))
                    }
                    className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {rootCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">
                    Subcategory
                  </label>
                  <select
                    value={form.subcategoryId}
                    onChange={(e) => setForm((prev) => ({ ...prev, subcategoryId: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-neutral-600">
                  Product Images (Auto-optimized to WebP)
                </label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {form.images.map((url) => (
                    <div key={url} className="relative h-24 w-24 border border-neutral-200">
                      <img src={url} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-24 w-28 cursor-pointer flex-col items-center justify-center border border-dashed border-zed-gold bg-zed-ivory text-xs text-neutral-600 hover:bg-zed-cream">
                    <Upload className="mb-1 h-4 w-4 text-zed-gold-dark" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 border-y border-neutral-200 py-3">
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                  />
                  Published on Storefront
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(e) => setForm((prev) => ({ ...prev, trending: e.target.checked }))}
                  />
                  Trending
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">SEO Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-neutral-600">
                    SEO Description
                  </label>
                  <input
                    type="text"
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                    }
                    className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-neutral-300 px-5 py-2.5 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-zed-black px-6 py-2.5 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
