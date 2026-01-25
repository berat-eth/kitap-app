import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Book } from '../entities/Book';
import { Chapter } from '../entities/Chapter';
import { Category } from '../entities/Category';
import { Device } from '../entities/Device';
import { Progress } from '../entities/Progress';
import {
  ApiResponse,
  AdminStats,
  CreateBookDTO,
  UpdateBookDTO,
  CreateChapterDTO,
  UpdateChapterDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../types';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { adminAuth } from '../middleware/adminAuth';
import { adminLimiter } from '../middleware/rateLimiter';
import {
  validate,
  bookValidations,
  chapterValidations,
  categoryValidations,
} from '../middleware/validator';
import { cacheDeletePattern } from '../config/redis';
import { createSlug } from '../utils/helpers';

const router = Router();

// Tüm admin route'ları için auth ve rate limit
router.use(adminAuth);
router.use(adminLimiter);

const bookRepository = () => AppDataSource.getRepository(Book);
const chapterRepository = () => AppDataSource.getRepository(Chapter);
const categoryRepository = () => AppDataSource.getRepository(Category);
const deviceRepository = () => AppDataSource.getRepository(Device);
const progressRepository = () => AppDataSource.getRepository(Progress);

/**
 * GET /api/admin/stats
 * Dashboard istatistikleri
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const totalBooks = await bookRepository().count();
    const totalChapters = await chapterRepository().count();
    const totalDevices = await deviceRepository().count();
    const totalCategories = await categoryRepository().count();

    // Son 7 günde aktif cihazlar
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDevices = await deviceRepository()
      .createQueryBuilder('device')
      .where('device.lastSeen >= :date', { date: sevenDaysAgo })
      .getCount();

    // En popüler kitaplar (dinleyici sayısına göre)
    const popularBooks = await progressRepository()
      .createQueryBuilder('progress')
      .select('progress.bookId', 'bookId')
      .addSelect('book.title', 'title')
      .addSelect('COUNT(DISTINCT progress.deviceId)', 'listenerCount')
      .leftJoin('progress.book', 'book')
      .groupBy('progress.bookId')
      .orderBy('listenerCount', 'DESC')
      .limit(5)
      .getRawMany();

    const stats: AdminStats = {
      totalBooks,
      totalChapters,
      totalDevices,
      totalCategories,
      recentDevices,
      popularBooks: popularBooks.map((p) => ({
        id: p.bookId,
        title: p.title,
        listenerCount: parseInt(p.listenerCount, 10),
      })),
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  })
);

// ============ BOOKS ============

/**
 * GET /api/admin/books
 * Tüm kitaplar (admin view - aktif/pasif dahil)
 */
router.get(
  '/books',
  asyncHandler(async (req: Request, res: Response) => {
    const books = await bookRepository().find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    const response: ApiResponse = {
      success: true,
      data: books,
    };

    res.json(response);
  })
);

/**
 * POST /api/admin/books
 * Yeni kitap ekle
 */
router.post(
  '/books',
  validate(bookValidations.create),
  asyncHandler(async (req: Request, res: Response) => {
    const bookData = req.body as CreateBookDTO;

    const book = bookRepository().create(bookData);
    await bookRepository().save(book);

    // Cache'i temizle
    await cacheDeletePattern('books:*');

    const response: ApiResponse = {
      success: true,
      data: book,
      message: 'Kitap başarıyla eklendi',
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/admin/books/:id
 * Kitap güncelle
 */
router.put(
  '/books/:id',
  validate(bookValidations.update),
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id, 10);
    const updateData = req.body as UpdateBookDTO;

    const book = await bookRepository().findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    Object.assign(book, updateData);
    await bookRepository().save(book);

    // Cache'i temizle
    await cacheDeletePattern('books:*');

    const response: ApiResponse = {
      success: true,
      data: book,
      message: 'Kitap başarıyla güncellendi',
    };

    res.json(response);
  })
);

/**
 * DELETE /api/admin/books/:id
 * Kitap sil
 */
router.delete(
  '/books/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id, 10);

    const result = await bookRepository().delete(bookId);

    if (result.affected === 0) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    // Cache'i temizle
    await cacheDeletePattern('books:*');

    const response: ApiResponse = {
      success: true,
      message: 'Kitap başarıyla silindi',
    };

    res.json(response);
  })
);

// ============ CHAPTERS ============

/**
 * POST /api/admin/books/:bookId/chapters
 * Bölüm ekle
 */
router.post(
  '/books/:bookId/chapters',
  validate(chapterValidations.create),
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.bookId, 10);
    const chapterData = req.body as CreateChapterDTO;

    // Kitap var mı kontrol et
    const book = await bookRepository().findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    const chapter = chapterRepository().create({
      ...chapterData,
      bookId,
    });

    await chapterRepository().save(chapter);

    // Kitabın toplam süresini güncelle
    await updateBookDuration(bookId);

    const response: ApiResponse = {
      success: true,
      data: chapter,
      message: 'Bölüm başarıyla eklendi',
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/admin/chapters/:id
 * Bölüm güncelle
 */
router.put(
  '/chapters/:id',
  validate(chapterValidations.update),
  asyncHandler(async (req: Request, res: Response) => {
    const chapterId = parseInt(req.params.id, 10);
    const updateData = req.body as UpdateChapterDTO;

    const chapter = await chapterRepository().findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundError('Bölüm bulunamadı');
    }

    Object.assign(chapter, updateData);
    await chapterRepository().save(chapter);

    // Kitabın toplam süresini güncelle
    await updateBookDuration(chapter.bookId);

    const response: ApiResponse = {
      success: true,
      data: chapter,
      message: 'Bölüm başarıyla güncellendi',
    };

    res.json(response);
  })
);

/**
 * DELETE /api/admin/chapters/:id
 * Bölüm sil
 */
router.delete(
  '/chapters/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const chapterId = parseInt(req.params.id, 10);

    const chapter = await chapterRepository().findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundError('Bölüm bulunamadı');
    }

    const bookId = chapter.bookId;
    await chapterRepository().delete(chapterId);

    // Kitabın toplam süresini güncelle
    await updateBookDuration(bookId);

    const response: ApiResponse = {
      success: true,
      message: 'Bölüm başarıyla silindi',
    };

    res.json(response);
  })
);

// ============ CATEGORIES ============

/**
 * GET /api/admin/categories
 * Tüm kategoriler
 */
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryRepository().find({
      order: { name: 'ASC' },
    });

    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    res.json(response);
  })
);

/**
 * POST /api/admin/categories
 * Kategori ekle
 */
router.post(
  '/categories',
  validate(categoryValidations.create),
  asyncHandler(async (req: Request, res: Response) => {
    const categoryData = req.body as CreateCategoryDTO;

    // Slug otomatik oluştur (verilmediyse)
    if (!categoryData.slug) {
      categoryData.slug = createSlug(categoryData.name);
    }

    const category = categoryRepository().create(categoryData);
    await categoryRepository().save(category);

    // Cache'i temizle
    await cacheDeletePattern('categories:*');

    const response: ApiResponse = {
      success: true,
      data: category,
      message: 'Kategori başarıyla eklendi',
    };

    res.status(201).json(response);
  })
);

/**
 * PUT /api/admin/categories/:id
 * Kategori güncelle
 */
router.put(
  '/categories/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id, 10);
    const updateData = req.body as UpdateCategoryDTO;

    const category = await categoryRepository().findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    Object.assign(category, updateData);
    await categoryRepository().save(category);

    // Cache'i temizle
    await cacheDeletePattern('categories:*');

    const response: ApiResponse = {
      success: true,
      data: category,
      message: 'Kategori başarıyla güncellendi',
    };

    res.json(response);
  })
);

/**
 * DELETE /api/admin/categories/:id
 * Kategori sil
 */
router.delete(
  '/categories/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id, 10);

    const result = await categoryRepository().delete(categoryId);

    if (result.affected === 0) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    // Cache'i temizle
    await cacheDeletePattern('categories:*');

    const response: ApiResponse = {
      success: true,
      message: 'Kategori başarıyla silindi',
    };

    res.json(response);
  })
);

// Yardımcı fonksiyon: Kitabın toplam süresini güncelle
async function updateBookDuration(bookId: number): Promise<void> {
  const result = await chapterRepository()
    .createQueryBuilder('chapter')
    .select('SUM(chapter.duration)', 'totalDuration')
    .where('chapter.bookId = :bookId', { bookId })
    .getRawOne();

  if (result) {
    await bookRepository().update(bookId, {
      totalDuration: parseInt(result.totalDuration, 10) || 0,
    });
  }
}

export default router;
