const DB_NAME = process.env.DB_NAME || 'wirbooks';

// JS içinde tutulan raw SQL ifadeleri.
// Not: init.js bu statements’ı startup’ta sırayla çalıştırır.
const statements = [
  // device_tokens
  `CREATE TABLE IF NOT EXISTS device_tokens (
    id CHAR(36) PRIMARY KEY,
    device_name VARCHAR(255),
    platform VARCHAR(20) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // categories
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon_url VARCHAR(500),
    description TEXT NULL
  )`,

  // books
  `CREATE TABLE IF NOT EXISTS books (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NULL,
    device_id CHAR(36) NULL,
    narrator VARCHAR(255) NULL,
    category_id INT NULL,
    cover_url VARCHAR(500) NULL,
    duration_seconds INT DEFAULT 0,
    play_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    is_premium TINYINT(1) DEFAULT 0,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    admin_note TEXT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`,

  // chapters
  `CREATE TABLE IF NOT EXISTS chapters (
    id CHAR(36) PRIMARY KEY,
    book_id CHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    order_no INT NOT NULL,
    audio_url VARCHAR(500) NOT NULL,
    duration_seconds INT DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  )`,

  // device_favorites
  `CREATE TABLE IF NOT EXISTS device_favorites (
    id CHAR(36) PRIMARY KEY,
    device_id CHAR(36) NOT NULL,
    book_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_device_book (device_id, book_id),
    FOREIGN KEY (device_id) REFERENCES device_tokens(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
  )`,

  // listening_progress (device-based)
  `CREATE TABLE IF NOT EXISTS listening_progress (
    id CHAR(36) PRIMARY KEY,
    device_id CHAR(36) NOT NULL,
    book_id CHAR(36) NOT NULL,
    chapter_id CHAR(36) NOT NULL,
    position_seconds INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_device_book (device_id, book_id),
    FOREIGN KEY (device_id) REFERENCES device_tokens(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  )`,

  // notifications (admin flow için; client şu an kullanmıyor olabilir)
  `CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NULL,
    type VARCHAR(50) NULL,
    target ENUM('all','device') NOT NULL DEFAULT 'all',
    target_device_id CHAR(36) NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
];

module.exports = { statements, DB_NAME };

