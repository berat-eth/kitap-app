import { Request, Response, NextFunction } from 'express';
import * as deviceService from '../services/deviceService';
import * as bookService from '../services/bookService';
import { AppError } from '../middleware/errorHandler';
import { logger, LOG_CONTEXT } from '../utils/logger';

export async function registerDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { deviceName, platform } = req.body as { deviceName?: string; platform?: string };
    const device = await deviceService.registerDevice({ deviceName, platform });
    logger.info(LOG_CONTEXT.DEVICE, 'Device registered', {
      deviceId: device.id,
      deviceName: device.device_name,
      platform: device.platform,
    });
    res.status(201).json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

function getDeviceId(req: Request): string {
  const id = req.headers['x-device-id'] as string;
  if (!id) throw new AppError(400, 'X-Device-ID header is required');
  return id;
}

export async function getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = getDeviceId(req);
    const { bookId } = req.params;

    const book = await bookService.getBookById(bookId);
    if (!book) throw new AppError(404, 'Book not found');

    await deviceService.touchDevice(deviceId);
    const progress = await deviceService.getProgress(deviceId, bookId);
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
}

export async function saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = getDeviceId(req);
    const { bookId } = req.params;
    const { chapterId, currentTime, isCompleted } = req.body as {
      chapterId?: string;
      currentTime: number;
      isCompleted?: boolean;
    };

    if (currentTime === undefined || typeof currentTime !== 'number') {
      throw new AppError(400, 'currentTime (number) is required in request body');
    }

    const book = await bookService.getBookById(bookId);
    if (!book) throw new AppError(404, 'Book not found');

    await deviceService.touchDevice(deviceId);
    const progress = await deviceService.saveProgress({ deviceId, bookId, chapterId, currentTime, isCompleted });
    logger.debug(LOG_CONTEXT.DEVICE, 'Progress saved', { deviceId, bookId, currentTime });
    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = getDeviceId(req);
    await deviceService.touchDevice(deviceId);
    const favorites = await deviceService.getFavorites(deviceId);
    res.json({ success: true, data: favorites });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = getDeviceId(req);
    const { bookId } = req.params;

    const book = await bookService.getBookById(bookId);
    if (!book) throw new AppError(404, 'Book not found');

    await deviceService.addFavorite(deviceId, bookId);
    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deviceId = getDeviceId(req);
    const { bookId } = req.params;
    const removed = await deviceService.removeFavorite(deviceId, bookId);
    if (!removed) throw new AppError(404, 'Favorite not found');
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
}
