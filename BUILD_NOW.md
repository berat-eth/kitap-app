# 🚀 ŞİMDİ BUILD YAP

## Terminalde Bu Komutları Çalıştırın:

### 1. Dizine Git
```powershell
cd "e:\projeler\kitap aapp\mobil app"
```

### 2. EAS Proje Oluştur
```powershell
eas init
```
**Soru geldiğinde**: `Y` yazıp Enter'a basın

### 3. Production Build Başlat
```powershell
eas build -p android --profile production
```

## ⏱️ Beklenen Süre: 15-20 dakika

## 📥 Build Tamamlandığında:

1. Terminal'de **QR kod** gösterilecek
2. Veya **direkt link** verilecek
3. APK'yı indirin ve Android cihaza yükleyin

---

## 🎯 Tek Seferde (Hepsi Birden):

```powershell
cd "e:\projeler\kitap aapp\mobil app"; eas init; eas build -p android --profile production
```

**Not**: Her komut için onay vermeniz gerekebilir.

