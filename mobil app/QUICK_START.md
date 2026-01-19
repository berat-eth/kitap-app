# Hızlı Başlangıç

## Sorun Giderme

Eğer `npm start` komutu Next.js başlatıyorsa, şunları deneyin:

### Yöntem 1: Expo CLI ile doğrudan başlatma
```bash
cd "ui tasarımı\mobil app"
npx expo start
```

### Yöntem 2: npm script ile
```bash
cd "ui tasarımı\mobil app"
npm run start
```

### Yöntem 3: Expo CLI global yüklüyse
```bash
cd "ui tasarımı\mobil app"
expo start
```

## Notlar

- `package.json` dosyasındaki `main` field'ı `node_modules/expo/AppEntry.js` olarak ayarlandı
- Eğer hala sorun yaşıyorsanız, `node_modules` klasörünü silip tekrar `npm install` çalıştırın:
```bash
cd "ui tasarımı\mobil app"
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

## Platform Seçenekleri

- **Android**: `npm run android` veya `npx expo start --android`
- **iOS**: `npm run ios` veya `npx expo start --ios` (macOS gerekli)
- **Web**: `npm run web` veya `npx expo start --web`

## Expo Go Uygulaması

1. Telefonunuza Expo Go uygulamasını indirin (App Store / Play Store)
2. `npm start` çalıştırdığınızda QR kod görünecek
3. QR kodu Expo Go ile tarayın

