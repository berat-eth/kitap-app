"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryFilterSchema = exports.searchSchema = exports.paginationSchema = exports.adminLoginSchema = exports.ratingSchema = exports.progressUpdateSchema = exports.progressCreateSchema = exports.categoryUpdateSchema = exports.categoryCreateSchema = exports.chapterUpdateSchema = exports.chapterCreateSchema = exports.bookUpdateSchema = exports.bookCreateSchema = exports.userUpdateSchema = exports.deviceIdSchema = void 0;
var zod_1 = require("zod");
// Device ID validation
exports.deviceIdSchema = zod_1.z.string().uuid('Invalid device ID format');
// User validation
exports.userUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    avatar_url: zod_1.z.string().url().optional(),
});
// Book validation
exports.bookCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    author: zod_1.z.string().min(1).max(255),
    narrator: zod_1.z.string().max(255).optional(),
    description: zod_1.z.string().optional(),
    cover_image_url: zod_1.z.string().url().optional(),
    category_id: zod_1.z.number().int().positive(),
    duration_seconds: zod_1.z.number().int().min(0).optional(),
    is_featured: zod_1.z.boolean().optional(),
    is_published: zod_1.z.boolean().optional(),
});
exports.bookUpdateSchema = exports.bookCreateSchema.partial();
// Chapter validation
exports.chapterCreateSchema = zod_1.z.object({
    book_id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1).max(255),
    order_number: zod_1.z.number().int().positive(),
    audio_file_url: zod_1.z.string().url(),
    audio_file_size: zod_1.z.number().int().min(0).optional(),
    duration_seconds: zod_1.z.number().int().min(0).optional(),
});
exports.chapterUpdateSchema = exports.chapterCreateSchema.partial().omit({ book_id: true });
// Category validation
exports.categoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    slug: zod_1.z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
    description: zod_1.z.string().optional(),
    icon_url: zod_1.z.string().url().optional(),
});
exports.categoryUpdateSchema = exports.categoryCreateSchema.partial();
// Progress validation
exports.progressCreateSchema = zod_1.z.object({
    book_id: zod_1.z.number().int().positive(),
    chapter_id: zod_1.z.number().int().positive(),
    current_position_seconds: zod_1.z.number().int().min(0).optional(),
    is_completed: zod_1.z.boolean().optional(),
});
exports.progressUpdateSchema = zod_1.z.object({
    current_position_seconds: zod_1.z.number().int().min(0).optional(),
    is_completed: zod_1.z.boolean().optional(),
});
// Rating validation
exports.ratingSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
});
// Admin login validation
exports.adminLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
// Pagination validation
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
// Search validation
exports.searchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1).max(255),
});
// Category filter validation
exports.categoryFilterSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    featured: zod_1.z.coerce.boolean().optional(),
    published: zod_1.z.coerce.boolean().optional(),
});
