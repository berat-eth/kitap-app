import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import path from 'path';

// Entity'leri import et
import { Book } from '../entities/Book';
import { Chapter } from '../entities/Chapter';
import { Category } from '../entities/Category';
import { Device } from '../entities/Device';
import { Progress } from '../entities/Progress';
import { Favorite } from '../entities/Favorite';
import { Review } from '../entities/Review';

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  entities: [Book, Chapter, Category, Device, Progress, Favorite, Review],
  synchronize: config.isDevelopment, // Development'ta otomatik sync
  logging: config.isDevelopment ? ['error', 'warn'] : ['error'],
  charset: 'utf8mb4',
  timezone: '+03:00', // Türkiye saati
  connectTimeout: 60000, // 60 saniye bağlantı timeout
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  },
  poolSize: 10,
  maxQueryExecutionTime: 30000, // 30 saniye sorgu timeout
};

export const AppDataSource = new DataSource(dataSourceOptions);

export const initializeDatabase = async (retries = 5, delay = 5000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✅ Veritabanı bağlantısı başarılı');
        return;
      }
      return;
    } catch (error) {
      console.error(`❌ Veritabanı bağlantı hatası (deneme ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      console.log(`⏳ ${delay / 1000} saniye sonra tekrar denenecek...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Veritabanı bağlantısı kapatıldı');
    }
  } catch (error) {
    console.error('❌ Veritabanı kapatma hatası:', error);
    throw error;
  }
};

export default AppDataSource;
