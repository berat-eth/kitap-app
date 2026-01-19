import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { getPool } from '../config/database';
import { config } from '../config/env';
import { User, AdminJwtPayload } from '../types';
import logger from '../utils/logger';

export class AdminAuthService {
  static async login(email: string, password: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const pool = getPool();

    // Find user by email
    interface UserRow extends User, RowDataPacket {}
    const [users] = await pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    if (!user.password_hash) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Generate tokens
    const payload: AdminJwtPayload = {
      userId: user.id,
      email: user.email!,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.adminJwt.secret, {
      expiresIn: config.adminJwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.adminJwt.refreshSecret, {
      expiresIn: config.adminJwt.refreshExpiresIn,
    } as jwt.SignOptions);

    // Update last_active_at
    await pool.execute('UPDATE users SET last_active_at = NOW() WHERE id = ?', [user.id]);

    logger.info(`Admin login: ${email}`);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async verifyToken(token: string): Promise<AdminJwtPayload> {
    try {
      const decoded = jwt.verify(token, config.adminJwt.secret) as AdminJwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.adminJwt.refreshSecret) as AdminJwtPayload;

      // Verify user still exists and is admin
      const pool = getPool();
      interface UserRow extends User, RowDataPacket {}
      const [users] = await pool.execute<UserRow[]>(
        'SELECT * FROM users WHERE id = ? AND email = ? AND role = ? AND is_active = ?',
        [decoded.userId, decoded.email, 'admin', true]
      );

      if (users.length === 0) {
        throw new Error('Invalid refresh token');
      }

      const payload: AdminJwtPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      const accessToken = jwt.sign(payload, config.adminJwt.secret, {
        expiresIn: config.adminJwt.expiresIn,
      } as jwt.SignOptions);

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

