# Path Encoding Sorunu Çözümü

## Sorun
PowerShell Türkçe karakterleri (`ı`, `ş`, `ğ`) içeren path'leri düzgün işleyemiyor.

## Çözüm 1: Tam Path Kullanma (Önerilen)

Expo komutlarını çalıştırırken tam path kullanın:

```powershell
# Tam path ile çalıştırma
Set-Location "E:\projeler\kitap aapp\ui tasarımı\mobil app"
npx expo start
```

## Çözüm 2: Kısayol Oluşturma

PowerShell'de bir alias oluşturun:

```powershell
# PowerShell profil dosyanıza ekleyin (bir kez)
Add-Content $PROFILE "`nfunction GoToMobileApp { Set-Location 'E:\projeler\kitap aapp\ui tasarımı\mobil app' }"

# Sonra kullanın:
GoToMobileApp
npx expo start
```

## Çözüm 3: Encoding Ayarları

PowerShell encoding ayarlarını değiştirin:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
```

## Çözüm 4: Klasör Adını Değiştirme (Kalıcı Çözüm)

Eğer sürekli sorun yaşıyorsanız, klasör adını İngilizce karakterlerle değiştirebilirsiniz:

```powershell
# Eski klasör adı: "ui tasarımı"
# Yeni klasör adı: "ui-tasarim" veya "ui-design"
Rename-Item "E:\projeler\kitap aapp\ui tasarımı" "E:\projeler\kitap aapp\ui-tasarim"
```

## Hızlı Komut

En hızlı çözüm için aşağıdaki komutu kullanın:

```powershell
$mobileAppPath = "E:\projeler\kitap aapp\ui tasarımı\mobil app"
Set-Location $mobileAppPath
npx expo start
```

## Not

Dosya gerçekten var ve `package.json` doğru konumda. Sorun sadece PowerShell'in path encoding'i ile ilgili.

