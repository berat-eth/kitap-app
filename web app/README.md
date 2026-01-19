# Sesli Kitap Sistemi

Next.js ile geliştirilmiş modern bir sesli kitap dinleme platformu.

## Özellikler

- 📚 Kitap listesi ve arama
- 🎵 Sesli kitap oynatıcı
- ⏯️ Oynat/Duraklat, ileri/geri sarma
- ⚡ Oynatma hızı ayarı (0.5x - 2x)
- 📖 Bölümler arası geçiş
- 💾 İlerleme kaydı (localStorage)
- 🏷️ Kategori filtreleme
- 📱 Responsive tasarım
- 🌙 Karanlık mod desteği

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Ortam değişkenlerini ayarlayın:

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

3. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## API Yapısı

Sistem, uzak sunucudan aşağıdaki endpoint'leri bekler:

- `GET /books` - Tüm kitapları getir
- `GET /books/:id` - Kitap detayını getir
- `GET /books/:id/chapters` - Kitap bölümlerini getir
- `GET /chapters/:id/audio` - Bölüm ses dosyası URL'ini getir
- `GET /books/search?q=query` - Kitap ara
- `GET /books?category=category` - Kategoriye göre kitapları getir
- `GET /categories` - Tüm kategorileri getir

## Proje Yapısı

```
kitap-site/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Ana layout
│   ├── page.tsx           # Ana sayfa
│   └── kitap/[id]/        # Kitap detay sayfası
├── components/            # React komponentleri
│   ├── AudioPlayer/       # Oynatıcı komponentleri
│   ├── BookList/          # Kitap listesi komponentleri
│   ├── CategoryFilter.tsx # Kategori filtresi
│   └── ChapterList.tsx    # Bölüm listesi
├── hooks/                 # Custom React hooks
│   ├── useAudioPlayer.ts  # Audio player hook
│   └── useProgress.ts     # İlerleme kaydı hook
└── lib/                   # Yardımcı fonksiyonlar
    ├── api.ts            # API istekleri
    ├── storage.ts        # localStorage yönetimi
    └── types.ts          # TypeScript tipleri
```

## Teknolojiler

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- HTML5 Audio API

## Lisans

MIT

