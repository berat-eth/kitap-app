import { z } from 'zod';

// Device ID validation
export const deviceIdSchema = z.string().uuid('Invalid device ID format');

// User validation
export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().optional(),
});

// Book validation
export const bookCreateSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  narrator: z.string().max(255).optional(),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  category_id: z.number().int().positive(),
  duration_seconds: z.number().int().min(0).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const bookUpdateSchema = bookCreateSchema.partial();

// Chapter validation
export const chapterCreateSchema = z.object({
  book_id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  order_number: z.number().int().positive(),
  audio_file_url: z.string().url(),
  audio_file_size: z.number().int().min(0).optional(),
  transcript_file_url: z.string().url().optional().nullable(),
  transcript_file_size: z.number().int().min(0).optional().nullable(),
  duration_seconds: z.number().int().min(0).optional(),
});

export const chapterUpdateSchema = chapterCreateSchema.partial().omit({ book_id: true });

// Category validation
export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon_url: z.string().url().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Progress validation
export const progressCreateSchema = z.object({
  book_id: z.number().int().positive(),
  chapter_id: z.number().int().positive(),
  current_position_seconds: z.number().int().min(0).optional(),
  is_completed: z.boolean().optional(),
});

export const progressUpdateSchema = z.object({
  current_position_seconds: z.number().int().min(0).optional(),
  is_completed: z.boolean().optional(),
});

// Rating validation
export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// Admin login validation
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Search validation
export const searchSchema = z.object({
  q: z.string().min(1).max(255),
});

// Category filter validation
export const categoryFilterSchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
});

