import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { SiteSettings } from '../../shared/types';
import { isSafeUrl } from '../../shared/utils/validation';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { icon: Instagram, url: settings.socialLinks.instagram, label: 'Instagram' },
    { icon: Facebook, url: settings.socialLinks.facebook, label: 'Facebook' },
    { icon: Twitter, url: settings.socialLinks.twitter, label: 'Twitter' },
    { icon: Youtube, url: settings.socialLinks.youtube, label: 'YouTube' },
  ].filter((s) => s.url && isSafeUrl(s.url));

  return (
    <footer className="border-t border-zed-gold/30 bg-zed-black text-neutral-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="font-serif text-3xl tracking-[0.22em] text-white">
            {settings.siteName}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            {settings.footerAbout}
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-zed-gold/30 text-zed-gold-light transition hover:border-zed-gold hover:bg-zed-gold hover:text-zed-black"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zed-gold">
            Navigation
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {settings.footerLinks.map((link) => (
              <li key={link.path + link.label}>
                <Link to={link.path} className="transition hover:text-zed-gold-light">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zed-gold">
            Private Concierge
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-400">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zed-gold" />
              <span>{settings.contactEmail}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zed-gold" />
              <span>{settings.contactPhone}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zed-gold" />
              <span>{settings.contactAddress}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs tracking-widest text-neutral-500">
        © {new Date().getFullYear()} {settings.siteName}. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
