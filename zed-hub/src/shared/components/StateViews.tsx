import { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zed-gold border-t-transparent" />
      <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">{label}</p>
    </div>
  );
}

export function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto my-8 max-w-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-red-700" />
      <p className="text-sm font-medium text-red-900">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 border border-zed-black bg-zed-black px-5 py-2 text-xs uppercase tracking-widest text-white transition hover:bg-zed-gold hover:text-zed-black"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto my-12 max-w-lg border border-zed-gold/30 bg-white p-10 text-center shadow-sm">
      <Inbox className="mx-auto mb-4 h-9 w-9 text-zed-gold" />
      <h3 className="font-serif text-2xl text-zed-black">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="border border-neutral-200 bg-white p-3">
          <div className="luxury-shimmer aspect-[3/4] w-full" />
          <div className="luxury-shimmer mt-4 h-4 w-3/4" />
          <div className="luxury-shimmer mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
