# Sesli Kitap Backend API

Node.js + Express.js + TypeScript ile geliştirilmiş Sesli Kitap uygulaması backend API'si.

## Teknolojiler

- **Node.js** + **Express.js** - Web framework
- **TypeScript** - Tip güvenliği
- **TypeORM** + **MySQL** - Veritabanı
- **Redis** - Cache (opsiyonel)
- **Swagger** - API dokümantasyonu

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd backend
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
cp .env.example .env
```

### 3. Veritabanını Hazırla

```bash
# Tabloları oluştur
npm run db:sync

# Örnek verileri ekle
npm run db:seed
```

### 4. Sunucuyu Başlat

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoint'leri

### Public Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/books` | Kitap listesi |
| GET | `/api/books/featured` | Öne çıkan kitaplar |
| GET | `/api/books/popular` | Popüler kitaplar |
| GET | `/api/books/:id` | Kitap detayı |
| GET | `/api/books/:id/chapters` | Kitap bölümleri |
| GET | `/api/books/search?q=` | Kitap arama |
| GET | `/api/chapters/:id` | Bölüm detayı |
| GET | `/api/chapters/:id/stream` | Ses URL'i |
| GET | `/api/categories` | Kategori listesi |
| GET | `/api/categories/:slug/books` | Kategorideki kitaplar |

### Device Endpoints (X-Device-ID Header Gerekli)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/device/register` | Cihaz kaydı |
| GET | `/api/device/stats` | Cihaz istatistikleri |
| GET | `/api/device/progress` | Tüm ilerleme kayıtları |
| GET | `/api/device/progress/:bookId` | Kitap ilerlemesi |
| POST | `/api/device/progress/:bookId` | İlerleme kaydet |
| GET | `/api/device/favorites` | Favoriler |
| POST | `/api/device/favorites/:bookId` | Favoriye ekle |
| DELETE | `/api/device/favorites/:bookId` | Favoriden çıkar |
| POST | `/api/device/reviews/:bookId` | Yorum ekle |

### Admin Endpoints (X-Admin-Key Header Gerekli)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/admin/stats` | Dashboard istatistikleri |
| GET | `/api/admin/books` | Tüm kitaplar |
| POST | `/api/admin/books` | Kitap ekle |
| PUT | `/api/admin/books/:id` | Kitap güncelle |
| DELETE | `/api/admin/books/:id` | Kitap sil |
| POST | `/api/admin/books/:bookId/chapters` | Bölüm ekle |
| PUT | `/api/admin/chapters/:id` | Bölüm güncelle |
| DELETE | `/api/admin/chapters/:id` | Bölüm sil |
| POST | `/api/admin/categories` | Kategori ekle |
| PUT | `/api/admin/categories/:id` | Kategori güncelle |
| DELETE | `/api/admin/categories/:id` | Kategori sil |

## Kullanım Örnekleri

### Cihaz Kaydı
```bash
curl -X POST http://localhost:3001/api/device/register \
  -H "Content-Type: application/json" \
  -d '{"deviceName": "iPhone 15", "platform": "ios"}'
```

Yanıt:
```json
{
  "success": true,
  "data": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "deviceName": "iPhone 15",
    "platform": "ios"
  }
}
```

### Kitapları Listele
```bash
curl http://localhost:3001/api/books?page=1&limit=10
```

### İlerleme Kaydet
```bash
curl -X POST http://localhost:3001/api/device/progress/1 \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"chapterId": 1, "currentTime": 1234}'
```

### Admin: Kitap Ekle
```bash
curl -X POST http://localhost:3001/api/admin/books \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-admin-key" \
  -d '{
    "title": "Yeni Kitap",
    "author": "Yazar Adı",
    "description": "Kitap açıklaması",
    "categoryId": 1
  }'
```

## Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NODE_ENV` | Ortam (development/production) | development |
| `PORT` | Sunucu portu | 3001 |
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_NAME` | Veritabanı adı | - |
| `DB_USER` | Veritabanı kullanıcı | - |
| `DB_PASSWORD` | Veritabanı şifre | - |
| `REDIS_HOST` | Redis host (opsiyonel) | - |
| `ADMIN_API_KEY` | Admin API anahtarı | - |
| `CORS_ORIGINS` | İzin verilen origin'ler | * |

## API Dokümantasyonu

Swagger UI: http://localhost:3001/api-docs

## Proje Yapısı

```
backend/
├── src/
│   ├── config/        # Yapılandırma dosyaları
│   ├── entities/      # TypeORM entity'leri
│   ├── middleware/    # Express middleware'leri
│   ├── routes/        # API route'ları
│   ├── types/         # TypeScript tipleri
│   ├── utils/         # Yardımcı fonksiyonlar
│   ├── scripts/       # DB sync/seed scriptleri
│   └── app.ts         # Ana uygulama
├── package.json
├── tsconfig.json
└── .env
```

## Lisans

MIT
