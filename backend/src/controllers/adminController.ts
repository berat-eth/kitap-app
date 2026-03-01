import { Request, Response, NextFunction } from 'express';
import * as bookService from '../services/bookService';
import * as chapterService from '../services/chapterService';
import * as categoryService from '../services/categoryService';
import * as deviceService from '../services/deviceService';
import * as submissionService from '../services/submissionService';
import { getRoomList } from '../socket/voiceChat';
import { AppError } from '../middleware/errorHandler';
import { Book } from '../types';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await bookService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as Partial<Book>;
    if (!data.title || !data.author) {
      throw new AppError(400, 'title and author are required');
    }
    const book = await bookService.createBook(data);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const book = await bookService.updateBook(req.params.id, req.body as Partial<Book>);
    if (!book) throw new AppError(404, 'Book not found');
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await bookService.deleteBook(req.params.id);
    if (!deleted) throw new AppError(404, 'Book not found');
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function createChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { book_id, title, order_num, audio_url, duration } = req.body as {
      book_id: string;
      title: string;
      order_num: number;
      audio_url: string;
      duration?: number;
    };
    if (!book_id || !title || !audio_url) {
      throw new AppError(400, 'book_id, title, and audio_url are required');
    }
    const chapter = await chapterService.createChapter({ book_id, title, order_num: order_num ?? 1, audio_url, duration });
    res.status(201).json({ success: true, data: chapter });
  } catch (err) {
    next(err);
  }
}

export async function deleteChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await chapterService.deleteChapter(req.params.id);
    if (!deleted) throw new AppError(404, 'Chapter not found');
    res.json({ success: true, message: 'Chapter deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, slug, description, icon } = req.body as {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
    };
    if (!name || !slug) throw new AppError(400, 'name and slug are required');
    const category = await categoryService.createCategory({ name, slug, description, icon });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const { devices, total } = await deviceService.getAllDevices(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    res.json({
      success: true,
      data: devices,
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

export async function listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query as { status?: 'pending' | 'approved' | 'rejected' };
    const submissions = await submissionService.getAllSubmissions(status);
    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
}

export async function listVoiceRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rooms = getRoomList();
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
}

export async function approveSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { note } = req.body as { note?: string };
    const submission = await submissionService.updateSubmissionStatus(id, 'approved', note);
    if (!submission) throw new AppError(404, 'Submission not found');
    res.json({ success: true, data: submission, message: 'Kitap onaylandı' });
  } catch (err) {
    next(err);
  }
}

export async function rejectSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { note } = req.body as { note?: string };
    const submission = await submissionService.updateSubmissionStatus(id, 'rejected', note);
    if (!submission) throw new AppError(404, 'Submission not found');
    res.json({ success: true, data: submission, message: 'Kitap reddedildi' });
  } catch (err) {
    next(err);
  }
}
