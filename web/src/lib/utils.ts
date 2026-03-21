export function getApiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  return raw.replace(/\/api\/?$/, "");
}

/** Kapak veya medya yolu tam URL'ye çevrilir */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getApiOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}s ${m}dk`;
  return `${m} dk`;
}
