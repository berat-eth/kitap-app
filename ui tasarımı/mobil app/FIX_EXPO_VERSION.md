# Expo 51 Versiyon Düzeltmesi

## Sorun
Yanlış Expo versiyonu (54) yüklenmiş. Expo 51 kullanılmalı.

## Çözüm Adımları

1. **Mobil app dizinine gidin:**
```powershell
cd "E:\projeler\kitap aapp\ui tasarımı\mobil app"
```

2. **Mevcut node_modules'ü temizleyin:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

3. **Expo 51'i yükleyin:**
```powershell
npm install expo@~51.0.28 --save-exact
```

4. **Diğer Expo paketlerini Expo 51 ile uyumlu versiyonlara güncelleyin:**
```powershell
npx expo install --fix
```

Bu komut tüm Expo paketlerini SDK 51 ile uyumlu versiyonlara güncelleyecektir.

5. **Versiyonu kontrol edin:**
```powershell
npm list expo
```

Çıktıda `expo@51.0.28` veya benzeri bir versiyon görmelisiniz.

## Alternatif: Manuel Paket Güncelleme

Eğer `expo install --fix` çalışmazsa, aşağıdaki komutları kullanın:

```powershell
npx expo install expo@51.0.28
npx expo install expo-av@14.0.7
npx expo install expo-linear-gradient@13.0.2
npx expo install expo-font@12.0.9
npx expo install expo-splash-screen@0.27.5
npx expo install expo-status-bar@1.12.1
```

## Not
`package.json` dosyası Expo 51 için güncellenmiştir. `npx expo install --fix` komutu tüm paketleri otomatik olarak doğru versiyonlara güncelleyecektir.

