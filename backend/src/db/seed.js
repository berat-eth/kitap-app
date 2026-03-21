// Seed/mock data script for local/dev usage.
// Usage:
//   node src/db/seed.js
//   node src/db/seed.js --reset   (clears tables first)
//
// NOTE: This uses deterministic UUIDs so running it multiple times won't
// spam duplicate rows (unless --reset is provided).

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function resolveEnvPath() {
  if (process.env.ENV_PATH) return process.env.ENV_PATH;
  const central = '/root/data/.env';
  if (fs.existsSync(central)) return central;
  return path.join(__dirname, '..', '..', '.env');
}

dotenv.config({ path: resolveEnvPath(), override: true });

const { initDb } = require('./init');
const pool = require('./pool');
const { logger } = require('../utils/logger');

// Deterministic UUIDs (same dataset each run)
const DEVICES = [
  { id: '11111111-1111-1111-1111-111111111111', deviceName: 'Demo Web', platform: 'web' },
  { id: '22222222-2222-2222-2222-222222222222', deviceName: 'Demo iOS', platform: 'ios' },
];

const CATEGORIES = [
  { name: 'Korku', slug: 'korku', icon_url: null, description: 'Gerilim ve korku hikayeleri.' },
  { name: 'Bilim Kurgu', slug: 'bilimkurgu', icon_url: null, description: 'Uzay, teknoloji ve gelecek.' },
  { name: 'Romantik', slug: 'romantik', icon_url: null, description: 'Duygusal ve romantik hikayeler.' },
];

const BOOKS = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Korku Evi',
    author: 'Ayşe Yılmaz',
    description: 'Karanlığın içinden gelen sesler...',
    categorySlug: 'korku',
    cover_url: null, // filled at runtime
    duration_seconds: 60 * 45,
    play_count: 120,
    rating: 4.6,
    is_premium: 0,
    is_active: 1,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Uzay Mektupları',
    author: 'Mert Kaya',
    description: 'Zamanın büküldüğü mektuplar.',
    categorySlug: 'bilimkurgu',
    cover_url: null, // filled at runtime
    duration_seconds: 60 * 40,
    play_count: 95,
    rating: 4.4,
    is_premium: 0,
    is_active: 1,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Kalp Ritmi',
    author: 'Elif Demir',
    description: 'Aşk, ritim ve hafızanın izi.',
    categorySlug: 'romantik',
    cover_url: null, // filled at runtime
    duration_seconds: 60 * 35,
    play_count: 70,
    rating: 4.3,
    is_premium: 0,
    is_active: 1,
  },
];

const CHAPTERS = [
  // Korku Evi
  { id: '10000000-0000-0000-0000-000000000001', bookId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'Bölüm 1: Kapı Aralığı', order_no: 1, duration_seconds: 60 * 15, audio_file: 'seed/korku-ev/b1.mp3' },
  { id: '10000000-0000-0000-0000-000000000002', bookId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'Bölüm 2: Fısıltılar', order_no: 2, duration_seconds: 60 * 15, audio_file: 'seed/korku-ev/b2.mp3' },
  { id: '10000000-0000-0000-0000-000000000003', bookId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'Bölüm 3: Son Yankı', order_no: 3, duration_seconds: 60 * 15, audio_file: 'seed/korku-ev/b3.mp3' },

  // Uzay Mektupları
  { id: '20000000-0000-0000-0000-000000000001', bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Bölüm 1: İlk Mesaj', order_no: 1, duration_seconds: 60 * 13, audio_file: 'seed/uzay-mektuplari/b1.mp3' },
  { id: '20000000-0000-0000-0000-000000000002', bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Bölüm 2: Zaman Katmanı', order_no: 2, duration_seconds: 60 * 14, audio_file: 'seed/uzay-mektuplari/b2.mp3' },
  { id: '20000000-0000-0000-0000-000000000003', bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Bölüm 3: Dünya’ya Dönüş', order_no: 3, duration_seconds: 60 * 13, audio_file: 'seed/uzay-mektuplari/b3.mp3' },

  // Kalp Ritmi
  { id: '30000000-0000-0000-0000-000000000001', bookId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Bölüm 1: İlk Dokunuş', order_no: 1, duration_seconds: 60 * 12, audio_file: 'seed/kalp-ritmi/b1.mp3' },
  { id: '30000000-0000-0000-0000-000000000002', bookId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Bölüm 2: Ritim Atışı', order_no: 2, duration_seconds: 60 * 12, audio_file: 'seed/kalp-ritmi/b2.mp3' },
  { id: '30000000-0000-0000-0000-000000000003', bookId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Bölüm 3: Sonsuz An', order_no: 3, duration_seconds: 60 * 11, audio_file: 'seed/kalp-ritmi/b3.mp3' },
];

const FAVORITES = [
  { id: '50000000-0000-0000-0000-000000000001', deviceId: '11111111-1111-1111-1111-111111111111', bookId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
  { id: '50000000-0000-0000-0000-000000000002', deviceId: '11111111-1111-1111-1111-111111111111', bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
  { id: '50000000-0000-0000-0000-000000000003', deviceId: '22222222-2222-2222-2222-222222222222', bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
];

const PROGRESS = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    deviceId: '11111111-1111-1111-1111-111111111111',
    bookId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    chapterId: '10000000-0000-0000-0000-000000000001',
    positionSeconds: 60 * 2 + 30,
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    deviceId: '11111111-1111-1111-1111-111111111111',
    bookId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    chapterId: '20000000-0000-0000-0000-000000000002',
    positionSeconds: 60 * 0 + 45,
  },
];

const NOTIFICATIONS = [
  { id: '70000000-0000-0000-0000-000000000001', title: 'Wirbooks demo bildirimi', body: 'Bu bildirim seed amaçlıdır.', type: 'info', target: 'all', target_device_id: null },
];

function isReset() {
  return process.argv.includes('--reset');
}

async function resetTables() {
  // Order matters due to foreign keys.
  await pool.query('DELETE FROM notifications');
  await pool.query('DELETE FROM listening_progress');
  await pool.query('DELETE FROM device_favorites');
  await pool.query('DELETE FROM chapters');
  await pool.query('DELETE FROM books');
  await pool.query('DELETE FROM categories');
  await pool.query('DELETE FROM device_tokens');
}

async function getCategoryIdBySlug(slug) {
  const [rows] = await pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [slug]);
  return rows.length ? rows[0].id : null;
}

async function main() {
  const reset = isReset();
  const uploadBaseUrl = process.env.UPLOAD_BASE_URL || 'https://api.wirbooks.com.tr';

  await initDb();

  if (reset) {
    logger.warn('db.seed.reset.tables', {});
    await resetTables();
  }

  // 1) device_tokens
  for (const d of DEVICES) {
    await pool.query(
      `
      INSERT INTO device_tokens (id, device_name, platform)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        device_name = VALUES(device_name),
        platform = VALUES(platform)
      `,
      [d.id, d.deviceName, d.platform]
    );
  }

  // 2) categories
  for (const c of CATEGORIES) {
    await pool.query(
      `
      INSERT INTO categories (name, slug, icon_url, description)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        icon_url = VALUES(icon_url),
        description = VALUES(description)
      `,
      [c.name, c.slug, c.icon_url, c.description]
    );
  }

  // Resolve category ids
  const categoryIdBySlug = {};
  for (const c of CATEGORIES) {
    const id = await getCategoryIdBySlug(c.slug);
    if (!id) throw new Error(`Seed category not found: ${c.slug}`);
    categoryIdBySlug[c.slug] = id;
  }

  // 3) books
  for (const b of BOOKS) {
    const coverUrl = b.cover_url || `${uploadBaseUrl}/uploads/covers/seed-${b.id.slice(0, 8)}.jpg`;
    await pool.query(
      `
      INSERT INTO books
        (id, title, author, description, category_id, cover_url, duration_seconds, play_count, rating, is_premium, is_active)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        author = VALUES(author),
        description = VALUES(description),
        category_id = VALUES(category_id),
        cover_url = VALUES(cover_url),
        duration_seconds = VALUES(duration_seconds),
        play_count = VALUES(play_count),
        rating = VALUES(rating),
        is_premium = VALUES(is_premium),
        is_active = VALUES(is_active)
      `,
      [
        b.id,
        b.title,
        b.author,
        b.description,
        categoryIdBySlug[b.categorySlug],
        coverUrl,
        b.duration_seconds,
        b.play_count,
        b.rating,
        b.is_premium,
        b.is_active,
      ]
    );
  }

  // 4) chapters
  for (const ch of CHAPTERS) {
    const audioUrl = `${uploadBaseUrl}/uploads/audio/${ch.audio_file.split('/').pop()}`;
    await pool.query(
      `
      INSERT INTO chapters
        (id, book_id, title, order_no, audio_url, duration_seconds)
      VALUES
        (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        book_id = VALUES(book_id),
        title = VALUES(title),
        order_no = VALUES(order_no),
        audio_url = VALUES(audio_url),
        duration_seconds = VALUES(duration_seconds)
      `,
      [ch.id, ch.bookId, ch.title, ch.order_no, audioUrl, ch.duration_seconds]
    );
  }

  // 5) device_favorites
  for (const f of FAVORITES) {
    await pool.query(
      `
      INSERT INTO device_favorites (id, device_id, book_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        device_id = VALUES(device_id),
        book_id = VALUES(book_id)
      `,
      [f.id, f.deviceId, f.bookId]
    );
  }

  // 6) listening_progress
  for (const p of PROGRESS) {
    await pool.query(
      `
      INSERT INTO listening_progress (id, device_id, book_id, chapter_id, position_seconds)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        chapter_id = VALUES(chapter_id),
        position_seconds = VALUES(position_seconds)
      `,
      [p.id, p.deviceId, p.bookId, p.chapterId, p.positionSeconds]
    );
  }

  // 7) notifications
  for (const n of NOTIFICATIONS) {
    await pool.query(
      `
      INSERT INTO notifications (id, title, body, type, target, target_device_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        body = VALUES(body),
        type = VALUES(type),
        target = VALUES(target),
        target_device_id = VALUES(target_device_id)
      `,
      [n.id, n.title, n.body, n.type, n.target, n.target_device_id]
    );
  }

  logger.info('db.seed.done', {
    reset,
    devices: DEVICES.map((d) => d.id),
    books: BOOKS.map((b) => b.id),
  });

  console.log('Seed tamamlandı.');
  console.log('Cihaz ID örnekleri (X-Device-ID):');
  for (const d of DEVICES) console.log(`- ${d.deviceName}: ${d.id}`);
  console.log('Kitap ID örnekleri:');
  for (const b of BOOKS) console.log(`- ${b.title}: ${b.id}`);
  console.log('İlerleme örneği: deviceId -> bookId -> chapterId');
  for (const p of PROGRESS) console.log(`- ${p.deviceId} -> ${p.bookId} -> ${p.chapterId}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('db.seed.failed', { message: err.message, stack: err.stack });
    console.error('Seed başarısız:', err.message);
    process.exit(1);
  });

