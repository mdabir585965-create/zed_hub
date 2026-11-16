import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { loginAdmin } from '../../firebase/auth';
import { isFirebaseConfigured } from '../../firebase/config';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zed-black px-4 text-white">
      <div className="w-full max-w-md border border-zed-gold/40 bg-zed-charcoal p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zed-gold/40 text-zed-gold">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-3xl tracking-[0.2em]">ZED HUB</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zed-gold">
            Authorized Admin Portal
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mt-6 flex items-start gap-2 border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Firebase environment variables are missing. Add them to <code>.env</code> first.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-400">
              Admin Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-zed-gold/30 bg-zed-black px-4 py-3 text-sm text-white focus:border-zed-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-neutral-400">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-zed-gold/30 bg-zed-black px-4 py-3 text-sm text-white focus:border-zed-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isFirebaseConfigured}
            className="w-full bg-zed-gold py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-zed-black transition hover:bg-zed-gold-light disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In to Studio'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-neutral-400 hover:text-zed-gold">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
