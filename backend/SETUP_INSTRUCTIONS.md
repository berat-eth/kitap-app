# Hızlı Kurulum Talimatları

## 1. .env Dosyası Oluşturma

`backend` klasöründe `.env` dosyası oluşturun ve aşağıdaki içeriği ekleyin:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration - Uzak MySQL Sunucusu
DB_HOST=92.113.22.70
DB_PORT=3306
DB_USER=u987029066_kitap
DB_PASSWORD=38cdfD8217..
DB_NAME=u987029066_kitap

# SSL Ayarları
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false

# Admin JWT Configuration (GÜVENLİK İÇİN MUTLAKA DEĞİŞTİRİN!)
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-change-this-in-production
ADMIN_JWT_REFRESH_SECRET=your-super-secret-admin-refresh-jwt-key-change-this-in-production
ADMIN_JWT_EXPIRES_IN=15m
ADMIN_JWT_REFRESH_EXPIRES_IN=7d

# Device ID Configuration
DEVICE_ID_HEADER=X-Device-ID

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
MAX_COVER_SIZE=5242880

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
EMAIL_ENABLED=false

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX_REQUESTS=1000
```

## 2. Bağımlılıkları Yükleyin

```bash
cd backend
npm install
```

## 3. Veritabanı Bağlantısını Test Edin

```bash
# MySQL client ile test (eğer yüklüyse)
mysql -h 92.113.22.70 -u u987029066_kitap -p u987029066_kitap
# Şifre: 38cdfD8217..
```

## 4. Migration'ları Çalıştırın

```bash
npm run migrate
```

Bu komut:
- Veritabanı tablolarını oluşturur
- Seed data'yı ekler (admin kullanıcı ve kategoriler)

## 5. Sunucuyu Başlatın

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 6. Test Edin

Tarayıcıda veya Postman'de test edin:

```bash
# Health check
GET http://localhost:3000/health

# Public books
GET http://localhost:3000/api/public/books
```

## Önemli Notlar

1. **Güvenlik**: `ADMIN_JWT_SECRET` ve `ADMIN_JWT_REFRESH_SECRET` değerlerini mutlaka değiştirin!
2. **.env Dosyası**: `.env` dosyasını asla git'e commit etmeyin (zaten .gitignore'da)
3. **Veritabanı**: Veritabanı tabloları migration ile otomatik oluşturulacak
4. **Admin Kullanıcı**: Migration sonrası admin kullanıcı oluşturulur:
   - Email: `admin@audiobook.com`
   - Password: `admin123` (ilk girişten sonra değiştirin!)

## Sorun Giderme

### Bağlantı Hatası
- Firewall'da 3306 portunun açık olduğundan emin olun
- MySQL sunucusunun uzaktan bağlantıya izin verdiğinden emin olun

### Migration Hatası
- Veritabanı kullanıcısının CREATE, ALTER, INSERT izinlerine sahip olduğundan emin olun

### Port Hatası
- Port 3000 kullanılıyorsa, `.env` dosyasında `PORT=3001` gibi farklı bir port belirleyin

