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

export interface SuccessWrap<T> {
  success: boolean;
  data: T;
}

export interface PaginatedWrap<T> {
  success: boolean;
  data: T;
  pagination: Pagination;
}
