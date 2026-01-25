# Backend API Dokümantasyonu

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Kurulum](#kurulum)
4. [Yapılandırma](#yapılandırma)
5. [Veritabanı](#veritabanı)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Proje Yapısı](#proje-yapısı)
9. [Middleware'ler](#middlewareler)
10. [Hata Yönetimi](#hata-yönetimi)
11. [Dosya Yükleme](#dosya-yükleme)
12. [Güvenlik](#güvenlik)
13. [Deployment](#deployment)
14. [Geliştirme](#geliştirme)

---

## Genel Bakış

Bu proje, sesli kitap uygulaması için geliştirilmiş bir RESTful API backend'idir. Node.js, Express.js, TypeScript ve MySQL kullanılarak geliştirilmiştir.

### Özellikler

- ✅ **Device ID Bazlı Authentication**: Normal kullanıcılar için cihaz ID'si ile kimlik doğrulama
- ✅ **JWT Authentication**: Admin kullanıcılar için JWT token tabanlı kimlik doğrulama
- ✅ **RESTful API**: Standart REST API endpoint'leri
- ✅ **MySQL Veritabanı**: İlişkisel veritabanı yönetimi
- ✅ **Dosya Yükleme**: Kitap kapakları, ses dosyaları ve avatar yükleme
- ✅ **Rate Limiting**: API isteklerini sınırlama
- ✅ **Error Handling**: Merkezi hata yönetimi
- ✅ **Request Validation**: Zod ile istek doğrulama
- ✅ **TypeScript**: Tip güvenliği
- ✅ **Logging**: Winston ile loglama

---

## Teknoloji Stack

### Runtime & Framework
- **Node.js**: 18+
- **Express.js**: 4.18.2
- **TypeScript**: 5.3.3

### Veritabanı
- **MySQL**: 8.0+
- **mysql2**: 3.6.5 (Promise tabanlı MySQL client)

### Authentication
- **jsonwebtoken**: 9.0.2 (JWT token oluşturma/doğrulama)
- **bcryptjs**: 2.4.3 (Şifre hashleme)

### Validation & Security
- **zod**: 3.22.4 (Schema validation)
- **helmet**: 7.1.0 (HTTP header güvenliği)
- **cors**: 2.8.5 (Cross-Origin Resource Sharing)
- **express-rate-limit**: 7.1.5 (Rate limiting)

### File Upload
- **multer**: 1.4.5 (Dosya yükleme middleware)

### Utilities
- **winston**: 3.11.0 (Logging)
- **uuid**: 9.0.1 (UUID oluşturma)
- **compression**: 1.7.4 (Response compression)
- **dotenv**: 16.3.1 (Environment variables)

---

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- MySQL 8.0 veya üzeri
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın veya indirin**

2. **Bağımlılıkları yükleyin**
   ```bash
   cd backend
   npm install
   ```

3. **Environment variables dosyası oluşturun**
   
   `.env` dosyası oluşturun (detaylar için [Yapılandırma](#yapılandırma) bölümüne bakın)

4. **Veritabanını oluşturun**
   ```sql
   CREATE DATABASE audiobook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Migration'ları çalıştırın**
   ```bash
   npm run migrate
   ```

6. **Sunucuyu başlatın**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

---

## Yapılandırma

### Environment Variables

`.env` dosyası oluşturup aşağıdaki değişkenleri ayarlayın:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=audiobook_db
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false

# Admin JWT Configuration
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key
ADMIN_JWT_REFRESH_SECRET=your-super-secret-admin-refresh-jwt-key
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

### Önemli Notlar

- `ADMIN_JWT_SECRET` ve `ADMIN_JWT_REFRESH_SECRET` değerlerini **mutlaka değiştirin**
- Production ortamında `NODE_ENV=production` olarak ayarlayın
- `.env` dosyasını asla git'e commit etmeyin (`.gitignore`'da zaten var)

---

## Veritabanı

### Veritabanı Şeması

#### 1. Users (Kullanıcılar)
- Normal kullanıcılar: `device_id` ile kimlik doğrulama
- Admin kullanıcılar: `email` ve `password_hash` ile kimlik doğrulama
- Roller: `user`, `admin`, `donor`

#### 2. Categories (Kategoriler)
- Kitap kategorileri
- Slug bazlı URL routing

#### 3. Books (Kitaplar)
- Kitap bilgileri
- Kategori ilişkisi
- Yayın durumu (`is_published`)
- Öne çıkan kitaplar (`is_featured`)

#### 4. Chapters (Bölümler)
- Kitap bölümleri
- Ses dosyası URL'leri
- Sıralama (`order_number`)

#### 5. User Progress (Kullanıcı İlerlemesi)
- Dinleme ilerlemesi
- Bölüm bazlı pozisyon takibi

#### 6. User Favorites (Favoriler)
- Kullanıcı favori kitapları

#### 7. User Downloads (İndirmeler)
- İndirilen kitaplar
- İndirme durumu

#### 8. Book Ratings (Kitap Puanları)
- Kullanıcı puanları (1-5)

#### 9. Donations (Bağışlar)
- Bağış kayıtları

#### 10. Admin Logs (Admin Logları)
- Admin işlem kayıtları

### Migration'lar

Migration'ları çalıştırmak için:
```bash
npm run migrate
```

Bu komut:
- Veritabanı tablolarını oluşturur
- Seed data ekler (admin kullanıcı ve kategoriler)

---

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Response Format

#### Başarılı Response
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

#### Hata Response
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

### Endpoint Kategorileri

#### 1. Device Management
- `POST /api/device/register` - Cihaz kaydı (otomatik)
- `GET /api/device/me` - Cihaz bilgileri
- `PUT /api/device/me` - Cihaz bilgilerini güncelle

#### 2. Admin Authentication
- `POST /api/admin/auth/login` - Admin girişi
- `POST /api/admin/auth/refresh` - Token yenileme
- `GET /api/admin/auth/me` - Admin bilgileri
- `POST /api/admin/auth/logout` - Admin çıkışı

#### 3. Books (Kitaplar)
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

#### 4. Chapters (Bölümler)
- `GET /api/chapters/:id` - Bölüm detayı
- `GET /api/chapters/:id/audio` - Bölüm ses dosyası URL'i
- `POST /api/chapters` - Yeni bölüm ekle (admin)
- `PUT /api/chapters/:id` - Bölüm güncelle (admin)
- `DELETE /api/chapters/:id` - Bölüm sil (admin)

#### 5. Categories (Kategoriler)
- `GET /api/categories` - Tüm kategoriler
- `GET /api/categories/:id` - Kategori detayı
- `POST /api/categories` - Yeni kategori ekle (admin)
- `PUT /api/categories/:id` - Kategori güncelle (admin)
- `DELETE /api/categories/:id` - Kategori sil (admin)

#### 6. Progress (İlerleme)
- `GET /api/progress` - Kullanıcının tüm ilerlemesi
- `GET /api/progress/:bookId` - Kitap ilerlemesi
- `POST /api/progress` - İlerleme kaydet/güncelle
- `PUT /api/progress/:bookId` - İlerleme güncelle
- `DELETE /api/progress/:bookId` - İlerleme sil

#### 7. Favorites (Favoriler)
- `GET /api/favorites` - Kullanıcının favorileri
- `POST /api/favorites` - Favori ekle
- `DELETE /api/favorites/:bookId` - Favoriden çıkar

#### 8. Downloads (İndirmeler)
- `GET /api/downloads` - İndirilen kitaplar
- `POST /api/downloads/:bookId` - Kitap indir
- `DELETE /api/downloads/:bookId` - İndirmeyi kaldır
- `GET /api/downloads/:bookId/status` - İndirme durumu

#### 9. Admin (Yönetim)
- `GET /api/admin/dashboard/stats` - Dashboard istatistikleri
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/users/:id` - Kullanıcı detayı
- `PUT /api/admin/users/:id` - Kullanıcı güncelle
- `DELETE /api/admin/users/:id` - Kullanıcı sil

#### 10. Upload (Dosya Yükleme)
- `POST /api/upload/book-cover` - Kitap kapağı yükle (admin)
- `POST /api/upload/chapter-audio` - Bölüm ses dosyası yükle (admin)
- `POST /api/upload/avatar` - Kullanıcı avatarı yükle

#### 11. Public (Herkese Açık)
- `GET /api/public/books` - Herkese açık kitaplar
- `GET /api/public/categories` - Herkese açık kategoriler

#### 12. Health Check
- `GET /health` - Server durumu

Detaylı endpoint dokümantasyonu için `API_ENDPOINTS.md` dosyasına bakın.

---

## Authentication & Authorization

### Normal Kullanıcılar (Device ID)

Normal kullanıcılar için Device ID bazlı kimlik doğrulama kullanılır.

#### Kullanım

Her API isteğinde `X-Device-ID` header'ı gönderilmelidir:

```http
GET /api/books
X-Device-ID: 550e8400-e29b-41d4-a716-446655440000
```

#### Özellikler

- Device ID UUID v4 formatında olmalıdır
- İlk istekte otomatik olarak yeni kullanıcı oluşturulur
- Device ID header'ı olmadan istek yapılırsa 401 Unauthorized döner

#### Örnek

```javascript
// JavaScript/TypeScript
const deviceId = '550e8400-e29b-41d4-a716-446655440000';

fetch('http://localhost:3000/api/books', {
  headers: {
    'X-Device-ID': deviceId
  }
});
```

### Admin Kullanıcılar (JWT)

Admin kullanıcılar için JWT token tabanlı kimlik doğrulama kullanılır.

#### 1. Login

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@audiobook.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@audiobook.com",
      "name": "Admin",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### 2. Token Kullanımı

Sonraki isteklerde `Authorization` header'ında token gönderilir:

```http
GET /api/admin/dashboard/stats
Authorization: Bearer <accessToken>
```

#### 3. Token Yenileme

Access token süresi dolduğunda refresh token ile yenilenebilir:

```http
POST /api/admin/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Logout

```http
POST /api/admin/auth/logout
Authorization: Bearer <accessToken>
```

### Roller ve Yetkiler

- **user**: Normal kullanıcı, sadece kendi verilerine erişebilir
- **admin**: Admin kullanıcı, tüm verilere erişebilir ve CRUD işlemleri yapabilir
- **donor**: Bağışçı kullanıcı (gelecek özellikler için)

---

## Proje Yapısı

```
backend/
├── src/
│   ├── config/              # Konfigürasyon dosyaları
│   │   ├── database.ts      # Veritabanı bağlantısı
│   │   │   ├── env.ts       # Environment variables
│   │   └── storage.ts       # Dosya yükleme ayarları
│   │
│   ├── controllers/         # Controller'lar (iş mantığı)
│   │   ├── admin-auth.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── books.controller.ts
│   │   ├── categories.controller.ts
│   │   ├── chapters.controller.ts
│   │   ├── device.controller.ts
│   │   ├── downloads.controller.ts
│   │   ├── favorites.controller.ts
│   │   └── progress.controller.ts
│   │
│   ├── middleware/          # Middleware'ler
│   │   ├── admin-auth.middleware.ts  # JWT doğrulama
│   │   ├── device.middleware.ts      # Device ID doğrulama
│   │   ├── error.middleware.ts       # Hata yönetimi
│   │   ├── role.middleware.ts        # Rol kontrolü
│   │   ├── upload.middleware.ts      # Dosya yükleme
│   │   └── validation.middleware.ts  # Request validation
│   │
│   ├── routes/              # Route tanımları
│   │   ├── admin-auth.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── books.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── chapters.routes.ts
│   │   ├── device.routes.ts
│   │   ├── downloads.routes.ts
│   │   ├── favorites.routes.ts
│   │   ├── progress.routes.ts
│   │   ├── public.routes.ts
│   │   └── upload.routes.ts
│   │
│   ├── services/            # Business logic
│   │   ├── admin-auth.service.ts
│   │   ├── device.service.ts
│   │   └── storage.service.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/               # Yardımcı fonksiyonlar
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   └── validators.ts
│   │
│   ├── migrations/          # Database migration'ları
│   │   ├── 001_create_tables.sql
│   │   ├── 002_seed_data.sql
│   │   └── run.ts
│   │
│   ├── app.ts               # Express app yapılandırması
│   └── server.ts            # Server entry point
│
├── uploads/                 # Yüklenen dosyalar
│   ├── covers/              # Kitap kapakları
│   ├── audio/               # Ses dosyaları
│   └── avatars/             # Kullanıcı avatarları
│
├── logs/                    # Log dosyaları
├── dist/                    # Build çıktısı (TypeScript compile)
│
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── README.md
├── API_ENDPOINTS.md
├── SETUP_INSTRUCTIONS.md
└── BACKEND_DOKUMANTASYON.md (bu dosya)
```

---

## Middleware'ler

### 1. Admin Auth Middleware

JWT token doğrulama için kullanılır.

**Kullanım:**
```typescript
import { adminAuth } from './middleware/admin-auth.middleware';

router.get('/dashboard/stats', adminAuth, getDashboardStats);
```

**Özellikler:**
- `Authorization: Bearer <token>` header'ını kontrol eder
- Token'ı doğrular ve `req.user`'a admin bilgisini ekler
- Geçersiz token durumunda 401 döner

### 2. Device Middleware

Device ID doğrulama için kullanılır.

**Kullanım:**
```typescript
import { deviceAuth } from './middleware/device.middleware';

router.get('/books', deviceAuth, getBooks);
```

**Özellikler:**
- `X-Device-ID` header'ını kontrol eder
- Device ID yoksa veya geçersizse yeni kullanıcı oluşturur
- `req.user` ve `req.deviceId`'yi set eder

### 3. Role Middleware

Rol kontrolü için kullanılır.

**Kullanım:**
```typescript
import { requireRole } from './middleware/role.middleware';

router.delete('/users/:id', adminAuth, requireRole('admin'), deleteUser);
```

### 4. Validation Middleware

Request validation için kullanılır (Zod schema).

**Kullanım:**
```typescript
import { validate } from './middleware/validation.middleware';
import { z } from 'zod';

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category_id: z.number().int().positive()
});

router.post('/books', adminAuth, validate(createBookSchema), createBook);
```

### 5. Upload Middleware

Dosya yükleme için kullanılır (Multer).

**Kullanım:**
```typescript
import { uploadBookCover } from './middleware/upload.middleware';

router.post('/upload/book-cover', adminAuth, uploadBookCover.single('cover'), uploadBookCoverHandler);
```

### 6. Error Middleware

Merkezi hata yönetimi için kullanılır.

**Özellikler:**
- Tüm hataları yakalar
- Standart hata response formatına dönüştürür
- Loglama yapar

---

## Hata Yönetimi

### Hata Formatı

Tüm hatalar standart formatta döner:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Yaygın Hata Kodları

- `UNAUTHORIZED`: Kimlik doğrulama hatası
- `FORBIDDEN`: Yetki hatası
- `NOT_FOUND`: Kaynak bulunamadı
- `VALIDATION_ERROR`: Validasyon hatası
- `DATABASE_ERROR`: Veritabanı hatası
- `INTERNAL_ERROR`: Sunucu hatası

### Örnek Hata Response'ları

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Book not found"
  }
}
```

#### 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "author": "Author must be at least 3 characters"
    }
  }
}
```

---

## Dosya Yükleme

### Desteklenen Dosya Tipleri

#### Kitap Kapakları
- **Formatlar**: JPEG, PNG, WebP
- **Max Boyut**: 5MB
- **Endpoint**: `POST /api/upload/book-cover`

#### Ses Dosyaları
- **Formatlar**: MP3, WAV, OGG, M4A
- **Max Boyut**: 500MB
- **Endpoint**: `POST /api/upload/chapter-audio`

#### Avatarlar
- **Formatlar**: JPEG, PNG, WebP
- **Max Boyut**: 5MB
- **Endpoint**: `POST /api/upload/avatar`

### Kullanım Örnekleri

#### Kitap Kapağı Yükleme

```javascript
const formData = new FormData();
formData.append('cover', fileInput.files[0]);

fetch('http://localhost:3000/api/upload/book-cover', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

#### Ses Dosyası Yükleme

```javascript
const formData = new FormData();
formData.append('audio', audioFile);

fetch('http://localhost:3000/api/upload/chapter-audio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

### Dosya Erişimi

Yüklenen dosyalar `/uploads` endpoint'i üzerinden erişilebilir:

```
http://localhost:3000/uploads/covers/book-123.jpg
http://localhost:3000/uploads/audio/chapter-456.mp3
http://localhost:3000/uploads/avatars/user-789.jpg
```

---

## Güvenlik

### 1. Helmet

HTTP header güvenliği için Helmet kullanılır:
- XSS koruması
- Content Security Policy
- Frame options

### 2. CORS

CORS yapılandırması `.env` dosyasında:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Rate Limiting

API isteklerini sınırlama:
- Normal kullanıcılar: 100 istek/dakika
- Admin kullanıcılar: 1000 istek/dakika

### 4. Password Hashing

Admin şifreleri bcryptjs ile hashlenir (salt rounds: 10).

### 5. JWT Security

- Access token: 15 dakika
- Refresh token: 7 gün
- Secret key'ler environment variable'larda saklanır

### 6. SQL Injection

mysql2 prepared statements kullanılır, SQL injection riski minimize edilir.

### 7. File Upload Security

- Dosya tipi kontrolü
- Dosya boyutu sınırlaması
- Dosya adı sanitization

---

## Deployment

### Production Build

```bash
# Build
npm run build

# Start
npm start
```

### PM2 ile Çalıştırma

```bash
# Install PM2
npm install -g pm2

# Start
pm2 start dist/server.js --name audiobook-api

# Auto restart on reboot
pm2 startup
pm2 save
```

### Environment Variables

Production ortamında:
- `NODE_ENV=production`
- Güçlü JWT secret'lar kullanın
- Veritabanı bağlantı bilgilerini güvenli tutun
- CORS origin'leri production domain'lerine ayarlayın

### Nginx Reverse Proxy (Önerilen)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS

Let's Encrypt ile SSL sertifikası kurulumu önerilir.

---

## Geliştirme

### Scripts

```bash
# Development (watch mode)
npm run dev

# Build
npm run build

# Start (production)
npm start

# Run migrations
npm run migrate

# Lint
npm run lint

# Format code
npm run format
```

### TypeScript

TypeScript kullanıldığı için:
- Tip güvenliği sağlanır
- IDE autocomplete desteği
- Compile-time hata kontrolü

### Logging

Winston logger kullanılır:
- Console output (development)
- File logging (production)
- Log levels: error, warn, info, debug

### Testing

Test framework'ü henüz eklenmemiş. Gelecekte Jest veya Mocha eklenebilir.

### Code Style

- ESLint: Code linting
- Prettier: Code formatting
- TypeScript strict mode

---

## Sorun Giderme

### Veritabanı Bağlantı Hatası

1. MySQL sunucusunun çalıştığından emin olun
2. `.env` dosyasındaki veritabanı bilgilerini kontrol edin
3. Firewall'da 3306 portunun açık olduğundan emin olun
4. Uzak sunucu için SSL ayarlarını kontrol edin

### Port Kullanımda Hatası

Port 3000 kullanılıyorsa:
```env
PORT=3001
```

### Migration Hatası

1. Veritabanı kullanıcısının yeterli yetkilere sahip olduğundan emin olun
2. Veritabanının mevcut olduğundan emin olun
3. Migration dosyalarını kontrol edin

### JWT Token Hatası

1. `ADMIN_JWT_SECRET` ve `ADMIN_JWT_REFRESH_SECRET` değerlerinin ayarlandığından emin olun
2. Token'ın süresinin dolmadığından emin olun
3. Token formatını kontrol edin

---

## İletişim ve Destek

Sorularınız için:
- GitHub Issues
- Email: [email adresi]

---

## Lisans

ISC

---

## Changelog

### v1.0.0
- İlk sürüm
- Device ID authentication
- JWT authentication
- CRUD operations
- File upload
- Rate limiting
- Error handling

---

**Son Güncelleme**: 2025-01-25
