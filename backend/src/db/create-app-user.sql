-- ============================================================
-- Sınırlı Veritabanı Kullanıcısı Oluşturma
-- Root yetkisi SADECE bu script çalıştırılırken gereklidir.
-- Oluşturulan kullanıcı sadece kendi veritabanında yetkili olur.
-- ============================================================
--
-- KULLANIM:
-- 1. Aşağıdaki 3 değeri kendi ortamınıza göre değiştirin
-- 2. mysql -u root -p < create-app-user.sql
-- 3. backend/.env içinde DB_USER ve DB_PASSWORD'ı güncelleyin
--
-- Hostinger/cPanel: Veritabanı ve kullanıcı genelde panelden oluşturulur.
-- Bu script VPS/dedicated sunucularda MySQL root erişiminiz varsa kullanılır.
-- ============================================================

-- *** DÜZENLEYİN: Veritabanı adınız ***
-- Örnek: sesli_kitap veya su987029066_vbooks (Hostinger/cPanel)
SET @db = 'sesli_kitap';

-- *** DÜZENLEYİN: Yeni kullanıcı adı ***
SET @user = 'seslikitap_app';

-- *** DÜZENLEYİN: Güçlü şifre ***
SET @pwd = 'GucluSifre123!';

-- Kullanıcı oluştur
SET @s = CONCAT("DROP USER IF EXISTS '", @user, "'@'%'");
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = CONCAT("CREATE USER '", @user, "'@'%' IDENTIFIED BY '", @pwd, "'");
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- Sadece bu veritabanında yetki ver (root değil, tüm DB'lere erişim yok)
SET @s = CONCAT(
  "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX, REFERENCES ",
  "ON `", @db, "`.* TO '", @user, "'@'%'"
);
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

FLUSH PRIVILEGES;

SELECT 'Kullanıcı oluşturuldu. .env dosyasında DB_USER ve DB_PASSWORD güncelleyin.' AS sonuc;
