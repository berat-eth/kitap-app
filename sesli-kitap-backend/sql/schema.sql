-- Sesli Kitap Backend - MySQL Schema
-- Run: mysql -u root -p sesli_kitap < sql/schema.sql

CREATE DATABASE IF NOT EXISTS sesli_kitap;
USE sesli_kitap;

-- users
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  avatar VARCHAR(500),
  refresh_token TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon_url VARCHAR(500)
);

-- books
CREATE TABLE books (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  cover_url VARCHAR(500),
  duration_seconds INT DEFAULT 0,
  play_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_premium TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- chapters
CREATE TABLE chapters (
  id CHAR(36) PRIMARY KEY,
  book_id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  order_no INT NOT NULL,
  audio_url VARCHAR(500) NOT NULL,
  duration_seconds INT DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- listening_progress
CREATE TABLE listening_progress (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  book_id CHAR(36) NOT NULL,
  chapter_id CHAR(36) NOT NULL,
  position_seconds INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- device_tokens
CREATE TABLE device_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token TEXT NOT NULL,
  platform ENUM('ios','android') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- notifications
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50),
  target ENUM('all','user') NOT NULL,
  target_user_id CHAR(36),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
