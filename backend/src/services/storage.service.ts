import fs from 'fs';
import path from 'path';
import { getUploadPath, getPublicUrl, deleteFile as deleteFileUtil } from '../config/storage';
import logger from '../utils/logger';

export class StorageService {
  static async saveFile(
    type: 'cover' | 'audio' | 'avatar' | 'transcript',
    file: Express.Multer.File
  ): Promise<{ filePath: string; publicUrl: string }> {
    const filename = file.filename;
    const filePath = getUploadPath(type, filename);
    const publicUrl = getPublicUrl(filePath);

    logger.info(`File saved: ${filePath}`);
    return { filePath, publicUrl };
  }

  static async deleteFile(filePath: string): Promise<void> {
    await deleteFileUtil(filePath);
    logger.info(`File deleted: ${filePath}`);
  }

  static async fileExists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`Error getting file size for ${filePath}:`, error);
      return 0;
    }
  }

  static async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(newPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.renameSync(oldPath, newPath);
      logger.info(`File moved from ${oldPath} to ${newPath}`);
    } catch (error) {
      logger.error(`Error moving file from ${oldPath} to ${newPath}:`, error);
      throw error;
    }
  }
}

