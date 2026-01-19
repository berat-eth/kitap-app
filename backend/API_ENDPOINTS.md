# API Endpoints Listesi

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Normal Kullanıcılar (Device ID)
Tüm normal kullanıcı endpoint'leri için `X-Device-ID` header'ı gereklidir.

### Admin Kullanıcılar (JWT)
Admin endpoint'leri için `Authorization: Bearer <token>` header'ı gereklidir.

---

## Device Management

### POST /api/device/register
Cihaz kaydı (otomatik - deviceAuth middleware tarafından yapılır)

**Headers:**
- `X-Device-ID: <uuid>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "device_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "User_550e8400",
    "role": "user"
  }
}
```

### GET /api/device/me
Cihaz bilgilerini getir

**Headers:**
- `X-Device-ID: <uuid>`

### PUT /api/device/me
Cihaz bilgilerini güncelle

**Headers:**
- `X-Device-ID: <uuid>`

**Body:**
```json
{
  "name": "Yeni İsim",
  "avatar_url": "https://..."
}
```

---

## Admin Authentication

### POST /api/admin/auth/login
Admin girişi

**Body:**
```json
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
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### POST /api/admin/auth/refresh
Token yenileme

**Body:**
```json
{
  "refreshToken": "..."
}
```

### GET /api/admin/auth/me
Admin bilgileri

**Headers:**
- `Authorization: Bearer <token>`

### POST /api/admin/auth/logout
Admin çıkışı

**Headers:**
- `Authorization: Bearer <token>`

---

## Books

### GET /api/books
Tüm kitapları listele

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` (kategori slug)
- `search` (arama terimi)
- `featured` (true/false)
- `published` (true/false)

**Headers:**
- `X-Device-ID: <uuid>` (opsiyonel, yayınlanmamış kitaplar için admin gerekli)

### GET /api/books/:id
Kitap detayı

**Headers:**
- `X-Device-ID: <uuid>` (opsiyonel)

### GET /api/books/:id/chapters
Kitabın bölümlerini getir

**Headers:**
- `X-Device-ID: <uuid>`

### GET /api/books/featured
Öne çıkan kitaplar (public)

### GET /api/books/popular
Popüler kitaplar (public)

### GET /api/books/search?q=query
Kitap arama (public)

### GET /api/books/category/:slug
Kategoriye göre kitaplar (public)

### POST /api/books
Yeni kitap ekle (admin)

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Kitap Adı",
  "author": "Yazar Adı",
  "narrator": "Anlatıcı Adı",
  "description": "Açıklama",
  "cover_image_url": "https://...",
  "category_id": 1,
  "duration_seconds": 3600,
  "is_featured": false,
  "is_published": false
}
```

### PUT /api/books/:id
Kitap güncelle (admin)

**Headers:**
- `Authorization: Bearer <token>`

### DELETE /api/books/:id
Kitap sil (admin)

**Headers:**
- `Authorization: Bearer <token>`

---

## Chapters

### GET /api/chapters/:id
Bölüm detayı

**Headers:**
- `X-Device-ID: <uuid>`

### GET /api/chapters/:id/audio
Bölüm ses dosyası URL'i

**Headers:**
- `X-Device-ID: <uuid>`

### POST /api/chapters
Yeni bölüm ekle (admin)

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "book_id": 1,
  "title": "Bölüm 1",
  "order_number": 1,
  "audio_file_url": "https://...",
  "audio_file_size": 5242880,
  "duration_seconds": 3600
}
```

### PUT /api/chapters/:id
Bölüm güncelle (admin)

**Headers:**
- `Authorization: Bearer <token>`

### DELETE /api/chapters/:id
Bölüm sil (admin)

**Headers:**
- `Authorization: Bearer <token>`

---

## Categories

### GET /api/categories
Tüm kategoriler (public)

### GET /api/categories/:id
Kategori detayı (public)

### POST /api/categories
Yeni kategori ekle (admin)

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Kategori Adı",
  "slug": "kategori-adi",
  "description": "Açıklama",
  "icon_url": "https://..."
}
```

### PUT /api/categories/:id
Kategori güncelle (admin)

**Headers:**
- `Authorization: Bearer <token>`

### DELETE /api/categories/:id
Kategori sil (admin)

**Headers:**
- `Authorization: Bearer <token>`

---

## Progress

### GET /api/progress
Kullanıcının tüm ilerlemesi

**Headers:**
- `X-Device-ID: <uuid>`

### GET /api/progress/:bookId
Kitap ilerlemesi

**Headers:**
- `X-Device-ID: <uuid>`

### POST /api/progress
İlerleme kaydet/güncelle

**Headers:**
- `X-Device-ID: <uuid>`

**Body:**
```json
{
  "book_id": 1,
  "chapter_id": 1,
  "current_position_seconds": 120,
  "is_completed": false
}
```

### PUT /api/progress/:bookId
İlerleme güncelle

**Headers:**
- `X-Device-ID: <uuid>`

**Body:**
```json
{
  "chapter_id": 1,
  "current_position_seconds": 240,
  "is_completed": false
}
```

### DELETE /api/progress/:bookId
İlerleme sil

**Headers:**
- `X-Device-ID: <uuid>`

---

## Favorites

### GET /api/favorites
Kullanıcının favorileri

**Headers:**
- `X-Device-ID: <uuid>`

### POST /api/favorites
Favori ekle

**Headers:**
- `X-Device-ID: <uuid>`

**Body:**
```json
{
  "bookId": 1
}
```

### DELETE /api/favorites/:bookId
Favoriden çıkar

**Headers:**
- `X-Device-ID: <uuid>`

---

## Downloads

### GET /api/downloads
İndirilen kitaplar

**Headers:**
- `X-Device-ID: <uuid>`

### POST /api/downloads/:bookId
Kitap indir

**Headers:**
- `X-Device-ID: <uuid>`

### DELETE /api/downloads/:bookId
İndirmeyi kaldır

**Headers:**
- `X-Device-ID: <uuid>`

### GET /api/downloads/:bookId/status
İndirme durumu

**Headers:**
- `X-Device-ID: <uuid>`

---

## Admin

### GET /api/admin/dashboard/stats
Dashboard istatistikleri

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 500
    },
    "books": {
      "total": 100,
      "published": 80
    },
    "listening": {
      "totalHours": 5000
    },
    "revenue": {
      "monthly": 12000
    }
  }
}
```

### GET /api/admin/users
Kullanıcı listesi

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

### GET /api/admin/users/:id
Kullanıcı detayı

**Headers:**
- `Authorization: Bearer <token>`

### PUT /api/admin/users/:id
Kullanıcı güncelle

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Yeni İsim",
  "avatar_url": "https://...",
  "is_active": true
}
```

### DELETE /api/admin/users/:id
Kullanıcı sil

**Headers:**
- `Authorization: Bearer <token>`

---

## Upload

### POST /api/upload/book-cover
Kitap kapağı yükle (admin)

**Headers:**
- `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `cover` (file, max 5MB, jpeg/png/webp)

### POST /api/upload/chapter-audio
Bölüm ses dosyası yükle (admin)

**Headers:**
- `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `audio` (file, max 500MB, mp3/wav/ogg/m4a)

### POST /api/upload/avatar
Kullanıcı avatarı yükle

**Content-Type:** `multipart/form-data`

**Form Data:**
- `avatar` (file, max 5MB, jpeg/png/webp)

---

## Public

### GET /api/public/books
Herkese açık kitaplar (authentication gerekmez)

### GET /api/public/categories
Herkese açık kategoriler (authentication gerekmez)

---

## Health Check

### GET /health
Server health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

