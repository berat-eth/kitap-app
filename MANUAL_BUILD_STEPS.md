# 📱 Manuel EAS Build Adımları

## ⚠️ Önemli Not

EAS build interaktif bir süreçtir ve manuel olarak çalıştırılması gerekir.

## 🚀 Build Adımları

### 1. Terminalde Mobil App Dizinine Gidin

```powershell
cd "e:\projeler\kitap aapp\mobil app"
```

### 2. EAS Projesi Oluşturun (İlk Kez)

```powershell
eas init
```

Bu komut size soracak:
- **"Would you like to create a project?"** → **Y** (Yes) yazın

Expo otomatik olarak:
- ✅ Yeni bir project ID oluşturacak
- ✅ `app.json` dosyasını güncelleyecek
- ✅ Projeyi Expo hesabınıza bağlayacak

### 3. Build Yapılandırmasını Kontrol Edin

```powershell
eas build:configure
```

Bu komut:
- ✅ `eas.json` dosyasını doğrular
- ✅ Build profillerini kontrol eder

### 4. Production Build Başlatın

#### Android APK (Önerilen)
```powershell
eas build -p android --profile production
```

#### Android Preview (Test İçin)
```powershell
eas build -p android --profile preview
```

### 5. Build Sürecini İzleyin

Build başladığında:
- ⏱️ Yaklaşık 10-20 dakika sürer
- 📊 Terminal'de ilerleme gösterilir
- 🔗 Build URL'i verilir

### 6. Build Tamamlandığında

Terminal'de şunları göreceksiniz:
```
✔ Build finished

Android build:
https://expo.dev/artifacts/[build-id]

QR code:
[QR CODE]
```

### 7. APK'yı İndirin

**Yöntem 1: QR Kod**
- Android cihazınızla QR kodu tarayın
- APK otomatik indirilir

**Yöntem 2: Direkt Link**
- Terminal'deki linke tıklayın
- APK'yı bilgisayarınıza indirin

**Yöntem 3: Expo Dashboard**
- https://expo.dev adresine gidin
- "Builds" sekmesine tıklayın
- En son build'i bulun ve APK'yı indirin

## 📋 Tüm Komutlar (Sırayla)

```powershell
# 1. Dizine git
cd "e:\projeler\kitap aapp\mobil app"

# 2. Proje oluştur (ilk kez)
eas init

# 3. Build yapılandır
eas build:configure

# 4. Production build başlat
eas build -p android --profile production
```

## 🔧 Yapılandırma Dosyaları

### eas.json (Hazır)
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

### app.json (Hazır)
- **Package**: `com.seslikitap.app`
- **Version**: `1.0.0`
- **Version Code**: `1`

## 📱 Build Profilleri

### Preview (Test)
```powershell
eas build -p android --profile preview
```
- APK formatında
- Hızlı test için
- Internal distribution

### Production (Yayın)
```powershell
eas build -p android --profile production
```
- APK formatında
- Release imzalı
- Store'a yüklenmeye hazır

## 🐛 Sorun Giderme

### "Input is required" Hatası
**Çözüm**: Komutu PowerShell terminalinde manuel olarak çalıştırın (otomatik çalıştırma desteklenmiyor)

### "EAS project not configured" Hatası
**Çözüm**: Önce `eas init` komutunu çalıştırın

### "Invalid UUID" Hatası
**Çözüm**: `app.json` dosyasındaki `extra.eas.projectId` alanını silin ve `eas init` komutunu tekrar çalıştırın

### Build Çok Uzun Sürüyor
- İlk build 15-20 dakika sürebilir
- Sonraki build'ler daha hızlı olur (cache)
- Free plan: Sırada bekleyebilir

## 💰 EAS Pricing

- **Free**: Ayda 30 build
- **Production**: $29/ay (unlimited)

## 📊 Build Durumu Kontrol

```powershell
# Tüm build'leri listele
eas build:list

# En son 5 build
eas build:list --limit 5

# Belirli platform
eas build:list --platform android
```

## 🎯 Sonraki Adımlar

1. ✅ `eas init` ile proje oluştur
2. ✅ `eas build -p android --profile production` ile build başlat
3. ✅ Build tamamlanınca APK'yı indir
4. ✅ Android cihaza yükle ve test et
5. ✅ Google Play Console'a yükle (opsiyonel)

## 📞 Destek

- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Dashboard**: https://expo.dev
- **Discord**: https://discord.gg/expo

---

## ⚡ Hızlı Başlangıç

```powershell
cd "e:\projeler\kitap aapp\mobil app"
eas init
eas build -p android --profile production
```

**Not**: Her komut için terminal'de onay vermeniz gerekecek.

