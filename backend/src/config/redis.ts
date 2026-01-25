import { createClient, RedisClientType } from 'redis';
import { config } from './index';

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<RedisClientType | null> => {
  if (!config.redis.enabled) {
    console.log('ℹ️ Redis devre dışı - Cache olmadan devam ediliyor');
    return null;
  }

  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis bağlantı hatası:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis bağlantısı başarılı');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis başlatma hatası:', error);
    redisClient = null;
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis bağlantısı kapatıldı');
  }
};

// Cache yardımcı fonksiyonları
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis GET hatası:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds: number = 300 // Varsayılan 5 dakika
): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET hatası:', error);
    return false;
  }
};

export const cacheDelete = async (key: string): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE hatası:', error);
    return false;
  }
};

export const cacheDeletePattern = async (pattern: string): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis DELETE PATTERN hatası:', error);
    return false;
  }
};

export default {
  initializeRedis,
  getRedisClient,
  closeRedis,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
};
