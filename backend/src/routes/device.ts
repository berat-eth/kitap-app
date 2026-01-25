import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { Progress } from '../entities/Progress';
import { Favorite } from '../entities/Favorite';
import { Book } from '../entities/Book';
import { Review } from '../entities/Review';
import {
  ApiResponse,
  DeviceRequest,
  RegisterDeviceDTO,
  SaveProgressDTO,
  CreateReviewDTO,
  DeviceStats,
} from '../types';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { deviceAuth } from '../middleware/deviceAuth';
import { validate, progressValidations, reviewValidations } from '../middleware/validator';

const router = Router();
const deviceRepository = () => AppDataSource.getRepository(Device);
const progressRepository = () => AppDataSource.getRepository(Progress);
const favoriteRepository = () => AppDataSource.getRepository(Favorite);
const bookRepository = () => AppDataSource.getRepository(Book);
const reviewRepository = () => AppDataSource.getRepository(Review);

/**
 * POST /api/device/register
 * Yeni cihaz kaydı
 */
router.post(
  '/register',
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const { deviceName, platform } = req.body as RegisterDeviceDTO;

    // Yeni device ID oluştur
    const deviceId = uuidv4();

    const device = deviceRepository().create({
      deviceId,
      deviceName: deviceName || 'Unknown Device',
      platform: platform || 'unknown',
    });

    await deviceRepository().save(device);

    const response: ApiResponse = {
      success: true,
      data: {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        platform: device.platform,
        createdAt: device.createdAt,
      },
      message: 'Cihaz başarıyla kaydedildi',
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/device/stats
 * Cihaz istatistikleri
 */
router.get(
  '/stats',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;

    // İstatistikleri hesapla
    const totalBooksStarted = await progressRepository().count({
      where: { deviceId: device.id },
    });

    const totalBooksCompleted = await progressRepository().count({
      where: { deviceId: device.id, isCompleted: true },
    });

    const progressList = await progressRepository().find({
      where: { deviceId: device.id },
    });

    const totalListeningTime = progressList.reduce(
      (sum, p) => sum + p.currentTime,
      0
    );

    const favoritesCount = await favoriteRepository().count({
      where: { deviceId: device.id },
    });

    const reviewsCount = await reviewRepository().count({
      where: { deviceId: device.id },
    });

    const stats: DeviceStats = {
      totalBooksStarted,
      totalBooksCompleted,
      totalListeningTime,
      favoritesCount,
      reviewsCount,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  })
);

/**
 * GET /api/device/progress
 * Tüm ilerleme kayıtları
 */
router.get(
  '/progress',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;

    const progressList = await progressRepository().find({
      where: { deviceId: device.id },
      relations: ['book', 'chapter'],
      order: { lastPlayedAt: 'DESC' },
    });

    const response: ApiResponse = {
      success: true,
      data: progressList,
    };

    res.json(response);
  })
);

/**
 * GET /api/device/progress/:bookId
 * Belirli bir kitabın ilerlemesi
 */
router.get(
  '/progress/:bookId',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;
    const bookId = parseInt(req.params.bookId, 10);

    const progress = await progressRepository().findOne({
      where: { deviceId: device.id, bookId },
      relations: ['book', 'chapter'],
    });

    if (!progress) {
      const response: ApiResponse = {
        success: true,
        data: null,
        message: 'Bu kitap için ilerleme kaydı bulunamadı',
      };
      res.json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: progress,
    };

    res.json(response);
  })
);

/**
 * POST /api/device/progress/:bookId
 * İlerleme kaydet/güncelle
 */
router.post(
  '/progress/:bookId',
  deviceAuth,
  validate(progressValidations.save),
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;
    const bookId = parseInt(req.params.bookId, 10);
    const { chapterId, currentTime, isCompleted } = req.body as SaveProgressDTO;

    // Kitap var mı kontrol et
    const book = await bookRepository().findOne({
      where: { id: bookId, isActive: true },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    // Mevcut ilerleme var mı kontrol et
    let progress = await progressRepository().findOne({
      where: { deviceId: device.id, bookId },
    });

    if (progress) {
      // Güncelle
      progress.chapterId = chapterId || progress.chapterId;
      progress.currentTime = currentTime;
      progress.isCompleted = isCompleted ?? progress.isCompleted;
      progress.lastPlayedAt = new Date();
    } else {
      // Yeni oluştur
      progress = progressRepository().create({
        deviceId: device.id,
        bookId,
        chapterId,
        currentTime,
        isCompleted: isCompleted || false,
      });
    }

    await progressRepository().save(progress);

    const response: ApiResponse = {
      success: true,
      data: progress,
      message: 'İlerleme kaydedildi',
    };

    res.json(response);
  })
);

/**
 * GET /api/device/favorites
 * Favori kitaplar
 */
router.get(
  '/favorites',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;

    const favorites = await favoriteRepository().find({
      where: { deviceId: device.id },
      relations: ['book', 'book.category'],
      order: { createdAt: 'DESC' },
    });

    // Sadece aktif kitapları filtrele
    const activeFavorites = favorites.filter((f) => f.book?.isActive);

    const response: ApiResponse = {
      success: true,
      data: activeFavorites.map((f) => f.book),
    };

    res.json(response);
  })
);

/**
 * POST /api/device/favorites/:bookId
 * Favorilere ekle
 */
router.post(
  '/favorites/:bookId',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;
    const bookId = parseInt(req.params.bookId, 10);

    // Kitap var mı kontrol et
    const book = await bookRepository().findOne({
      where: { id: bookId, isActive: true },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    // Zaten favorilerde mi kontrol et
    const existing = await favoriteRepository().findOne({
      where: { deviceId: device.id, bookId },
    });

    if (existing) {
      const response: ApiResponse = {
        success: true,
        message: 'Kitap zaten favorilerde',
      };
      res.json(response);
      return;
    }

    const favorite = favoriteRepository().create({
      deviceId: device.id,
      bookId,
    });

    await favoriteRepository().save(favorite);

    const response: ApiResponse = {
      success: true,
      message: 'Kitap favorilere eklendi',
    };

    res.status(201).json(response);
  })
);

/**
 * DELETE /api/device/favorites/:bookId
 * Favorilerden çıkar
 */
router.delete(
  '/favorites/:bookId',
  deviceAuth,
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;
    const bookId = parseInt(req.params.bookId, 10);

    const result = await favoriteRepository().delete({
      deviceId: device.id,
      bookId,
    });

    if (result.affected === 0) {
      throw new NotFoundError('Favori bulunamadı');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Kitap favorilerden çıkarıldı',
    };

    res.json(response);
  })
);

/**
 * POST /api/device/reviews/:bookId
 * Yorum ekle
 */
router.post(
  '/reviews/:bookId',
  deviceAuth,
  validate(reviewValidations.create),
  asyncHandler(async (req: DeviceRequest, res: Response) => {
    const device = req.device!;
    const bookId = parseInt(req.params.bookId, 10);
    const { rating, comment, reviewerName } = req.body as CreateReviewDTO;

    // Kitap var mı kontrol et
    const book = await bookRepository().findOne({
      where: { id: bookId, isActive: true },
    });

    if (!book) {
      throw new NotFoundError('Kitap bulunamadı');
    }

    // Zaten yorum yapmış mı kontrol et
    const existing = await reviewRepository().findOne({
      where: { deviceId: device.id, bookId },
    });

    if (existing) {
      // Güncelle
      existing.rating = rating;
      existing.comment = comment;
      existing.reviewerName = reviewerName;
      await reviewRepository().save(existing);

      // Kitap rating'ini güncelle
      await updateBookRating(bookId);

      const response: ApiResponse = {
        success: true,
        data: existing,
        message: 'Yorum güncellendi',
      };
      res.json(response);
      return;
    }

    // Yeni yorum oluştur
    const review = reviewRepository().create({
      deviceId: device.id,
      bookId,
      rating,
      comment,
      reviewerName,
    });

    await reviewRepository().save(review);

    // Kitap rating'ini güncelle
    await updateBookRating(bookId);

    const response: ApiResponse = {
      success: true,
      data: review,
      message: 'Yorum eklendi',
    };

    res.status(201).json(response);
  })
);

// Yardımcı fonksiyon: Kitap rating'ini güncelle
async function updateBookRating(bookId: number): Promise<void> {
  const result = await reviewRepository()
    .createQueryBuilder('review')
    .select('AVG(review.rating)', 'avgRating')
    .addSelect('COUNT(*)', 'count')
    .where('review.bookId = :bookId', { bookId })
    .getRawOne();

  if (result) {
    await bookRepository().update(bookId, {
      rating: parseFloat(result.avgRating) || 0,
      ratingCount: parseInt(result.count, 10) || 0,
    });
  }
}

export default router;
