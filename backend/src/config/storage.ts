import fs from 'fs';
import path from 'path';
import { config } from './env';

// Data directory for audio and transcripts
const DATA_DIR = config.data.dir;
// Upload directory for covers and avatars (backward compatibility)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const ensureUploadDirectories = (): void => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const directories = [
    // Data directory structure
    DATA_DIR,
    path.join(DATA_DIR, 'audio'),
    path.join(DATA_DIR, 'audio', String(year)),
    path.join(DATA_DIR, 'audio', String(year), month),
    path.join(DATA_DIR, 'transcripts'),
    path.join(DATA_DIR, 'transcripts', String(year)),
    path.join(DATA_DIR, 'transcripts', String(year), month),
    // Upload directory (backward compatibility)
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'covers'),
    path.join(UPLOAD_DIR, 'avatars'),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

export const getUploadPath = (type: 'cover' | 'audio' | 'avatar' | 'transcript', filename: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  let baseDir: string;
  switch (type) {
    case 'cover':
      baseDir = path.join(UPLOAD_DIR, 'covers');
      break;
    case 'audio':
      baseDir = path.join(DATA_DIR, 'audio', String(year), month);
      break;
    case 'transcript':
      baseDir = path.join(DATA_DIR, 'transcripts', String(year), month);
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
  // Check if file is in data directory
  if (filePath.startsWith(DATA_DIR)) {
    const relativePath = filePath.replace(DATA_DIR, '').replace(/\\/g, '/');
    return `/data${relativePath}`;
  }
  
  // Otherwise, use upload directory (backward compatibility)
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
  dataDir: DATA_DIR,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000', 10),
  maxCoverSize: parseInt(process.env.MAX_COVER_SIZE || '5242880', 10),
  maxTranscriptSize: parseInt(process.env.MAX_TRANSCRIPT_SIZE || '10485760', 10), // 10MB
};
