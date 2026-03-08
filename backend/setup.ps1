# =============================================================
# Sesli Kitap Backend - Otomatik Kurulum Scripti (Windows)
# Kullanım: powershell -ExecutionPolicy Bypass -File setup.ps1
# =============================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

function Write-Info    { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok      { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn    { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err     { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Sesli Kitap Backend - Kurulum Scripti    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Node.js kontrolü ──────────────────────────────────────
Write-Info "Node.js kontrol ediliyor..."
try {
    $nodeVersion = (node -v 2>&1).ToString().TrimStart('v').Split('.')[0]
    if ([int]$nodeVersion -lt 18) {
        Write-Err "Node.js 18+ gerekli. Mevcut: $(node -v). https://nodejs.org adresinden güncelleyin."
    }
    Write-Ok "Node.js $(node -v) bulundu."
} catch {
    Write-Err "Node.js bulunamadı. https://nodejs.org adresinden yükleyin."
}

# ── 2. npm kontrolü ──────────────────────────────────────────
try {
    $npmVer = (npm -v 2>&1).ToString()
    Write-Ok "npm $npmVer bulundu."
} catch {
    Write-Err "npm bulunamadı."
}

# ── 3. PM2 kurulumu ──────────────────────────────────────────
Write-Info "PM2 kontrol ediliyor..."
try {
    $pm2Ver = (pm2 -v 2>&1).ToString()
    Write-Ok "PM2 $pm2Ver bulundu."
} catch {
    Write-Warn "PM2 bulunamadı. Global olarak yükleniyor..."
    npm install -g pm2
    Write-Ok "PM2 yüklendi."
}

# ── 4. Bağımlılıkları yükle ──────────────────────────────────
Write-Info "npm bağımlılıkları yükleniyor..."
npm install
Write-Ok "Bağımlılıklar yüklendi."

# ── 5. .env dosyası ──────────────────────────────────────────
if (-not (Test-Path ".env")) {
    Write-Warn ".env dosyası bulunamadı. .env.example'dan kopyalanıyor..."
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "  ÖNEMLİ: .env dosyasını düzenleyip gerçek değerleri girin!    " -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Doldurmanız gereken değerler:" -ForegroundColor White
    Write-Host "    API_KEY       → Güçlü rastgele key" -ForegroundColor White
    Write-Host "    ADMIN_API_KEY → Güçlü rastgele key" -ForegroundColor White
    Write-Host "    DB_HOST       → MySQL sunucu adresi" -ForegroundColor White
    Write-Host "    DB_USER       → MySQL kullanıcı adı" -ForegroundColor White
    Write-Host "    DB_PASSWORD   → MySQL şifresi" -ForegroundColor White
    Write-Host "    DB_NAME       → Veritabanı adı" -ForegroundColor White
    Write-Host "    ALLOWED_ORIGINS → CORS (örn: https://plaxsy.com,https://api.plaxsy.com)" -ForegroundColor White
    Write-Host ""

    $editNow = Read-Host "  .env dosyasını şimdi Notepad ile açmak ister misiniz? [E/h]"
    if ($editNow -eq "" -or $editNow -match "^[Ee]") {
        Start-Process notepad ".env" -Wait
    } else {
        Write-Warn ".env düzenlenmedi. Devam etmeden önce düzenlemeyi unutmayın."
    }
} else {
    Write-Ok ".env dosyası mevcut."
}

# ── 6. .env doğrulama ────────────────────────────────────────
Write-Info ".env değişkenleri doğrulanıyor..."
$envContent = Get-Content ".env" | Where-Object { $_ -notmatch "^\s*#" -and $_ -match "=" }
$envVars = @{}
foreach ($line in $envContent) {
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $envVars[$parts[0].Trim()] = $parts[1].Trim().Trim('"').Trim("'")
    }
}

$required = @("API_KEY", "ADMIN_API_KEY", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")
$missing = @()
foreach ($var in $required) {
    $val = $envVars[$var]
    if (-not $val -or $val -like "*your_*") {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Warn "Aşağıdaki değişkenler hâlâ placeholder değer içeriyor:"
    foreach ($v in $missing) { Write-Host "    - $v" -ForegroundColor Yellow }
    Write-Host ""
    $cont = Read-Host "  Yine de devam etmek ister misiniz? [e/H]"
    if ($cont -notmatch "^[Ee]") {
        Write-Err "Kurulum iptal edildi. .env dosyasını doldurun ve tekrar çalıştırın."
    }
} else {
    Write-Ok ".env değişkenleri geçerli görünüyor."
}

# ── 7. TypeScript derleme ────────────────────────────────────
Write-Info "TypeScript derleniyor..."
npm run build
Write-Ok "Derleme tamamlandı → dist/"

# ── 8. Veritabanı migrasyonu ─────────────────────────────────
Write-Host ""
$runMigrate = Read-Host "  Veritabanı şemasını oluşturmak ister misiniz? (İlk kurumda Evet) [E/h]"
if ($runMigrate -eq "" -or $runMigrate -match "^[Ee]") {
    Write-Info "Veritabanı migrasyonu çalıştırılıyor..."
    npm run db:migrate
    Write-Ok "Migrasyon tamamlandı."
} else {
    Write-Warn "Migrasyon atlandı."
}

# ── 9. PM2 ecosystem dosyası ─────────────────────────────────
Write-Info "PM2 ecosystem.config.js oluşturuluyor..."
$ecosystemContent = @'
module.exports = {
  apps: [
    {
      name: 'sesli-kitap-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
'@
Set-Content -Path "ecosystem.config.js" -Value $ecosystemContent -Encoding UTF8
Write-Ok "ecosystem.config.js oluşturuldu."

# ── 10. Log klasörü ──────────────────────────────────────────
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" | Out-Null }
Write-Ok "logs/ klasörü hazır."

# ── 11. PM2 ile başlat ───────────────────────────────────────
Write-Info "PM2 ile uygulama başlatılıyor..."
$pm2List = pm2 list 2>&1 | Out-String
if ($pm2List -match "sesli-kitap-api") {
    Write-Warn "Mevcut PM2 süreci yeniden başlatılıyor..."
    pm2 reload ecosystem.config.js --update-env
} else {
    pm2 start ecosystem.config.js
}
Write-Ok "Uygulama PM2 ile başlatıldı."

# ── 12. PM2 kaydet ───────────────────────────────────────────
pm2 save
Write-Ok "PM2 süreç listesi kaydedildi."

# ── 13. Durum özeti ──────────────────────────────────────────
$port = if ($envVars["PORT"]) { $envVars["PORT"] } else { "3001" }
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  Kurulum tamamlandı!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  API URL  : http://localhost:$port/api" -ForegroundColor White
Write-Host "  Health   : http://localhost:$port/api/health" -ForegroundColor White
Write-Host ""
Write-Host "  Production: deploy/setup-deploy.sh (Linux) | deploy/nginx/kitap-sites.conf" -ForegroundColor Gray
Write-Host ""
Write-Host "  PM2 komutları:" -ForegroundColor White
Write-Host "    pm2 status                    -> Süreç durumu" -ForegroundColor Gray
Write-Host "    pm2 logs sesli-kitap-api      -> Logları izle" -ForegroundColor Gray
Write-Host "    pm2 restart sesli-kitap-api   -> Yeniden başlat" -ForegroundColor Gray
Write-Host "    pm2 stop sesli-kitap-api      -> Durdur" -ForegroundColor Gray
Write-Host "    pm2 delete sesli-kitap-api    -> Sil" -ForegroundColor Gray
Write-Host ""
pm2 status
