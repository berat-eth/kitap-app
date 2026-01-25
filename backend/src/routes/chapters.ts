import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Chapter } from '../entities/Chapter';
import { ApiResponse } from '../types';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';

const router = Router();
const chapterRepository = () => AppDataSource.getRepository(Chapter);

/**
 * GET /api/chapters/:id
 * Bölüm detayı
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const chapterId = parseInt(req.params.id, 10);

    const chapter = await chapterRepository().findOne({
      where: { id: chapterId },
      relations: ['book'],
    });

    if (!chapter) {
      throw new NotFoundError('Bölüm bulunamadı');
    }

    const response: ApiResponse = {
      success: true,
      data: chapter,
    };

    res.json(response);
  })
);

/**
 * GET /api/chapters/:id/stream
 * Ses streaming URL'i döndür
 */
router.get(
  '/:id/stream',
  asyncHandler(async (req: Request, res: Response) => {
    const chapterId = parseInt(req.params.id, 10);

    const chapter = await chapterRepository().findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundError('Bölüm bulunamadı');
    }

    // Ses URL'ini döndür
    // Gerçek uygulamada burada ses dosyası streaming yapılabilir
    // veya signed URL oluşturulabilir
    const response: ApiResponse = {
      success: true,
      data: {
        audioUrl: chapter.audioUrl,
        duration: chapter.duration,
        title: chapter.title,
      },
    };

    res.json(response);
  })
);

export default router;
