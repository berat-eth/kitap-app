export type BookCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Book = {
  id: string | number;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_image: string | null;
  duration: number;
  rating: number;
  play_count: number;
  category?: BookCategory;
};

export type Chapter = {
  id: string | number;
  title: string;
  order_num: number;
  audio_url: string;
  duration: number;
};

export type Category = {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
};

export type ApiListResponse<T> = {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
};
