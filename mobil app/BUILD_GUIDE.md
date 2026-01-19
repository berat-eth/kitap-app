# Mobil Uygulama Build Rehberi (EAS)

## 📱 EAS Build ile Uygulama Oluşturma

### Gereksinimler

1. **Expo Account**: https://expo.dev üzerinden ücretsiz hesap oluşturun
2. **EAS CLI**: Global olarak kurulu olmalı

```bash
npm install -g eas-cli
```

### 1. Expo'ya Giriş Yapın

```bash
cd "mobil app"
eas login
```

Expo hesap bilgilerinizle giriş yapın.

### 2. Proje Yapılandırması

```bash
# EAS project oluştur
eas build:configure
```

Bu komut:
- `eas.json` dosyasını oluşturur (zaten var)
- Expo project ID oluşturur
- `app.json` dosyasını günceller

### 3. Android Build (APK)

#### Preview Build (Test İçin)
```bash
eas build -p android --profile preview
```

Bu komut:
- ✅ APK dosyası oluşturur (AAB değil)
- ✅ Cihaza doğrudan yüklenebilir
- ✅ Google Play Store gerektirmez
- ⏱️ Yaklaşık 10-15 dakika sürer

#### Production Build
```bash
eas build -p android --profile production
```

Bu komut:
- ✅ AAB dosyası oluşturur (Google Play için)
- ✅ Release imzalı
- ✅ Google Play Store'a yüklenmeye hazır

### 4. iOS Build

#### Preview Build (Test İçin)
```bash
eas build -p ios --profile preview
```

#### Production Build
```bash
eas build -p ios --profile production
```

**Not**: iOS build için Apple Developer hesabı gerekir ($99/yıl)

### 5. Build Durumunu Kontrol Etme

```bash
# Tüm build'leri listele
eas build:list

# Belirli bir build'in durumunu görüntüle
eas build:view [BUILD_ID]
```

### 6. Build Sonrası

Build tamamlandığında:
1. **Expo dashboard**'da build linkini göreceksiniz: https://expo.dev
2. APK/IPA dosyasını indirebilirsiniz
3. QR kod ile doğrudan cihaza yükleyebilirsiniz

## 📦 Build Profilleri

### Development
```bash
eas build -p android --profile development
```
- Development client içerir
- Hot reload özelliği var
- Debug için ideal

### Preview  
```bash
eas build -p android --profile preview
```
- Internal testing için
- APK formatında (Android)
- Hızlı iterasyon

### Production
```bash
eas build -p android --profile production
```
- Store'a yükleme için
- Optimize edilmiş
- Release imzalı

## 🔧 Konfigürasyon

### app.json Ayarları

```json
{
  "expo": {
    "name": "Sesli Kitap",
    "slug": "sesli-kitap-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.beratsimsek.audiobook"
    },
    "android": {
      "package": "com.beratsimsek.audiobook",
      "versionCode": 1
    }
  }
}
```

### eas.json Profilleri

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

## 🚀 Hızlı Başlangıç

```bash
# 1. Dizine gidin
cd "mobil app"

# 2. Bağımlılıkları kurun
npm install

# 3. EAS'a giriş yapın
eas login

# 4. Build yapın
eas build -p android --profile preview

# 5. Build tamamlanınca QR kod ile yükleyin
```

## 📱 APK Yükleme

### Android Cihaza Yükleme

1. **EAS Dashboard'dan indir**:
   - https://expo.dev adresine gidin
   - Builds sekmesine tıklayın
   - APK dosyasını indirin

2. **Doğrudan QR kod ile**:
   - Build tamamlandığında verilen QR kodu tarayın
   - Expo Go uygulaması ile açın
   - "Install" butonuna tıklayın

3. **USB ile**:
```bash
adb install app-release.apk
```

## 🔑 API Konfigürasyonu

Uygulamayı backend API'ye bağlamak için:

```typescript
// mobil app/src/config/api.ts
export const API_CONFIG = {
  baseURL: 'https://api.kitap.beratsimsek.com.tr/api',
  timeout: 30000,
};
```

## 📊 Build Boyutları

- **Android APK**: ~30-50 MB
- **iOS IPA**: ~40-60 MB

## 🐛 Sorun Giderme

### Build Hatası: "No bundle identifier"

**Çözüm**: `app.json` dosyasında `ios.bundleIdentifier` ekleyin:

```json
"ios": {
  "bundleIdentifier": "com.beratsimsek.audiobook"
}
```

### Build Hatası: "No Android package"

**Çözüm**: `app.json` dosyasında `android.package` ekleyin:

```json
"android": {
  "package": "com.beratsimsek.audiobook"
}
```

### Build Çok Uzun Sürüyor

- İlk build 15-20 dakika sürebilir
- Sonraki build'ler cache sayesinde daha hızlı olur
- EAS ücretsiz plan: Sırada bekleyebilir

### APK Yüklenmiyor

1. **Bilinmeyen Kaynaklar**: Android ayarlarından "Bilinmeyen kaynaklardan uygulama yükleme" izni verin
2. **Google Play Protect**: Uyarı gelirse "Yine de yükle" seçin

## 💰 EAS Pricing

- **Free**: Aylık 30 build (yeterli test için)
- **Production**: $29/ay (unlimited builds)
- **Enterprise**: $899/ay

## 📚 Yararlı Linkler

- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Dashboard**: https://expo.dev
- **Build Status**: https://expo.dev/accounts/[username]/projects/[project]/builds

## 🎯 Sonraki Adımlar

1. ✅ Android Preview build oluştur
2. ✅ Test cihazında test et
3. ✅ Production build oluştur
4. ✅ Google Play Console'a yükle
5. ✅ iOS build (opsiyonel - Apple Developer hesabı gerekir)

## 📞 Destek

Build ile ilgili sorunlar için:
- Expo Discord: https://discord.gg/expo
- Expo Forums: https://forums.expo.dev/

