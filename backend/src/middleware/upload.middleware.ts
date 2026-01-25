import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { uploadConfig } from '../config/storage';
import { sanitizeFilename } from '../utils/helpers';
import { errorResponse } from '../utils/helpers';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath: string;

    if (file.fieldname === 'cover') {
      uploadPath = path.join(uploadConfig.uploadDir, 'covers');
    } else if (file.fieldname === 'audio') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      uploadPath = path.join(uploadConfig.dataDir, 'audio', String(year), month);
    } else if (file.fieldname === 'transcript') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      uploadPath = path.join(uploadConfig.dataDir, 'transcripts', String(year), month);
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadConfig.uploadDir, 'avatars');
    } else {
      uploadPath = uploadConfig.uploadDir;
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const name = sanitizeFilename(path.basename(file.originalname, ext));
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    cb(null, `${name}_${timestamp}_${random}${ext}`);
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes: Record<string, string[]> = {
    cover: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    transcript: ['text/plain', 'text/srt', 'text/vtt', 'application/x-subrip'],
    avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  };

  const fieldMimes = allowedMimes[file.fieldname] || [];

  // Also check file extension for transcript files
  if (file.fieldname === 'transcript') {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.txt', '.srt', '.vtt'];
    if (allowedExts.includes(ext) || fieldMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
  }

  if (fieldMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${fieldMimes.join(', ')}`));
  }
};

// Multer instance for audio and large files
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

// Multer instance for transcript files (smaller size limit)
export const uploadTranscript = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxTranscriptSize,
  },
});

// Middleware for cover upload
export const uploadCover = upload.single('cover');

// Middleware for audio upload
export const uploadAudio = upload.single('audio');

// Middleware for transcript upload
export const uploadTranscriptFile = uploadTranscript.single('transcript');

// Middleware for avatar upload
export const uploadAvatar = upload.single('avatar');

// Error handler for multer
export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  next: (err?: Error) => void
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      (res as any).status(400).json(
        errorResponse('FILE_TOO_LARGE', 'File size exceeds maximum allowed size')
      );
      return;
    }
    (res as any).status(400).json(
      errorResponse('UPLOAD_ERROR', err.message)
    );
    return;
  }

  if (err.message.includes('Invalid file type')) {
    (res as any).status(400).json(
      errorResponse('INVALID_FILE_TYPE', err.message)
    );
    return;
  }

  next(err);
};

