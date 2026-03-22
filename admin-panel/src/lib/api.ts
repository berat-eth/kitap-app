import type { Pagination } from '../types';

const PREFIX = '/api/backend';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function unwrapMessage(data: unknown, status?: number): string {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (o.message != null) return String(o.message);
    if (o.detail != null) return String(o.detail);
  }
  if (typeof data === 'string' && data.trim()) {
    const t = data.trim();
    if (t.startsWith('<')) {
      return `Beklenmeyen yanıt (HTTP ${status ?? '?'}): sunucu HTML veya proxy hatası döndü. pm2 logs wirbooks-admin kontrol edin.`;
    }
    return t.length > 280 ? `${t.slice(0, 280)}…` : t;
  }
  return status != null ? `İstek başarısız (HTTP ${status})` : 'İstek başarısız';
}

function logClientApiFailure(path: string, status: number, data: unknown) {
  let snippet = '';
  try {
    snippet =
      typeof data === 'string'
        ? data.slice(0, 120).replace(/\s+/g, ' ')
        : JSON.stringify(data)?.slice(0, 200) ?? '';
  } catch {
    snippet = '[log-serialize-error]';
  }
  console.warn('[wirbooks-admin api]', path, status, snippet);
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (init?.body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const r = await fetch(`${PREFIX}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  const ct = r.headers.get('content-type') || '';
  let data: unknown = null;
  if (ct.includes('application/json')) {
    try {
      data = await r.json();
    } catch {
      data = null;
    }
  } else {
    data = await r.text();
  }

  if (r.status === 401) {
    logClientApiFailure(path, r.status, data);
    throw new ApiError(401, unwrapMessage(data, r.status), data);
  }

  if (!r.ok) {
    logClientApiFailure(path, r.status, data);
    throw new ApiError(r.status, unwrapMessage(data, r.status), data);
  }

  return data as T;
}

/** Kapak (görsel) veya bölüm sesi — multipart, alan adı `file` */
export async function uploadAsset(file: File, opts?: { bookId?: string }): Promise<string> {
  const bid = opts?.bookId?.trim() ?? '';
  const q =
    bid &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bid)
      ? `?book_id=${encodeURIComponent(bid)}`
      : '';
  const fd = new FormData();
  fd.append('file', file);
  const path = `/api/upload${q}`;
  const r = await fetch(`${PREFIX}${path}`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  const ct = r.headers.get('content-type') || '';
  let data: unknown = null;
  if (ct.includes('application/json')) {
    try {
      data = await r.json();
    } catch {
      data = null;
    }
  } else {
    data = await r.text();
  }
  if (!r.ok) {
    logClientApiFailure(path, r.status, data);
    throw new ApiError(r.status, unwrapMessage(data, r.status), data);
  }
  const payload = data as SuccessWrap<{ url: string }>;
  const url = payload?.data?.url;
  if (!url || typeof url !== 'string') {
    throw new ApiError(r.status, 'Yanıtta URL yok', data);
  }
  return url;
}

/** Tarayıcıda ses dosyası süresini tahmin et (mp3 vb.); başarısızsa null */
export function probeAudioDurationSeconds(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const el = document.createElement('audio');
    el.preload = 'metadata';
    const done = (sec: number | null) => {
      URL.revokeObjectURL(objectUrl);
      resolve(sec);
    };
    el.onloadedmetadata = () => {
      const d = el.duration;
      done(Number.isFinite(d) && d > 0 ? Math.round(d) : null);
    };
    el.onerror = () => done(null);
    el.src = objectUrl;
  });
}

export interface SuccessWrap<T> {
  success: boolean;
  data: T;
}

export interface PaginatedWrap<T> {
  success: boolean;
  data: T;
  pagination: Pagination;
}
