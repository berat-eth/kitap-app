import { Request } from 'express';

// User types
export interface User {
  id: number;
  device_id: string | null;
  email: string | null;
  password_hash: string | null;
  name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'donor';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_active_at: Date | null;
}

export interface UserCreateInput {
  device_id?: string;
  email?: string;
  password_hash?: string;
  name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'donor';
}

export interface UserUpdateInput {
  name?: string;
  avatar_url?: string;
  last_active_at?: Date;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
}

// Book types
export interface Book {
  id: number;
  title: string;
  author: string;
  narrator: string | null;
  description: string | null;
  cover_image_url: string | null;
  category_id: number;
  duration_seconds: number;
  rating: number;
  total_ratings: number;
  total_listens: number;
  is_featured: boolean;
  is_published: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface BookCreateInput {
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_image_url?: string;
  category_id: number;
  duration_seconds?: number;
  is_featured?: boolean;
  is_published?: boolean;
}

export interface BookUpdateInput {
  title?: string;
  author?: string;
  narrator?: string;
  description?: string;
  cover_image_url?: string;
  category_id?: number;
  duration_seconds?: number;
  is_featured?: boolean;
  is_published?: boolean;
  published_at?: Date;
}

// Chapter types
export interface Chapter {
  id: number;
  book_id: number;
  title: string;
  order_number: number;
  audio_file_url: string;
  audio_file_size: number | null;
  transcript_file_url: string | null;
  transcript_file_size: number | null;
  duration_seconds: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChapterCreateInput {
  book_id: number;
  title: string;
  order_number: number;
  audio_file_url: string;
  audio_file_size?: number;
  transcript_file_url?: string;
  transcript_file_size?: number;
  duration_seconds?: number;
}

export interface ChapterUpdateInput {
  title?: string;
  order_number?: number;
  audio_file_url?: string;
  audio_file_size?: number;
  transcript_file_url?: string;
  transcript_file_size?: number;
  duration_seconds?: number;
}

// User Progress types
export interface UserProgress {
  id: number;
  user_id: number;
  book_id: number;
  chapter_id: number;
  current_position_seconds: number;
  is_completed: boolean;
  last_played_at: Date;
  updated_at: Date;
}

export interface UserProgressCreateInput {
  user_id: number;
  book_id: number;
  chapter_id: number;
  current_position_seconds?: number;
  is_completed?: boolean;
}

export interface UserProgressUpdateInput {
  current_position_seconds?: number;
  is_completed?: boolean;
}

// User Favorites types
export interface UserFavorite {
  id: number;
  user_id: number;
  book_id: number;
  created_at: Date;
}

// User Downloads types
export interface UserDownload {
  id: number;
  user_id: number;
  book_id: number;
  download_progress: number;
  is_completed: boolean;
  downloaded_at: Date;
}

// Book Ratings types
export interface BookRating {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

// Donation types
export interface Donation {
  id: number;
  user_id: number | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: 'pending' | 'completed' | 'failed';
  transaction_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Admin Log types
export interface AdminLog {
  id: number;
  admin_id: number;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}

// JWT Payload
export interface AdminJwtPayload {
  userId: number;
  email: string;
  role: string;
}

// Request extensions
export interface AuthenticatedRequest extends Request {
  user?: User;
  deviceId?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query filters
export interface BookFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  published?: boolean;
}

