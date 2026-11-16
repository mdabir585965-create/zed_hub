export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateTimeInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function createDemoSvgDataUrl(title: string, subtitle = 'DEMO SAMPLE'): string {
  const safeTitle = title.replace(/[<>&"']/g, '');
  const safeSub = subtitle.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A0A0A"/>
        <stop offset="100%" stop-color="#1E1B16"/>
      </linearGradient>
    </defs>
    <rect width="900" height="600" fill="url(#bg)"/>
    <rect x="28" y="28" width="844" height="544" fill="none" stroke="#C9A96E" stroke-opacity="0.45" stroke-width="1.5"/>
    <text x="450" y="255" text-anchor="middle" fill="#C9A96E" font-family="Georgia, serif" font-size="22" letter-spacing="8">${safeSub}</text>
    <text x="450" y="315" text-anchor="middle" fill="#F8F5F0" font-family="Georgia, serif" font-size="38">${safeTitle}</text>
    <text x="450" y="365" text-anchor="middle" fill="#A39E93" font-family="Arial, sans-serif" font-size="14" letter-spacing="3">ZED HUB · CLEARLY LABELED DEMO ASSET</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
