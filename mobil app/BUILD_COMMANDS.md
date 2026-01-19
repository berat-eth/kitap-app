# 🚀 Hızlı Build Komutları

## Adım Adım Build

### 1. Hazırlık
```bash
cd "mobil app"
npm install
```

### 2. EAS'a Giriş
```bash
eas login
```

### 3. Proje Oluştur (İlk Kez)
```bash
eas build:configure
```

### 4. Build Komutları

#### Android APK (Önerilen - Test İçin)
```bash
# Preview build - APK formatında
eas build -p android --profile preview

# Production build - APK formatında  
eas build -p android --profile production
```

#### iOS (Apple Developer Hesabı Gerekir)
```bash
# Preview build
eas build -p ios --profile preview

# Production build
eas build -p ios --profile production
```

#### Her İki Platform Birden
```bash
eas build --platform all --profile preview
```

### 5. Build Durumu
```bash
# Tüm build'leri listele
eas build:list

# En son build'i göster
eas build:list --limit 1
```

## 📥 APK İndirme

Build tamamlandığında:

1. **Terminal'de link gösterilir**:
```
✔ Build finished

Android build:
https://expo.dev/artifacts/[build-id]
```

2. **Veya Dashboard'dan**:
```bash
# Tarayıcıda aç
open https://expo.dev
```

## 🔄 Versiyon Güncelleme

Her yeni build öncesi:

```bash
# app.json dosyasında version artır
# "version": "1.0.1"
# "android.versionCode": 2
```

## 💡 İpuçları

- **İlk build**: 15-20 dakika sürer
- **Sonraki build'ler**: 5-10 dakika sürer (cache sayesinde)
- **APK boyutu**: ~30-50 MB
- **Free plan**: Ayda 30 build hakkı

## ⚡ Tek Komut Build

```bash
cd "mobil app" && npm install && eas build -p android --profile preview
```

Bu komut:
1. Dizine girer
2. Bağımlılıkları kurar
3. Android APK build başlatır

## 📱 Test Cihazına Yükleme

### Yöntem 1: QR Kod (En Kolay)
1. Build tamamlanınca QR kod gösterilir
2. Android cihazda QR kodu tara
3. APK indirilir ve yüklenir

### Yöntem 2: Direkt Link
1. Build linkini tıkla
2. APK'yı indir
3. Cihaza transfer et ve yükle

### Yöntem 3: ADB
```bash
# APK'yı indir
wget [build-url] -O app.apk

# Cihaza yükle
adb install app.apk
```

## 🎯 Önerilen Workflow

```bash
# 1. Kod değişikliklerini test et
npm start

# 2. Build oluştur
eas build -p android --profile preview

# 3. APK'yı test cihazına yükle
# (QR kod veya direkt indirme)

# 4. Test et

# 5. Her şey tamam ise production build
eas build -p android --profile production
```

