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
  extra: {
    connectionLimit: 10,
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Veritabanı bağlantısı başarılı');
    }
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    throw error;
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
