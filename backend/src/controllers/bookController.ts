import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/bookService';
import * as chapterService from '../services/chapterService';
import { AppError } from '../middleware/errorHandler';
import { logger, LOG_CONTEXT } from '../utils/logger';

export async function listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, category, search } = req.query as Record<string, string>;
    logger.debug(LOG_CONTEXT.BOOKS, 'listBooks', { page, limit, category, search });
    const { books, total } = await bookService.getBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      category,
      search,
    });
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    logger.info(LOG_CONTEXT.BOOKS, 'listBooks result', { total, count: books.length });
    res.json({
      success: true,
      data: books,
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

export async function getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const books = await bookService.getFeaturedBooks();
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
}

export async function getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const books = await bookService.getPopularBooks();
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
}

export async function searchBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string) ?? '';
    logger.debug(LOG_CONTEXT.BOOKS, 'searchBooks', { q });
    if (!q.trim()) {
      res.json({ success: true, data: [] });
      return;
    }
    const books = await bookService.searchBooks(q.trim());
    logger.info(LOG_CONTEXT.BOOKS, 'searchBooks result', { q, count: books.length });
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookId = req.params.id;
    logger.debug(LOG_CONTEXT.BOOKS, 'getBook', { bookId });
    const book = await bookService.getBookById(bookId);
    if (!book) {
      logger.warn(LOG_CONTEXT.BOOKS, 'Book not found', { bookId });
      throw new AppError(404, 'Book not found');
    }
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
}

export async function getBookChapters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) throw new AppError(404, 'Book not found');
    const chapters = await chapterService.getChaptersByBookId(req.params.id);
    res.json({ success: true, data: chapters });
  } catch (err) {
    next(err);
  }
}
