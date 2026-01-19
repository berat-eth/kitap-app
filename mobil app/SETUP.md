# Kurulum Talimatları

## Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Expo CLI (otomatik yüklenecek)

## Adımlar

1. Bağımlılıkları yükleyin:
```bash
cd "ui tasarımı/mobil app"
npm install
```

2. Font dosyalarını ekleyin:
   - `assets/fonts/` klasörüne Lexend font dosyalarını ekleyin
   - Google Fonts'tan indirebilirsiniz: https://fonts.google.com/specimen/Lexend

3. Uygulamayı çalıştırın:
```bash
npm start
```

4. QR kodu Expo Go uygulaması ile tarayın veya:
   - Android için: `npm run android`
   - iOS için: `npm run ios` (macOS gerekli)
   - Web için: `npm run web`

## Notlar

- İlk çalıştırmada Expo CLI otomatik yüklenecektir
- Mock data kullanılmaktadır, backend entegrasyonu sonraki aşamada yapılacaktır
- Fontlar yüklenene kadar sistem fontları kullanılacaktır

