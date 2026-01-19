import { getPool } from '../config/database';
import { User, UserCreateInput, UserUpdateInput } from '../types';
import logger from '../utils/logger';

export class DeviceService {
  static async findOrCreateUser(deviceId: string): Promise<User> {
    const pool = getPool();

    // Find existing user
    const [users] = await pool.execute<Array<User>>(
      'SELECT * FROM users WHERE device_id = ?',
      [deviceId]
    );

    if (users.length > 0) {
      // Update last_active_at
      await pool.execute('UPDATE users SET last_active_at = NOW() WHERE id = ?', [users[0].id]);
      return users[0];
    }

    // Create new user
    const name = `User_${deviceId.substring(0, 8)}`;
    const [result] = await pool.execute(
      'INSERT INTO users (device_id, name, role, last_active_at) VALUES (?, ?, ?, NOW())',
      [deviceId, name, 'user']
    );

    const insertResult = result as { insertId: number };
    const [newUsers] = await pool.execute<Array<User>>(
      'SELECT * FROM users WHERE id = ?',
      [insertResult.insertId]
    );

    logger.info(`New user created with device_id: ${deviceId}`);
    return newUsers[0];
  }

  static async getUserByDeviceId(deviceId: string): Promise<User | null> {
    const pool = getPool();
    const [users] = await pool.execute<Array<User>>(
      'SELECT * FROM users WHERE device_id = ?',
      [deviceId]
    );

    return users.length > 0 ? users[0] : null;
  }

  static async updateUser(userId: number, data: UserUpdateInput): Promise<User> {
    const pool = getPool();
    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatar_url);
    }

    if (data.last_active_at !== undefined) {
      updates.push('last_active_at = ?');
      values.push(data.last_active_at);
    }

    if (updates.length === 0) {
      // Return existing user if no updates
      const [users] = await pool.execute<Array<User>>('SELECT * FROM users WHERE id = ?', [userId]);
      return users[0];
    }

    values.push(userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [users] = await pool.execute<Array<User>>('SELECT * FROM users WHERE id = ?', [userId]);
    return users[0];
  }
}

