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

function unwrapMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data && data.message != null) {
    return String((data as { message: unknown }).message);
  }
  return 'İstek başarısız';
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
    throw new ApiError(401, unwrapMessage(data), data);
  }

  if (!r.ok) {
    throw new ApiError(r.status, unwrapMessage(data), data);
  }

  return data as T;
}

/** Kapak (görsel) veya bölüm sesi — multipart, alan adı `file` */
export async function uploadAsset(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch(`${PREFIX}/api/upload`, {
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
    throw new ApiError(r.status, unwrapMessage(data), data);
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
