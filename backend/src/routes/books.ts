import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Book } from '../entities/Book';
import { Chapter } from '../entities/Chapter';
import { Review } from '../entities/Review';
import { ApiResponse, BookFilterQuery, DeviceRequest } from '../types';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { optionalDeviceAuth } from '../middleware/deviceAuth';
import { parsePagination, createPaginationMeta } from '../utils/helpers';
import { cacheGet, cacheSet } from '../config/redis';
import { Like, FindOptionsWhere } from 'typeorm';

const router = Router();
const bookRepository = () => AppDataSource.getRepository(Book);
const chapterRepository = () => AppDataSource.getRepository(Chapter);
const reviewRepository = () => AppDataSource.getRepository(Review);

/**
 * GET /api/books
 * Tüm kitapları listele (pagination + filter)
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as BookFilterQuery;
    const { page, limit, skip } = parsePagination(query);

    // Cache key oluştur
    const cacheKey = `books:list:${JSON.stringify(query)}`;
    const cached = await cacheGet<{ books: Book[]; total: number }>(cacheKey);

    if (cached) {
      const response: ApiResponse = {
        success: true,
        data: cached.books,
        meta: createPaginationMeta(page, limit, cached.total),
      };
      res.json(response);
      return;
    }

    // Where koşulları
    const where: FindOptionsWhere<Book> = { isActive: true };

    if (query.category) {
      where.categoryId = parseInt(query.category, 10);
    }

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    // Query builder
    const queryBuilder = bookRepository()
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .where('book.isActive = :isActive', { isActive: true });

    if (query.category) {
      queryBuilder.andWhere('book.categoryId = :categoryId', {
        categoryId: parseInt(query.category, 10),
      });
    }

    if (query.featured === 'true') {
      queryBuilder.andWhere('book.isFeatured = :isFeatured', { isFeatured: true });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(book.title LIKE :search OR book.author LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Sıralama
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    queryBuilder.orderBy(`book.${sortBy}`, sortOrder);

    // Pagination
    const [books, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Cache'e kaydet (5 dakika)
    await cacheSet(cacheKey, { books, total }, 300);

    const response: ApiResponse = {
      success: true,
      data: books,
      meta: createPaginationMeta(page, limit, total),
    };

    res.json(response);
  })
);

/**
 * GET /api/books/featured
 * Öne çıkan kitaplar
 */
router.get(
  '/featured',
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'books:featured';
    const cached = await cacheGet<Book[]>(cacheKey);

    if (cached) {
      const response: ApiResponse = {
        success: true,
        data: cached,
      };
      res.json(response);
      return;
    }

    const books = await bookRepository().find({
      where: { isFeatured: true, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    await cacheSet(cacheKey, books, 300);

    const response: ApiResponse = {
      success: true,
      data: books,
    };

    res.json(response);
  })
);

/**
 * GET /api/books/popular
 * Popüler kitaplar (rating ve dinleyici sayısına göre)
 */
router.get(
  '/popular',
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'books:popular';
    const cached = await cacheGet<Book[]>(cacheKey);

    if (cached) {
      const response: ApiResponse = {
        success: true,
        data: cached,
      };
      res.json(response);
      return;
    }

    const books = await bookRepository().find({
      where: { isActive: true },
      relations: ['category'],
      order: { rating: 'DESC', ratingCount: 'DESC' },
      take: 10,
    });

    await cacheSet(cacheKey, books, 300);

    const response: ApiResponse = {
      success: true,
      data: books,
    };

    res.json(response);
  })
);

/**
 * GET /api/books/search
 * Kitap arama
 */
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query as { q?: string };
    const { page, limit, skip } = parsePagination(req.query);

    if (!q || q.trim().length < 2) {
      const response: ApiResponse = {
        success: false,
        error: 'Arama terimi en az 2 karakter olmalı',
      };
      res.status(400).json(response);
      return;
    }

    const searchTerm = `%${q.trim()}%`;

    const [books, total] = await bookRepository().findAndCount({
      where: [
        { title: Like(searchTerm), isActive: true },
        { author: Like(searchTerm), isActive: true },
      ],
      relations: ['category'],
      order: { rating: 'DESC' },
      skip,
      take: limit,
    });

    const response: ApiResponse = {
      success: true,
      data: books,
      meta: createPaginationMeta(page, limit, total),
    };

    res.json(response);
  })
);

/**
 * GET /api/books/:id
 * Kitap detayı
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id, 10);

    const book = await bookRepository().findOne({
      where: { id: bookId, isActive: true },
      relations: ['category', 'chapters'],
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    // Bölümleri sırala
    if (book.chapters) {
      book.chapters.sort((a, b) => a.orderNum - b.orderNum);
    }

    const response: ApiResponse = {
      success: true,
      data: book,
    };

    res.json(response);
  })
);

/**
 * GET /api/books/:id/chapters
 * Kitabın bölümleri
 */
router.get(
  '/:id/chapters',
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id, 10);

    // Kitap var mı kontrol et
    const book = await bookRepository().findOne({
      where: { id: bookId, isActive: true },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    const chapters = await chapterRepository().find({
      where: { bookId },
      order: { orderNum: 'ASC' },
    });

    const response: ApiResponse = {
      success: true,
      data: chapters,
    };

    res.json(response);
  })
);

/**
 * GET /api/books/:id/reviews
 * Kitabın yorumları
 */
router.get(
  '/:id/reviews',
  asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id, 10);
    const { page, limit, skip } = parsePagination(req.query);

    const [reviews, total] = await reviewRepository().findAndCount({
      where: { bookId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const response: ApiResponse = {
      success: true,
      data: reviews,
      meta: createPaginationMeta(page, limit, total),
    };

    res.json(response);
  })
);

export default router;
