export type BookStatus = 'pending' | 'approved' | 'rejected';

export interface AdminStats {
  books_total: number;
  books_pending: number;
  books_approved: number;
  books_rejected: number;
  devices: number;
  categories: number;
  chapters: number;
  favorites: number;
}

export interface AdminBook {
  id: string;
  title: string;
  author: string;
  narrator: string | null;
  description: string | null;
  device_id: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  cover_url: string | null;
  duration_seconds: number;
  play_count: number;
  rating: number;
  is_premium: boolean;
  status: BookStatus;
  admin_note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminChapter {
  id: string;
  book_id: string;
  title: string;
  order_no: number;
  audio_url: string;
  duration_seconds: number;
}

export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  description: string | null;
  book_count: number;
}

export interface SubmissionRow {
  id: string;
  device_id: string;
  title: string;
  author: string;
  narrator: string;
  description: string | null;
  category: string;
  cover_image: string | null;
  status: BookStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceRow {
  id: string;
  device_name: string | null;
  platform: string;
  created_at: string;
  favorite_count: number;
  progress_count: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
