# Expo 51 Mobil App Başlatma Scripti
# Path encoding sorununu çözmek için

$ErrorActionPreference = "Stop"

# Tam path kullanarak dizine geç
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$mobileAppPath = Join-Path $scriptPath ".." | Resolve-Path

Write-Host "Mobil app dizinine geçiliyor: $mobileAppPath" -ForegroundColor Green

try {
    Set-Location $mobileAppPath
    
    Write-Host "Expo başlatılıyor..." -ForegroundColor Yellow
    npx expo start
    
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host "Lütfen manuel olarak şu komutu çalıştırın:" -ForegroundColor Yellow
    Write-Host "Set-Location 'E:\projeler\kitap aapp\ui tasarımı\mobil app'" -ForegroundColor Cyan
    Write-Host "npx expo start" -ForegroundColor Cyan
    exit 1
}

