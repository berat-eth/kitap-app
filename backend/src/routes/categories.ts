import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { Book } from '../entities/Book';
import { ApiResponse } from '../types';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { parsePagination, createPaginationMeta } from '../utils/helpers';
import { cacheGet, cacheSet } from '../config/redis';

const router = Router();
const categoryRepository = () => AppDataSource.getRepository(Category);
const bookRepository = () => AppDataSource.getRepository(Book);

/**
 * GET /api/categories
 * Tüm kategoriler
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'categories:all';
    const cached = await cacheGet<Category[]>(cacheKey);

    if (cached) {
      const response: ApiResponse = {
        success: true,
        data: cached,
      };
      res.json(response);
      return;
    }

    const categories = await categoryRepository().find({
      order: { name: 'ASC' },
    });

    // Her kategori için kitap sayısını ekle
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await bookRepository().count({
          where: { categoryId: category.id, isActive: true },
        });
        return {
          ...category,
          bookCount,
        };
      })
    );

    await cacheSet(cacheKey, categoriesWithCount, 600); // 10 dakika cache

    const response: ApiResponse = {
      success: true,
      data: categoriesWithCount,
    };

    res.json(response);
  })
);

/**
 * GET /api/categories/:slug
 * Kategori detayı
 */
router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const category = await categoryRepository().findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    // Kitap sayısını ekle
    const bookCount = await bookRepository().count({
      where: { categoryId: category.id, isActive: true },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        ...category,
        bookCount,
      },
    };

    res.json(response);
  })
);

/**
 * GET /api/categories/:slug/books
 * Kategorideki kitaplar
 */
router.get(
  '/:slug/books',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const category = await categoryRepository().findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundError('Kategori bulunamadı');
    }

    const [books, total] = await bookRepository().findAndCount({
      where: { categoryId: category.id, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        category,
        books,
      },
      meta: createPaginationMeta(page, limit, total),
    };

    res.json(response);
  })
);

export default router;
