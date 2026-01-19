import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { ensureUploadDirectories, uploadConfig } from './config/storage';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Routes
import deviceRoutes from './routes/device.routes';
import adminAuthRoutes from './routes/admin-auth.routes';
import booksRoutes from './routes/books.routes';
import chaptersRoutes from './routes/chapters.routes';
import categoriesRoutes from './routes/categories.routes';
import progressRoutes from './routes/progress.routes';
import favoritesRoutes from './routes/favorites.routes';
import downloadsRoutes from './routes/downloads.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import uploadRoutes from './routes/upload.routes';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
  });

  const adminLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.adminMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use('/api/', limiter);
  app.use('/api/admin/', adminLimiter);

  // Ensure upload directories exist
  ensureUploadDirectories();

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use('/api/device', deviceRoutes);
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/books', booksRoutes);
  app.use('/api/chapters', chaptersRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/downloads', downloadsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/upload', uploadRoutes);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadConfig.uploadDir));

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

