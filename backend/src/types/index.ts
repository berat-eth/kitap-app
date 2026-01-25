import { Request } from 'express';
import { Device } from '../entities/Device';

// Extended Request with Device
export interface DeviceRequest extends Request {
  device?: Device;
  deviceId?: string;
}

// Extended Request for Admin
export interface AdminRequest extends Request {
  isAdmin?: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query Parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface BookFilterQuery extends PaginationQuery {
  category?: string;
  search?: string;
  featured?: string;
  sortBy?: 'title' | 'author' | 'rating' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

// DTOs (Data Transfer Objects)
export interface CreateBookDTO {
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  coverImage?: string;
  categoryId?: number;
  isFeatured?: boolean;
}

export interface UpdateBookDTO extends Partial<CreateBookDTO> {
  isActive?: boolean;
}

export interface CreateChapterDTO {
  bookId: number;
  title: string;
  orderNum: number;
  audioUrl: string;
  duration?: number;
}

export interface UpdateChapterDTO extends Partial<Omit<CreateChapterDTO, 'bookId'>> {}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface RegisterDeviceDTO {
  deviceName?: string;
  platform?: string;
}

export interface SaveProgressDTO {
  chapterId?: number;
  currentTime: number;
  isCompleted?: boolean;
}

export interface CreateReviewDTO {
  rating: number;
  comment?: string;
  reviewerName?: string;
}

// Stats Types
export interface DeviceStats {
  totalBooksStarted: number;
  totalBooksCompleted: number;
  totalListeningTime: number;
  favoritesCount: number;
  reviewsCount: number;
}

export interface AdminStats {
  totalBooks: number;
  totalChapters: number;
  totalDevices: number;
  totalCategories: number;
  recentDevices: number;
  popularBooks: Array<{
    id: number;
    title: string;
    listenerCount: number;
  }>;
}
