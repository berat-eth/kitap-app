import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import path from 'path';
import { AuthenticatedRequest, Chapter } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';
import { StorageService } from '../services/storage.service';
import { config } from '../config/env';

export class ChaptersController {
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [chapters] = await pool.execute<(Chapter & RowDataPacket)[]>(
        'SELECT * FROM chapters WHERE id = ?',
        [id]
      );

      if (chapters.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }

      res.status(200).json(successResponse(chapters[0]));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch chapter'));
    }
  }

  static async getAudioUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [chapters] = await pool.execute<(Chapter & RowDataPacket)[]>(
        'SELECT audio_file_url FROM chapters WHERE id = ?',
        [id]
      );

      if (chapters.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }

      res.status(200).json(
        successResponse({
          audioUrl: chapters[0].audio_file_url,
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch audio URL'));
    }
  }

  static async getTranscriptUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [chapters] = await pool.execute<(Chapter & RowDataPacket)[]>(
        'SELECT transcript_file_url FROM chapters WHERE id = ?',
        [id]
      );

      if (chapters.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }

      if (!chapters[0].transcript_file_url) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Transcript not found for this chapter'));
        return;
      }

      res.status(200).json(
        successResponse({
          transcriptUrl: chapters[0].transcript_file_url,
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch transcript URL'));
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const pool = getPool();
      const {
        book_id,
        title,
        order_number,
        audio_file_url,
        audio_file_size = null,
        transcript_file_url = null,
        transcript_file_size = null,
        duration_seconds = 0,
      } = req.body;

      // Verify book exists
      const [books] = await pool.execute<RowDataPacket[]>('SELECT id FROM books WHERE id = ?', [book_id]);
      if (Array.isArray(books) && books.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      const [result] = await pool.execute(
        `INSERT INTO chapters (book_id, title, order_number, audio_file_url, audio_file_size, transcript_file_url, transcript_file_size, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [book_id, title, order_number, audio_file_url, audio_file_size, transcript_file_url, transcript_file_size, duration_seconds]
      );

      const insertResult = result as { insertId: number };
      const [chapters] = await pool.execute<(Chapter & RowDataPacket)[]>('SELECT * FROM chapters WHERE id = ?', [
        insertResult.insertId,
      ]);

      res.status(201).json(successResponse(chapters[0], 'Chapter created successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create chapter'));
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<(Chapter & RowDataPacket)[]>(
        'SELECT * FROM chapters WHERE id = ?',
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      const allowedFields = [
        'title',
        'order_number',
        'audio_file_url',
        'audio_file_size',
        'transcript_file_url',
        'transcript_file_size',
        'duration_seconds',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }

      if (updates.length === 0) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No fields to update'));
        return;
      }

      values.push(id);
      await pool.execute(`UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`, values);

      const [chapters] = await pool.execute<(Chapter & RowDataPacket)[]>('SELECT * FROM chapters WHERE id = ?', [
        id,
      ]);
      res.status(200).json(successResponse(chapters[0], 'Chapter updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update chapter'));
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<(Chapter & RowDataPacket)[]>(
        'SELECT * FROM chapters WHERE id = ?',
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Chapter not found'));
        return;
      }

      const chapter = existing[0];

      // Delete transcript file if exists
      if (chapter.transcript_file_url) {
        try {
          // Extract file path from URL
          const urlPath = chapter.transcript_file_url.replace('/data', '').replace(/^\//, '');
          const filePath = path.join(config.data.dir, urlPath);
          await StorageService.deleteFile(filePath);
        } catch (error) {
          // Log error but don't fail the deletion
          console.error('Error deleting transcript file:', error);
        }
      }

      await pool.execute('DELETE FROM chapters WHERE id = ?', [id]);
      res.status(200).json(successResponse(null, 'Chapter deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete chapter'));
    }
  }
}

