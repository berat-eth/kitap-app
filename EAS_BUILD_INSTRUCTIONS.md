# 📱 Mobil Uygulama EAS Build Talimatları

## 🚀 Hızlı Başlangıç

### 1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### 2. Expo Hesabı
https://expo.dev adresinden ücretsiz hesap oluşturun

### 3. Build Komutları

```bash
# Mobil app dizinine gidin
cd "mobil app"

# EAS'a giriş yapın
eas login

# İlk kez: Proje yapılandırması
eas build:configure

# Android APK build (Test için)
eas build -p android --profile preview

# Android Production build
eas build -p android --profile production

# iOS build (Apple Developer hesabı gerekir)
eas build -p ios --profile preview
```

## 📦 Build Profilleri

### Preview (Önerilen - Test İçin)
- APK formatında
- Doğrudan cihaza yüklenebilir
- Google Play Store gerektirmez
- Hızlı test için ideal

```bash
eas build -p android --profile preview
```

### Production (Store Yayını İçin)
- AAB veya APK formatında
- Release imzalı
- Google Play Store'a yüklemeye hazır

```bash
eas build -p android --profile production
```

## 🔧 Yapılandırma Dosyaları

### eas.json
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### app.json
- Bundle identifier: `com.seslikitap.app`
- Package name: `com.seslikitap.app`
- Version: `1.0.0`

## 📱 APK Yükleme

Build tamamlandığında:

1. **QR Kod ile**: Terminal'de gösterilen QR kodu tarayın
2. **Direkt Link**: Expo dashboard'dan APK'yı indirin
3. **ADB ile**: `adb install app.apk`

## ⏱️ Build Süreleri

- İlk build: 15-20 dakika
- Sonraki build'ler: 5-10 dakika (cache)
- APK boyutu: ~30-50 MB

## 💰 EAS Pricing

- **Free**: Ayda 30 build (test için yeterli)
- **Production**: $29/ay (unlimited)

## 📚 Detaylı Rehber

- `BUILD_GUIDE.md` - Kapsamlı build rehberi
- `BUILD_COMMANDS.md` - Hızlı komut referansı
- `src/config/api.ts` - API yapılandırması

## 🎯 Önerilen Workflow

```bash
# 1. Kod değişikliklerini test et
npm start

# 2. Preview build oluştur
eas build -p android --profile preview

# 3. APK'yı test cihazına yükle

# 4. Test et

# 5. Production build
eas build -p android --profile production

# 6. Google Play Store'a yükle
```

## 🔗 Yararlı Linkler

- **EAS Dashboard**: https://expo.dev
- **Build Docs**: https://docs.expo.dev/build/introduction/
- **Expo Forums**: https://forums.expo.dev/

## 📞 Destek

Build sorunları için:
- Expo Discord: https://discord.gg/expo
- EAS Docs: https://docs.expo.dev/eas/

---

**Not**: İlk build'de `eas build:configure` komutu project ID oluşturacak ve `app.json` dosyasını güncelleyecektir.

