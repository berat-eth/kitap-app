export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_image?: string;
  category_id?: string;
  category?: Category;
  duration: number;
  rating: number;
  is_featured: boolean;
  is_popular: boolean;
  play_count: number;
  chapters?: Chapter[];
  created_at: Date;
  updated_at: Date;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  order_num: number;
  audio_url: string;
  duration: number;
  created_at: Date;
}

export interface Device {
  id: string;
  device_name?: string;
  platform?: string;
  registered_at: Date;
  last_seen: Date;
}

export interface Progress {
  device_id: string;
  book_id: string;
  chapter_id?: string;
  current_time: number;
  is_completed: boolean;
  updated_at: Date;
}

export interface Favorite {
  device_id: string;
  book_id: string;
  created_at: Date;
}

export interface VoiceRoom {
  id: string;
  name: string;
  topic?: string;
  host_device_id: string;
  max_participants: number;
  is_live: boolean;
  created_at: Date;
  closed_at?: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface BooksQuery extends PaginationQuery {
  category?: string;
  search?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
