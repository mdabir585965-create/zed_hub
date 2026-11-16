import { FormEvent, useEffect, useState } from 'react';
import { Edit3, Trash2, Upload, Power } from 'lucide-react';
import { createAd, deleteAd, getAllAds, updateAd } from '../../firebase/ads';
import { uploadImage } from '../../firebase/storage';
import { useAdmin } from '../context/AdminContext';
import { AdPlacement, Advertisement } from '../../shared/types';
import { formatDateTime, toDateTimeInputValue } from '../../shared/utils/format';
import { validateAdInput } from '../../shared/utils/validation';

export default function AdminAdsPage() {
  const admin = useAdmin();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('/products');
  const [placement, setPlacement] = useState<AdPlacement>('homepage_banner');
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState('10');
  const [startStr, setStartStr] = useState(toDateTimeInputValue(Date.now()));
  const [endStr, setEndStr] = useState(
    toDateTimeInputValue(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => setAds(await getAllAds());

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTargetUrl('/products');
    setPlacement('homepage_banner');
    setEnabled(true);
    setPriority('10');
    setStartStr(toDateTimeInputValue(Date.now()));
    setEndStr(toDateTimeInputValue(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setError(null);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setImageUrl(await uploadImage(file, 'ads', true));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ad image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const startDate = new Date(startStr).getTime();
    const endDate = new Date(endStr).getTime();

    const err = validateAdInput({
      title,
      targetUrl,
      imageUrl,
      startDate,
      endDate,
    });
    if (err) {
      setError(err);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      targetUrl: targetUrl.trim(),
      placement,
      enabled,
      priority: Number(priority) || 1,
      startDate,
      endDate,
    };

    if (editingId) await updateAd(editingId, payload, admin);
    else await createAd(payload, admin);
    reset();
    await load();
  };

  const getStatusBadge = (ad: Advertisement) => {
    const now = Date.now();
    if (!ad.enabled) return { label: 'Disabled', cls: 'bg-neutral-200 text-neutral-700' };
    if (now < ad.startDate) return { label: 'Scheduled', cls: 'bg-blue-100 text-blue-800' };
    if (now > ad.endDate) return { label: 'Expired (Auto-Hidden)', cls: 'bg-red-100 text-red-800' };
    return { label: 'Live Now', cls: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-zed-gold/25 pb-5">
        <h1 className="font-serif text-3xl">Advertisement Management</h1>
        <p className="text-xs text-neutral-500">
          Schedule placement ads. Expired or disabled ads are automatically hidden with zero empty placeholders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-zed-gold/25 bg-white p-6 lg:col-span-5"
        >
          <h2 className="font-serif text-xl">
            {editingId ? 'Edit Advertisement' : 'Create Advertisement'}
          </h2>
          {error && <p className="border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}

          <input
            type="text"
            required
            placeholder="Advertisement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            rows={2}
            placeholder="Advertisement Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Target URL (https://... or /products)"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500">Placement</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="homepage_banner">Homepage Banner Ad</option>
                <option value="category_page">Category Page Ad</option>
                <option value="bottom_page">Bottom-of-Page Ad</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500">
                Display Priority
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500">Start Date</label>
              <input
                type="datetime-local"
                required
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="mt-1 w-full border border-neutral-300 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-500">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                required
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="mt-1 w-full border border-neutral-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Advertisement Enabled
          </label>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-zed-gold px-4 py-2 text-xs uppercase tracking-wider">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Ad Creative'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <img src={imageUrl} alt="Ad Preview" className="mt-3 h-28 w-full object-cover border" />
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-zed-black px-6 py-2.5 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black"
            >
              {editingId ? 'Save Advertisement' : 'Publish Advertisement'}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="border px-4 py-2 text-xs uppercase">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4 lg:col-span-7">
          {ads.map((ad) => {
            const status = getStatusBadge(ad);
            return (
              <div
                key={ad.id}
                className="flex flex-col gap-4 border border-zed-gold/25 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-20 w-32 border object-cover bg-zed-cream"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                        {ad.placement.replace('_', ' ')} · Priority {ad.priority}
                      </span>
                    </div>
                    <h3 className="mt-1 font-serif text-xl">{ad.title}</h3>
                    <p className="text-[11px] text-neutral-500">
                      {formatDateTime(ad.startDate)} → {formatDateTime(ad.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    title={ad.enabled ? 'Disable' : 'Enable'}
                    onClick={async () => {
                      await updateAd(ad.id, { enabled: !ad.enabled, title: ad.title }, admin);
                      await load();
                    }}
                    className="border p-2 hover:border-zed-gold"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(ad.id);
                      setTitle(ad.title);
                      setDescription(ad.description);
                      setImageUrl(ad.imageUrl);
                      setTargetUrl(ad.targetUrl);
                      setPlacement(ad.placement);
                      setEnabled(ad.enabled);
                      setPriority(String(ad.priority));
                      setStartStr(toDateTimeInputValue(ad.startDate));
                      setEndStr(toDateTimeInputValue(ad.endDate));
                    }}
                    className="border p-2 hover:border-zed-gold"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Delete advertisement "${ad.title}"?`)) return;
                      await deleteAd(ad.id, ad.title, admin);
                      await load();
                    }}
                    className="border p-2 text-red-700 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {ads.length === 0 && (
            <div className="border border-zed-gold/25 bg-white p-8 text-center text-sm text-neutral-500">
              No advertisements created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
