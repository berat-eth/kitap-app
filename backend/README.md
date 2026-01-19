# Sesli Kitap Backend API

Node.js + Express + TypeScript + MySQL ile geliştirilmiş performanslı bir sesli kitap backend API'si.

## Özellikler

- ✅ Device ID bazlı authentication (normal kullanıcılar için)
- ✅ JWT authentication (admin kullanıcılar için)
- ✅ RESTful API endpoints
- ✅ MySQL veritabanı
- ✅ Dosya yükleme (kitap kapakları, ses dosyaları, avatarlar)
- ✅ Rate limiting
- ✅ Error handling
- ✅ Request validation
- ✅ TypeScript desteği

## Teknoloji Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0+
- **Authentication**: 
  - Normal kullanıcılar: Device ID bazlı
  - Admin kullanıcılar: JWT
- **File Storage**: Linux sunucu yerel dosya sistemi

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası oluşturun (uzak MySQL sunucusu için):

```env
NODE_ENV=development
PORT=3000

# Uzak MySQL Sunucusu
DATABASE_URL=mysql://user:password@your-remote-mysql-host.com:3306/audiobook_db
# Veya ayrı ayrı:
DB_HOST=your-remote-mysql-host.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=audiobook_db

# SSL ayarları (eğer gerekiyorsa)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key
ADMIN_JWT_REFRESH_SECRET=your-super-secret-admin-refresh-jwt-key
ADMIN_JWT_EXPIRES_IN=15m
ADMIN_JWT_REFRESH_EXPIRES_IN=7d

DEVICE_ID_HEADER=X-Device-ID

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
MAX_COVER_SIZE=5242880

CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Veritabanını Oluşturun

**Uzak MySQL Sunucusu için:**

```bash
# Uzak sunucuya bağlanın
mysql -h your-remote-mysql-host.com -u your_username -p

# Veritabanını oluşturun
CREATE DATABASE audiobook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Not:** Uzak MySQL sunucusu kullanıyorsanız, `REMOTE_MYSQL_SETUP.md` dosyasına bakın.

### 4. Migration'ları Çalıştırın

```bash
npm run migrate
```

### 5. Sunucuyu Başlatın

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Device Management
- `POST /api/device/register` - Device kaydı (otomatik)
- `GET /api/device/me` - Device bilgileri
- `PUT /api/device/me` - Device bilgilerini güncelle

### Admin Authentication
- `POST /api/admin/auth/login` - Admin girişi
- `POST /api/admin/auth/refresh` - Token yenileme
- `GET /api/admin/auth/me` - Admin bilgileri
- `POST /api/admin/auth/logout` - Admin çıkışı

### Books
- `GET /api/books` - Tüm kitapları listele
- `GET /api/books/:id` - Kitap detayı
- `GET /api/books/:id/chapters` - Kitabın bölümlerini getir
- `GET /api/books/featured` - Öne çıkan kitaplar
- `GET /api/books/popular` - Popüler kitaplar
- `GET /api/books/search?q=query` - Kitap arama
- `GET /api/books/category/:slug` - Kategoriye göre kitaplar
- `POST /api/books` - Yeni kitap ekle (admin)
- `PUT /api/books/:id` - Kitap güncelle (admin)
- `DELETE /api/books/:id` - Kitap sil (admin)

### Chapters
- `GET /api/chapters/:id` - Bölüm detayı
- `GET /api/chapters/:id/audio` - Bölüm ses dosyası URL'i
- `POST /api/chapters` - Yeni bölüm ekle (admin)
- `PUT /api/chapters/:id` - Bölüm güncelle (admin)
- `DELETE /api/chapters/:id` - Bölüm sil (admin)

### Categories
- `GET /api/categories` - Tüm kategoriler
- `GET /api/categories/:id` - Kategori detayı
- `POST /api/categories` - Yeni kategori ekle (admin)
- `PUT /api/categories/:id` - Kategori güncelle (admin)
- `DELETE /api/categories/:id` - Kategori sil (admin)

### Progress
- `GET /api/progress` - Kullanıcının tüm ilerlemesi
- `GET /api/progress/:bookId` - Kitap ilerlemesi
- `POST /api/progress` - İlerleme kaydet/güncelle
- `PUT /api/progress/:bookId` - İlerleme güncelle
- `DELETE /api/progress/:bookId` - İlerleme sil

### Favorites
- `GET /api/favorites` - Kullanıcının favorileri
- `POST /api/favorites` - Favori ekle
- `DELETE /api/favorites/:bookId` - Favoriden çıkar

### Downloads
- `GET /api/downloads` - İndirilen kitaplar
- `POST /api/downloads/:bookId` - Kitap indir
- `DELETE /api/downloads/:bookId` - İndirmeyi kaldır
- `GET /api/downloads/:bookId/status` - İndirme durumu

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard istatistikleri
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/users/:id` - Kullanıcı detayı
- `PUT /api/admin/users/:id` - Kullanıcı güncelle
- `DELETE /api/admin/users/:id` - Kullanıcı sil

### Upload
- `POST /api/upload/book-cover` - Kitap kapağı yükle (admin)
- `POST /api/upload/chapter-audio` - Bölüm ses dosyası yükle (admin)
- `POST /api/upload/avatar` - Kullanıcı avatarı yükle

### Public
- `GET /api/public/books` - Herkese açık kitaplar
- `GET /api/public/categories` - Herkese açık kategoriler

## Authentication

### Normal Kullanıcılar (Device ID)

Her API isteğinde `X-Device-ID` header'ı gönderilmelidir:

```http
GET /api/books
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
```

Device ID UUID v4 formatında olmalıdır. İlk istekte otomatik olarak yeni kullanıcı oluşturulur.

### Admin Kullanıcılar (JWT)

Admin endpoint'leri için JWT token gereklidir:

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@audiobook.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

Sonraki isteklerde:
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <accessToken>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## Proje Yapısı

```
backend/
├── src/
│   ├── config/          # Konfigürasyon dosyaları
│   ├── controllers/     # Controller'lar
│   ├── middleware/      # Middleware'ler
│   ├── routes/          # Route tanımları
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Yardımcı fonksiyonlar
│   ├── migrations/      # Database migration'ları
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── uploads/             # Yüklenen dosyalar
├── logs/                # Log dosyaları
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Development mode (watch mode)
npm run dev

# Build
npm run build

# Run migrations
npm run migrate

# Lint
npm run lint

# Format
npm run format
```

## Production Deployment

1. Environment variables'ı ayarlayın
2. Veritabanını oluşturun ve migration'ları çalıştırın
3. Build alın: `npm run build`
4. PM2 ile çalıştırın:
   ```bash
   pm2 start dist/server.js --name audiobook-api
   ```

## Lisans

ISC

