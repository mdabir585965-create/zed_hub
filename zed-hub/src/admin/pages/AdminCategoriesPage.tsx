import { FormEvent, useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Upload } from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '../../firebase/categories';
import { uploadImage } from '../../firebase/storage';
import { useAdmin } from '../context/AdminContext';
import { Category } from '../../shared/types';
import { slugify } from '../../shared/utils/format';

export default function AdminCategoriesPage() {
  const admin = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState('1');
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setCategories(await getAllCategories());
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setImageUrl('');
    setOrder('1');
    setActive(true);
  };

  const handleEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setParentId(c.parentId || '');
    setImageUrl(c.imageUrl || '');
    setOrder(String(c.order));
    setActive(c.active);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'banners', true);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() ? slugify(slug) : slugify(name),
      description: description.trim(),
      parentId: parentId || null,
      imageUrl,
      order: Number(order) || 1,
      active,
    };
    try {
      if (editingId) await updateCategory(editingId, payload, admin);
      else await createCategory(payload, admin);
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    await deleteCategory(c.id, c.name, admin);
    await load();
  };

  const rootCategories = categories.filter((c) => !c.parentId && c.id !== editingId);

  return (
    <div className="space-y-8">
      <div className="border-b border-zed-gold/25 pb-5">
        <h1 className="font-serif text-3xl">Categories & Subcategories</h1>
        <p className="text-xs text-neutral-500">Organize catalog departments and nested hierarchies.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-zed-gold/25 bg-white p-6 lg:col-span-5"
        >
          <h2 className="font-serif text-xl">{editingId ? 'Edit Category' : 'Add Category'}</h2>
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-600">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
              }}
              className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-600">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-600">
              Parent Category (Optional for Subcategory)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">None (Top-Level Category)</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-600">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-neutral-600">Display Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-xs uppercase tracking-wider">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Active
            </label>
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-zed-gold px-4 py-2 text-xs uppercase tracking-wider">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <img src={imageUrl} alt="Category" className="mt-3 h-24 w-40 object-cover border" />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 bg-zed-black px-5 py-2.5 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black"
            >
              <Plus className="h-4 w-4" />
              <span>{editingId ? 'Update' : 'Create'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-neutral-300 px-4 py-2.5 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="border border-zed-gold/25 bg-white lg:col-span-7">
          <div className="divide-y divide-neutral-100">
            {categories.map((c) => {
              const parent = categories.find((p) => p.id === c.parentId);
              return (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      {parent ? `${parent.name} → ` : ''}
                      {c.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      /{c.slug} · Order {c.order} · {c.active ? 'Active' : 'Hidden'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="border border-neutral-200 p-2 hover:border-zed-gold"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="border border-neutral-200 p-2 text-red-700 hover:border-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="p-8 text-center text-sm text-neutral-500">No categories yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
