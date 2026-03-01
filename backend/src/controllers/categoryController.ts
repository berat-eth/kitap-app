import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService';
import * as bookService from '../services/bookService';
import { AppError } from '../middleware/errorHandler';

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getBooksByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) throw new AppError(404, 'Category not found');

    const { page, limit } = req.query as Record<string, string>;
    const { books, total } = await bookService.getBooks({
      category: req.params.slug,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    res.json({
      success: true,
      data: { category, books },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}
