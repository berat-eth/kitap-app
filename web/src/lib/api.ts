import type { ApiListResponse, Book, Category, Chapter } from "./types";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
    /\/?$/,
    ""
  );
}

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (key) h["X-API-Key"] = key;
  return h;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const json = await fetchJson<ApiListResponse<Book[]>>("/books/featured");
  if (!json?.success || !Array.isArray(json.data)) return [];
  return json.data;
}

export async function getPopularBooks(): Promise<Book[]> {
  const json = await fetchJson<ApiListResponse<Book[]>>("/books/popular");
  if (!json?.success || !Array.isArray(json.data)) return [];
  return json.data;
}

export async function getBooks(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}): Promise<{ books: Book[]; pagination: ApiListResponse<Book[]>["pagination"] }> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  const q = sp.toString();
  const json = await fetchJson<ApiListResponse<Book[]>>(`/books${q ? `?${q}` : ""}`);
  if (!json?.success || !Array.isArray(json.data))
    return { books: [], pagination: undefined };
  return { books: json.data, pagination: json.pagination };
}

export async function searchBooks(q: string): Promise<Book[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const json = await fetchJson<ApiListResponse<Book[]>>(
    `/books/search?q=${encodeURIComponent(trimmed)}`
  );
  if (!json?.success || !Array.isArray(json.data)) return [];
  return json.data;
}

export async function getBookById(id: string): Promise<Book | null> {
  const json = await fetchJson<ApiListResponse<Book>>(`/books/${id}`);
  if (!json?.success || !json.data) return null;
  return json.data;
}

export async function getChapters(bookId: string): Promise<Chapter[]> {
  const json = await fetchJson<ApiListResponse<Chapter[]>>(
    `/books/${bookId}/chapters`
  );
  if (!json?.success || !Array.isArray(json.data)) return [];
  return json.data;
}

export async function getCategories(): Promise<Category[]> {
  const json = await fetchJson<ApiListResponse<Category[]>>("/categories");
  if (!json?.success || !Array.isArray(json.data)) return [];
  return json.data;
}
