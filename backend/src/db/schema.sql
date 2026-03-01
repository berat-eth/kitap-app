-- ============================================================
-- Sesli Kitap - MySQL Schema
-- Veritabanı bağlantısı .env DB_NAME üzerinden sağlanır.
-- Bu script sadece tabloları oluşturur.
-- ============================================================

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(100),
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- books
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id           VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  title        VARCHAR(255)  NOT NULL,
  author       VARCHAR(255)  NOT NULL,
  narrator     VARCHAR(255),
  description  TEXT,
  cover_image  VARCHAR(500),
  category_id  VARCHAR(36),
  duration     INT           NOT NULL DEFAULT 0 COMMENT 'Total duration in seconds',
  rating       DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
  is_featured  TINYINT(1)    NOT NULL DEFAULT 0,
  is_popular   TINYINT(1)    NOT NULL DEFAULT 0,
  play_count   INT           NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_books_category (category_id),
  INDEX idx_books_featured (is_featured),
  INDEX idx_books_popular (is_popular),
  FULLTEXT INDEX idx_books_search (title, author, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- chapters
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  book_id    VARCHAR(36)  NOT NULL,
  title      VARCHAR(255) NOT NULL,
  order_num  INT          NOT NULL DEFAULT 1,
  audio_url  VARCHAR(500) NOT NULL,
  duration   INT          NOT NULL DEFAULT 0 COMMENT 'Duration in seconds',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_chapters_book (book_id),
  UNIQUE KEY uq_chapter_order (book_id, order_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- devices
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
  id            VARCHAR(36)  NOT NULL,
  device_name   VARCHAR(255),
  platform      VARCHAR(50)  COMMENT 'ios | android | web',
  registered_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- progress
-- ============================================================
CREATE TABLE IF NOT EXISTS progress (
  device_id    VARCHAR(36)   NOT NULL,
  book_id      VARCHAR(36)   NOT NULL,
  chapter_id   VARCHAR(36),
  current_time DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Current playback position in seconds',
  is_completed TINYINT(1)    NOT NULL DEFAULT 0,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, book_id),
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id)   REFERENCES books(id)   ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  device_id  VARCHAR(36) NOT NULL,
  book_id    VARCHAR(36) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, book_id),
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id)   REFERENCES books(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- voice_rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_rooms (
  id               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  name             VARCHAR(255) NOT NULL,
  topic            VARCHAR(500),
  host_device_id   VARCHAR(36)  NOT NULL,
  max_participants INT          NOT NULL DEFAULT 10,
  is_live          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at        DATETIME,
  PRIMARY KEY (id),
  INDEX idx_voice_rooms_live (is_live)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- book_submissions (Kullanıcı kitap gönderimleri)
-- ============================================================
CREATE TABLE IF NOT EXISTS book_submissions (
  id           VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  device_id    VARCHAR(36)   NOT NULL,
  title        VARCHAR(255)  NOT NULL,
  author       VARCHAR(255)  NOT NULL,
  narrator     VARCHAR(255)  NOT NULL,
  description  TEXT,
  category     VARCHAR(100)  NOT NULL,
  cover_image  VARCHAR(500)  COMMENT 'URL veya dosya yolu',
  status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note   TEXT          COMMENT 'Red/onay notu',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_submissions_status (status),
  INDEX idx_submissions_device (device_id),
  INDEX idx_submissions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- book_submission_chapters
-- ============================================================
CREATE TABLE IF NOT EXISTS book_submission_chapters (
  id          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  submission_id VARCHAR(36) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  order_num   INT           NOT NULL DEFAULT 1,
  audio_url   VARCHAR(500)  NOT NULL COMMENT 'URL veya dosya yolu',
  duration    INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (submission_id) REFERENCES book_submissions(id) ON DELETE CASCADE,
  INDEX idx_sub_chapters_submission (submission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
