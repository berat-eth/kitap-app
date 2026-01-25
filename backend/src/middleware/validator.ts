import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { ApiResponse } from '../types';

// Validation sonuçlarını kontrol et
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Tüm validation'ları çalıştır
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const response: ApiResponse = {
      success: false,
      error: 'Geçersiz veri',
      data: errors.array().map((err) => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg,
      })),
    };

    res.status(400).json(response);
  };
};

// Book Validations
export const bookValidations = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Kitap adı gerekli')
      .isLength({ max: 255 })
      .withMessage('Kitap adı en fazla 255 karakter olabilir'),
    body('author')
      .trim()
      .notEmpty()
      .withMessage('Yazar adı gerekli')
      .isLength({ max: 255 })
      .withMessage('Yazar adı en fazla 255 karakter olabilir'),
    body('narrator')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Anlatıcı adı en fazla 255 karakter olabilir'),
    body('description').optional().trim(),
    body('coverImage')
      .optional()
      .trim()
      .isURL()
      .withMessage('Geçerli bir URL giriniz'),
    body('categoryId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Geçerli bir kategori ID giriniz'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured boolean olmalı'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Geçerli bir kitap ID giriniz'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Kitap adı 1-255 karakter arasında olmalı'),
    body('author')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Yazar adı 1-255 karakter arasında olmalı'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive boolean olmalı'),
  ],
};

// Chapter Validations
export const chapterValidations = {
  create: [
    body('bookId')
      .isInt({ min: 1 })
      .withMessage('Geçerli bir kitap ID giriniz'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Bölüm adı gerekli')
      .isLength({ max: 255 })
      .withMessage('Bölüm adı en fazla 255 karakter olabilir'),
    body('orderNum')
      .isInt({ min: 1 })
      .withMessage('Bölüm sırası 1 veya daha büyük olmalı'),
    body('audioUrl')
      .trim()
      .notEmpty()
      .withMessage('Ses dosyası URL gerekli'),
    body('duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Süre 0 veya daha büyük olmalı'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('Geçerli bir bölüm ID giriniz'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Bölüm adı 1-255 karakter arasında olmalı'),
  ],
};

// Category Validations
export const categoryValidations = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Kategori adı gerekli')
      .isLength({ max: 100 })
      .withMessage('Kategori adı en fazla 100 karakter olabilir'),
    body('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug gerekli')
      .isLength({ max: 100 })
      .withMessage('Slug en fazla 100 karakter olabilir')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug sadece küçük harf, rakam ve tire içerebilir'),
    body('description').optional().trim(),
    body('icon').optional().trim().isLength({ max: 100 }),
  ],
};

// Progress Validations
export const progressValidations = {
  save: [
    param('bookId').isInt({ min: 1 }).withMessage('Geçerli bir kitap ID giriniz'),
    body('chapterId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Geçerli bir bölüm ID giriniz'),
    body('currentTime')
      .isInt({ min: 0 })
      .withMessage('Zaman değeri 0 veya daha büyük olmalı'),
    body('isCompleted')
      .optional()
      .isBoolean()
      .withMessage('isCompleted boolean olmalı'),
  ],
};

// Review Validations
export const reviewValidations = {
  create: [
    param('bookId').isInt({ min: 1 }).withMessage('Geçerli bir kitap ID giriniz'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Puan 1-5 arasında olmalı'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Yorum en fazla 1000 karakter olabilir'),
    body('reviewerName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('İsim en fazla 100 karakter olabilir'),
  ],
};

// Pagination Validations
export const paginationValidations = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sayfa numarası 1 veya daha büyük olmalı'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit 1-100 arasında olmalı'),
];

// ID Parameter Validation
export const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Geçerli bir ID giriniz'),
];
