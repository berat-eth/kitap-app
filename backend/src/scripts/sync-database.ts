import 'reflect-metadata';
import { config, validateConfig } from '../config';
import { AppDataSource } from '../config/database';

/**
 * Veritabanı tablolarını senkronize et
 * Bu script TypeORM entity'lerine göre tabloları oluşturur/günceller
 */
async function syncDatabase(): Promise<void> {
  console.log('🔄 Veritabanı senkronizasyonu başlatılıyor...');
  console.log('');

  try {
    validateConfig();

    // Veritabanına bağlan
    await AppDataSource.initialize();
    console.log('✅ Veritabanı bağlantısı başarılı');

    // Tabloları senkronize et
    await AppDataSource.synchronize();
    console.log('✅ Tablolar başarıyla oluşturuldu/güncellendi');

    // Tablo listesini göster
    const tables = await AppDataSource.query('SHOW TABLES');
    console.log('');
    console.log('📋 Mevcut tablolar:');
    tables.forEach((table: Record<string, string>) => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    console.log('');
    console.log('✅ Veritabanı senkronizasyonu tamamlandı!');

  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

syncDatabase();
