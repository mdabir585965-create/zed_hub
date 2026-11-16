import { FormEvent, useEffect, useState } from 'react';
import { Trash2, Edit3, Upload } from 'lucide-react';
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from '../../firebase/banners';
import { uploadImage } from '../../firebase/storage';
import { useAdmin } from '../context/AdminContext';
import { Banner } from '../../shared/types';

export default function AdminBannersPage() {
  const admin = useAdmin();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Explore Collections');
  const [ctaLink, setCtaLink] = useState('/products');
  const [imageUrl, setImageUrl] = useState('');
  const [placement, setPlacement] = useState<'hero' | 'promo'>('hero');
  const [order, setOrder] = useState('1');
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => setBanners(await getAllBanners());

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setCtaLabel('Explore Collections');
    setCtaLink('/products');
    setImageUrl('');
    setPlacement('hero');
    setOrder('1');
    setActive(true);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file, 'banners', true));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaLabel: ctaLabel.trim(),
      ctaLink: ctaLink.trim() || '/products',
      imageUrl,
      placement,
      order: Number(order) || 1,
      active,
    };
    if (editingId) await updateBanner(editingId, payload, admin);
    else await createBanner(payload, admin);
    reset();
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-zed-gold/25 pb-5">
        <h1 className="font-serif text-3xl">Homepage & Promotional Banners</h1>
        <p className="text-xs text-neutral-500">Control animated hero slides and editorial promo strips.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-zed-gold/25 bg-white p-6 lg:col-span-5"
        >
          <h2 className="font-serif text-xl">{editingId ? 'Edit Banner' : 'New Banner'}</h2>
          <input
            type="text"
            required
            placeholder="Banner Headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            rows={2}
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="CTA Button Label"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="CTA Link (/products)"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as 'hero' | 'promo')}
              className="border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="hero">Hero Carousel</option>
              <option value="promo">Promotional Strip</option>
            </select>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="Order"
              className="border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active on Homepage
          </label>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-zed-gold px-4 py-2 text-xs uppercase tracking-wider">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Banner Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <img src={imageUrl} alt="Banner Preview" className="mt-3 h-28 w-full object-cover border" />
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-zed-black px-6 py-2.5 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black"
            >
              {editingId ? 'Save Banner' : 'Create Banner'}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="border px-4 py-2 text-xs uppercase">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4 lg:col-span-7">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 border border-zed-gold/25 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <img src={b.imageUrl} alt={b.title} className="h-20 w-32 object-cover border bg-zed-cream" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zed-gold-dark">
                    {b.placement} · Order {b.order} · {b.active ? 'Active' : 'Inactive'}
                  </span>
                  <h3 className="font-serif text-xl">{b.title}</h3>
                  <p className="text-xs text-neutral-500">{b.ctaLink}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(b.id);
                    setTitle(b.title);
                    setSubtitle(b.subtitle);
                    setCtaLabel(b.ctaLabel);
                    setCtaLink(b.ctaLink);
                    setImageUrl(b.imageUrl);
                    setPlacement(b.placement);
                    setOrder(String(b.order));
                    setActive(b.active);
                  }}
                  className="border p-2 hover:border-zed-gold"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
                    await deleteBanner(b.id, b.title, admin);
                    await load();
                  }}
                  className="border p-2 text-red-700 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
