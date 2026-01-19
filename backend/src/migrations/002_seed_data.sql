-- Seed initial data

USE audiobook_db;

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt (salt rounds: 10)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('admin@audiobook.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'Admin User', 'admin', true)
ON DUPLICATE KEY UPDATE email=email;

-- Insert categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Tümü', 'tumu', 'Tüm kategoriler', true),
('Popüler', 'populer', 'Popüler kitaplar', true),
('Yeni', 'yeni', 'Yeni eklenen kitaplar', true),
('Roman', 'roman', 'Roman kitapları', true),
('Bilim', 'bilim', 'Bilim kitapları', true),
('Tarih', 'tarih', 'Tarih kitapları', true),
('Klasikler', 'klasikler', 'Klasik eserler', true),
('Bilim Kurgu', 'bilim-kurgu', 'Bilim kurgu kitapları', true),
('Polisiye', 'polisiye', 'Polisiye kitapları', true),
('Kişisel Gelişim', 'kisisel-gelisim', 'Kişisel gelişim kitapları', true)
ON DUPLICATE KEY UPDATE name=name;

