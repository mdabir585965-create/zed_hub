import { Info } from 'lucide-react';

export default function DemoNoticeBanner() {
  return (
    <div className="inline-flex items-center gap-2 border border-zed-gold/50 bg-zed-black px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zed-gold-light">
      <Info className="h-3.5 w-3.5 text-zed-gold" />
      <span>Clearly Labeled Demo Data</span>
    </div>
  );
}
