import { FormEvent, useEffect, useState } from 'react';
import { Upload, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_SETTINGS, getSiteSettings, updateSiteSettings } from '../../firebase/settings';
import { uploadImage } from '../../firebase/storage';
import { useAdmin } from '../context/AdminContext';
import { SiteSettings } from '../../shared/types';

export default function AdminSettingsPage() {
  const admin = useAdmin();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setForm);
  }, []);

  const handleBrandUpload = async (
    file: File | undefined,
    field: 'logoUrl' | 'faviconUrl'
  ) => {
    if (!file) return;
    const url = await uploadImage(file, 'branding', false);
    setForm((prev) => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteSettings(form, admin);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zed-gold/25 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl">Global Brand, Navigation & SEO</h1>
          <p className="text-xs text-neutral-500">
            Dynamically control public branding, announcements, links, contact details, and metadata.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-zed-black px-6 py-3 text-xs uppercase tracking-widest text-zed-gold hover:bg-zed-gold hover:text-zed-black"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5" />
          <span>Settings updated and published live to ZED Hub.</span>
        </div>
      )}

      <section className="space-y-4 border border-zed-gold/25 bg-white p-6">
        <h2 className="font-serif text-2xl">Brand Identity & Logo</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="text"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            placeholder="Site Name"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Tagline"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.currencySymbol}
            onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
            placeholder="Currency ($)"
            className="border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-zed-gold px-4 py-2 text-xs uppercase">
              <Upload className="h-4 w-4" />
              <span>Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBrandUpload(e.target.files?.[0], 'logoUrl')}
                className="hidden"
              />
            </label>
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Logo" className="mt-3 h-12 bg-zed-black p-2 object-contain" />
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-zed-gold px-4 py-2 text-xs uppercase">
              <Upload className="h-4 w-4" />
              <span>Upload Favicon</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBrandUpload(e.target.files?.[0], 'faviconUrl')}
                className="hidden"
              />
            </label>
            {form.faviconUrl && (
              <img src={form.faviconUrl} alt="Favicon" className="mt-3 h-10 w-10 border object-contain" />
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border border-zed-gold/25 bg-white p-6">
        <h2 className="font-serif text-2xl">Announcements & Fallback Hero</h2>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
          <input
            type="checkbox"
            checked={form.announcementEnabled}
            onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })}
          />
          Show Top Announcement Bar
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={form.announcementText}
            onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
            placeholder="Announcement Text"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.announcementLink}
            onChange={(e) => setForm({ ...form, announcementLink: e.target.value })}
            placeholder="Announcement Link (/products)"
            className="border px-3 py-2 text-sm"
          />
        </div>
        <input
          type="text"
          value={form.heroFallbackTitle}
          onChange={(e) => setForm({ ...form, heroFallbackTitle: e.target.value })}
          placeholder="Hero Fallback Headline"
          className="w-full border px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          value={form.heroFallbackSubtitle}
          onChange={(e) => setForm({ ...form, heroFallbackSubtitle: e.target.value })}
          placeholder="Hero Fallback Subtitle"
          className="w-full border px-3 py-2 text-sm"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3 border border-zed-gold/25 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Header Navigation</h2>
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, navigation: [...form.navigation, { label: 'New', path: '/products' }] })
              }
              className="inline-flex items-center gap-1 border px-2 py-1 text-xs"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {form.navigation.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const next = [...form.navigation];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setForm({ ...form, navigation: next });
                }}
                className="w-1/2 border px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={item.path}
                onChange={(e) => {
                  const next = [...form.navigation];
                  next[idx] = { ...next[idx], path: e.target.value };
                  setForm({ ...form, navigation: next });
                }}
                className="w-1/2 border px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    navigation: form.navigation.filter((_, i) => i !== idx),
                  })
                }
                className="text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3 border border-zed-gold/25 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Footer Links & About</h2>
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, footerLinks: [...form.footerLinks, { label: 'Link', path: '/' }] })
              }
              className="inline-flex items-center gap-1 border px-2 py-1 text-xs"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <textarea
            rows={2}
            value={form.footerAbout}
            onChange={(e) => setForm({ ...form, footerAbout: e.target.value })}
            className="w-full border px-3 py-2 text-sm"
          />
          {form.footerLinks.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const next = [...form.footerLinks];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setForm({ ...form, footerLinks: next });
                }}
                className="w-1/2 border px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={item.path}
                onChange={(e) => {
                  const next = [...form.footerLinks];
                  next[idx] = { ...next[idx], path: e.target.value };
                  setForm({ ...form, footerLinks: next });
                }}
                className="w-1/2 border px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    footerLinks: form.footerLinks.filter((_, i) => i !== idx),
                  })
                }
                className="text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 border border-zed-gold/25 bg-white p-6">
        <h2 className="font-serif text-2xl">Contact, Social Channels & SEO Metadata</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            placeholder="Contact Email"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            placeholder="Contact Phone"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.contactAddress}
            onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
            placeholder="Salon Address"
            className="border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <input
            type="url"
            value={form.socialLinks.instagram}
            onChange={(e) =>
              setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })
            }
            placeholder="Instagram URL"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={form.socialLinks.facebook}
            onChange={(e) =>
              setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })
            }
            placeholder="Facebook URL"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={form.socialLinks.twitter}
            onChange={(e) =>
              setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })
            }
            placeholder="X / Twitter URL"
            className="border px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={form.socialLinks.youtube}
            onChange={(e) =>
              setForm({ ...form, socialLinks: { ...form.socialLinks, youtube: e.target.value } })
            }
            placeholder="YouTube URL"
            className="border px-3 py-2 text-sm"
          />
        </div>
        <input
          type="text"
          value={form.seo.defaultTitle}
          onChange={(e) => setForm({ ...form, seo: { ...form.seo, defaultTitle: e.target.value } })}
          placeholder="Default SEO Title"
          className="w-full border px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          value={form.seo.defaultDescription}
          onChange={(e) =>
            setForm({ ...form, seo: { ...form.seo, defaultDescription: e.target.value } })
          }
          placeholder="Default Meta Description"
          className="w-full border px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={form.seo.keywords}
          onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
          placeholder="SEO Keywords (comma-separated)"
          className="w-full border px-3 py-2 text-sm"
        />
      </section>
    </form>
  );
}
