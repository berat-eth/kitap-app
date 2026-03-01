import { Request, Response, NextFunction } from 'express';
import * as chapterService from '../services/chapterService';
import * as bookService from '../services/bookService';
import { AppError } from '../middleware/errorHandler';

export async function streamChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chapter = await chapterService.getChapterById(req.params.id);
    if (!chapter) throw new AppError(404, 'Chapter not found');

    await bookService.incrementPlayCount(chapter.book_id);

    res.json({
      success: true,
      data: {
        chapterId: chapter.id,
        audioUrl: chapter.audio_url,
        duration: chapter.duration,
        title: chapter.title,
      },
    });
  } catch (err) {
    next(err);
  }
}
