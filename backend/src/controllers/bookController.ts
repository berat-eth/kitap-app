import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/bookService';
import * as chapterService from '../services/chapterService';
import { AppError } from '../middleware/errorHandler';

export async function listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, category, search } = req.query as Record<string, string>;
    const { books, total } = await bookService.getBooks({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      category,
      search,
    });
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
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
    if (!q.trim()) {
      res.json({ success: true, data: [] });
      return;
    }
    const books = await bookService.searchBooks(q.trim());
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) throw new AppError(404, 'Book not found');
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
