import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { logger, LOG_CONTEXT } from '../utils/logger';

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'submissions');

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const dir = path.join(UPLOAD_DIR, uuidv4());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-wav'];
    const type = file.mimetype;
    if (allowedImages.includes(type) || allowedAudio.includes(type)) {
      cb(null, true);
    } else {
      cb(new Error(`Dosya tipi desteklenmiyor: ${type}`));
    }
  },
});

router.post(
  '/',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.file) {
        throw new AppError(400, 'Dosya yüklenmedi');
      }
      const relativePath = path.relative(path.join(process.cwd(), 'uploads'), req.file.path);
      const pathUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fullUrl = `${baseUrl}${pathUrl}`;
      logger.info(LOG_CONTEXT.UPLOAD, 'File uploaded', {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: pathUrl,
      });
      res.json({ success: true, data: { url: fullUrl, path: pathUrl } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
