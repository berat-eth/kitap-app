import { Response } from 'express';
import { AuthenticatedRequest, Category } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';

export class CategoriesController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = getPool();

      const [categories] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE is_active = true ORDER BY name ASC'
      );

      res.status(200).json(successResponse(categories));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch categories'));
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [categories] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );

      if (categories.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Category not found'));
        return;
      }

      res.status(200).json(successResponse(categories[0]));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch category'));
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const pool = getPool();
      const { name, slug, description, icon_url } = req.body;

      const [result] = await pool.execute(
        'INSERT INTO categories (name, slug, description, icon_url) VALUES (?, ?, ?, ?)',
        [name, slug, description || null, icon_url || null]
      );

      const insertResult = result as { insertId: number };
      const [categories] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE id = ?',
        [insertResult.insertId]
      );

      res.status(201).json(successResponse(categories[0], 'Category created successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create category'));
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

      const [existing] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Category not found'));
        return;
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      const allowedFields = ['name', 'slug', 'description', 'icon_url', 'is_active'];

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
      await pool.execute(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);

      const [categories] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      res.status(200).json(successResponse(categories[0], 'Category updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update category'));
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

      const [existing] = await pool.execute<Array<Category>>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Category not found'));
        return;
      }

      // Soft delete by setting is_active to false
      await pool.execute('UPDATE categories SET is_active = false WHERE id = ?', [id]);
      res.status(200).json(successResponse(null, 'Category deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete category'));
    }
  }
}

