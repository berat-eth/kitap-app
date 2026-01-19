import fs from 'fs';
import path from 'path';

// Fix: config.upload is not defined, use direct access
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const ensureUploadDirectories = (): void => {
  const directories = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'covers'),
    path.join(UPLOAD_DIR, 'audio'),
    path.join(UPLOAD_DIR, 'audio', 'books'),
    path.join(UPLOAD_DIR, 'audio', 'chapters'),
    path.join(UPLOAD_DIR, 'avatars'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

export const getUploadPath = (type: 'cover' | 'audio' | 'avatar', filename: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  let baseDir: string;
  switch (type) {
    case 'cover':
      baseDir = path.join(UPLOAD_DIR, 'covers');
      break;
    case 'audio':
      baseDir = path.join(UPLOAD_DIR, 'audio', 'chapters', String(year), month);
      break;
    case 'avatar':
      baseDir = path.join(UPLOAD_DIR, 'avatars');
      break;
    default:
      baseDir = UPLOAD_DIR;
  }

  // Ensure directory exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return path.join(baseDir, filename);
};

export const getPublicUrl = (filePath: string): string => {
  // Remove upload directory from path to get relative path
  const relativePath = filePath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// Export config for upload middleware
export const uploadConfig = {
  uploadDir: UPLOAD_DIR,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10),
  maxCoverSize: parseInt(process.env.MAX_COVER_SIZE || '5242880', 10),
};
