import { FormEvent, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { PublicContextValue } from '../layouts/PublicLayout';
import { useSEO } from '../../shared/hooks/useSEO';

export default function ContactPage() {
  const { settings } = useOutletContext<PublicContextValue>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [prepared, setPrepared] = useState(false);

  useSEO({
    title: `Private Concierge | ${settings.siteName}`,
    description: `Contact ${settings.siteName} concierge desk.`,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`ZED Hub Concierge Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${settings.contactEmail}?subject=${subject}&body=${body}`;
    setPrepared(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zed-gold-dark">At Your Service</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Private Concierge</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600">
          Direct communication with the {settings.siteName} client advisory desk.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-6 border border-zed-gold/30 bg-zed-black p-8 text-white lg:col-span-5">
          <h2 className="font-serif text-2xl text-zed-gold-light">Direct Channels</h2>
          <div className="space-y-5 pt-2 text-sm text-neutral-300">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-zed-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">Email</p>
                <p className="mt-1">{settings.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-zed-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">Telephone</p>
                <p className="mt-1">{settings.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-zed-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">Flagship Salon</p>
                <p className="mt-1">{settings.contactAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 border border-zed-gold/25 bg-white p-8 lg:col-span-7"
        >
          {prepared && (
            <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your default mail client was opened to dispatch your message.</span>
            </div>
          )}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-600">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-neutral-300 px-4 py-3 text-sm focus:border-zed-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-600">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-neutral-300 px-4 py-3 text-sm focus:border-zed-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-600">
              Message
            </label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full border border-neutral-300 px-4 py-3 text-sm focus:border-zed-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-zed-black px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-zed-gold hover:text-zed-black"
          >
            Compose Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
