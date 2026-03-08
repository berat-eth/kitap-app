import { Request, Response, NextFunction } from 'express';
import * as submissionService from '../services/submissionService';
import { AppError } from '../middleware/errorHandler';
import { logger, LOG_CONTEXT } from '../utils/logger';

export async function submitBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    if (!deviceId) {
      logger.warn(LOG_CONTEXT.SUBMIT, 'Submit missing X-Device-ID');
      throw new AppError(400, 'X-Device-ID header is required');
    }

    const body = req.body as {
      title: string;
      author: string;
      narrator: string;
      description?: string;
      category: string;
      cover_image?: string;
      chapters: { title: string; order_num?: number; audio_url: string }[];
    };

    if (!body.title || !body.author || !body.narrator || !body.category) {
      throw new AppError(400, 'title, author, narrator and category are required');
    }

    if (!body.chapters || !Array.isArray(body.chapters) || body.chapters.length === 0) {
      throw new AppError(400, 'At least one chapter with title and audio_url is required');
    }

    const chapters = body.chapters.map((ch, i) => ({
      title: ch.title,
      order_num: ch.order_num ?? i + 1,
      audio_url: ch.audio_url,
    }));

    const invalidChapter = chapters.find(ch => !ch.title?.trim() || !ch.audio_url?.trim());
    if (invalidChapter) {
      throw new AppError(400, 'Each chapter must have title and audio_url');
    }

    const submission = await submissionService.createSubmission({
      device_id: deviceId,
      title: body.title.trim(),
      author: body.author.trim(),
      narrator: body.narrator.trim(),
      description: body.description?.trim(),
      category: body.category.trim(),
      cover_image: body.cover_image?.trim(),
      chapters,
    });

    logger.info(LOG_CONTEXT.SUBMIT, 'Book submission created', {
      submissionId: submission.id,
      deviceId,
      title: body.title.trim(),
      chapterCount: chapters.length,
    });

    res.status(201).json({
      success: true,
      message: 'Kitap başarıyla gönderildi. İnceleme sürecinden sonra yayınlanacaktır.',
      data: {
        id: submission.id,
        status: submission.status,
        created_at: submission.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMySubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = req.headers['x-device-id'] as string;
    if (!deviceId) {
      throw new AppError(400, 'X-Device-ID header is required');
    }

    const submissions = await submissionService.getSubmissionsByDevice(deviceId);
    logger.debug(LOG_CONTEXT.SUBMIT, 'getMySubmissions', { deviceId, count: submissions.length });
    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
}
