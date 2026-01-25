import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

import { config, validateConfig } from './config';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './config/redis';
import routes from './routes';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware';
import { logger } from './utils';

// Swagger yapılandırması
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sesli Kitap API',
      version: '1.0.0',
      description: 'Sesli Kitap Uygulaması Backend API Dokümantasyonu',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        DeviceId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Device-ID',
          description: 'Cihaz kimliği (UUID formatında)',
        },
        AdminKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Admin-Key',
          description: 'Admin API anahtarı',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Express uygulaması oluştur
const app: Express = express();

// Middleware'ler
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Admin-Key'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiLimiter);

// Static dosyalar (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger UI
if (config.swaggerEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sesli Kitap API Docs',
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use(config.apiPrefix, routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Sunucuyu başlat
const startServer = async (): Promise<void> => {
  try {
    // Config doğrula
    validateConfig();

    // Veritabanı bağlantısı
    await initializeDatabase();

    // Redis bağlantısı (opsiyonel)
    await initializeRedis();

    // Sunucuyu başlat
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('🚀 ======================================');
      console.log(`🎧 Sesli Kitap API Sunucusu`);
      console.log('======================================');
      console.log(`📍 URL: http://localhost:${config.port}`);
      console.log(`📚 API: http://localhost:${config.port}${config.apiPrefix}`);
      if (config.swaggerEnabled) {
        console.log(`📖 Docs: http://localhost:${config.port}/api-docs`);
      }
      console.log(`🔧 Mode: ${config.nodeEnv}`);
      console.log('======================================');
      console.log('');
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} alındı. Sunucu kapatılıyor...`);

      server.close(async () => {
        console.log('HTTP sunucusu kapatıldı');

        await closeDatabase();
        await closeRedis();

        console.log('Tüm bağlantılar kapatıldı. Çıkış yapılıyor.');
        process.exit(0);
      });

      // 10 saniye içinde kapanmazsa zorla kapat
      setTimeout(() => {
        console.error('Zorla kapatılıyor...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

// Uygulamayı başlat
startServer();

export default app;
