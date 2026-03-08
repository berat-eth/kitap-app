require('dotenv').config();
const express = require('express');
const { initDatabase } = require('./config/dbInit');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const { bookChaptersRouter, chapterActionsRouter } = require('./routes/chapters.routes');
const categoriesRoutes = require('./routes/categories.routes');
const usersRoutes = require('./routes/users.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Çok fazla istek, lütfen daha sonra tekrar deneyin.' },
});
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/books/:bookId/chapters', bookChaptersRouter);
app.use('/api/chapters', chapterActionsRouter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Sesli Kitap API', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ success: false, message: err.message || 'Sunucu hatası' });
});

async function start() {
  try {
    await initDatabase();
    logger.info('Database initialized');
  } catch (err) {
    logger.error('Database init failed:', err);
    process.exit(1);
  }
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();
