#!/usr/bin/env bash
# =============================================================
# Sesli Kitap Backend - Otomatik Kurulum Scripti (Linux/macOS)
# Kullanım: bash setup.sh
# =============================================================

set -euo pipefail

# ── Renkler ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Sesli Kitap Backend - Kurulum Scripti    ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ── 1. Node.js kontrolü ──────────────────────────────────────
info "Node.js kontrol ediliyor..."
if ! command -v node &>/dev/null; then
  error "Node.js bulunamadı. Lütfen Node.js 18+ yükleyin: https://nodejs.org"
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  error "Node.js 18+ gerekli. Mevcut sürüm: $(node -v)"
fi
success "Node.js $(node -v) bulundu."

# ── 2. npm kontrolü ──────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  error "npm bulunamadı."
fi
success "npm $(npm -v) bulundu."

# ── 3. PM2 kurulumu ──────────────────────────────────────────
info "PM2 kontrol ediliyor..."
if ! command -v pm2 &>/dev/null; then
  warn "PM2 bulunamadı. Global olarak yükleniyor..."
  npm install -g pm2
  success "PM2 yüklendi."
else
  success "PM2 $(pm2 -v) bulundu."
fi

# ── 4. Bağımlılıkları yükle ──────────────────────────────────
info "npm bağımlılıkları yükleniyor..."
npm install --production=false
success "Bağımlılıklar yüklendi."

# ── 5. .env dosyası ──────────────────────────────────────────
if [ ! -f ".env" ]; then
  warn ".env dosyası bulunamadı. .env.example'dan kopyalanıyor..."
  cp .env.example .env
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  ÖNEMLİ: .env dosyasını düzenleyip gerçek değerleri girin!    ${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "  Düzenlemek için: nano .env"
  echo ""
  echo "  Doldurmanız gereken değerler:"
  echo "    API_KEY          → Güçlü bir rastgele key (örn: openssl rand -hex 32)"
  echo "    ADMIN_API_KEY    → Güçlü bir rastgele key (örn: openssl rand -hex 32)"
  echo "    DB_HOST          → MySQL sunucu adresi"
  echo "    DB_USER          → MySQL kullanıcı adı"
  echo "    DB_PASSWORD      → MySQL şifresi"
  echo "    DB_NAME          → Veritabanı adı"
  echo ""
  echo "  Örnek API key üretmek için:"
  echo "    openssl rand -hex 32"
  echo ""

  read -rp "  .env dosyasını şimdi düzenlemek ister misiniz? [E/h]: " EDIT_ENV
  EDIT_ENV="${EDIT_ENV:-E}"
  if [[ "$EDIT_ENV" =~ ^[Ee]$ ]]; then
    "${EDITOR:-nano}" .env
  else
    warn ".env düzenlenmedi. Devam etmeden önce düzenlemeyi unutmayın."
  fi
else
  success ".env dosyası mevcut."
fi

# ── 6. .env doğrulama ────────────────────────────────────────
info ".env değişkenleri doğrulanıyor..."
REQUIRED_VARS=("API_KEY" "ADMIN_API_KEY" "DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME")
MISSING=()
for VAR in "${REQUIRED_VARS[@]}"; do
  VALUE=$(grep -E "^${VAR}=" .env | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$VALUE" ] || [[ "$VALUE" == *"your_"* ]]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  warn "Aşağıdaki değişkenler .env dosyasında hâlâ placeholder değer içeriyor:"
  for VAR in "${MISSING[@]}"; do
    echo "    - $VAR"
  done
  echo ""
  read -rp "  Yine de devam etmek ister misiniz? [e/H]: " CONTINUE
  CONTINUE="${CONTINUE:-H}"
  if [[ ! "$CONTINUE" =~ ^[Ee]$ ]]; then
    error "Kurulum iptal edildi. .env dosyasını doldurun ve tekrar çalıştırın."
  fi
else
  success ".env değişkenleri geçerli görünüyor."
fi

# ── 7. TypeScript derleme ────────────────────────────────────
info "TypeScript derleniyor..."
npm run build
success "Derleme tamamlandı → dist/"

# ── 8. Veritabanı migrasyonu ─────────────────────────────────
echo ""
read -rp "  Veritabanı şemasını oluşturmak ister misiniz? (İlk kurumda Evet seçin) [E/h]: " RUN_MIGRATE
RUN_MIGRATE="${RUN_MIGRATE:-E}"
if [[ "$RUN_MIGRATE" =~ ^[Ee]$ ]]; then
  info "Veritabanı migrasyonu çalıştırılıyor..."
  npm run db:migrate
  success "Migrasyon tamamlandı."
else
  warn "Migrasyon atlandı."
fi

# ── 9. PM2 ecosystem dosyası ─────────────────────────────────
info "PM2 ecosystem.config.js oluşturuluyor..."
cat > ecosystem.config.js << 'EOF'
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
EOF
success "ecosystem.config.js oluşturuldu."

# ── 10. Log klasörü ──────────────────────────────────────────
mkdir -p logs
success "logs/ klasörü hazır."

# ── 11. PM2 ile başlat ───────────────────────────────────────
info "PM2 ile uygulama başlatılıyor..."

if pm2 list | grep -q "sesli-kitap-api"; then
  warn "Mevcut PM2 süreci yeniden başlatılıyor..."
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi

success "Uygulama PM2 ile başlatıldı."

# ── 12. PM2 startup (sunucu yeniden başlayınca otomatik çalış)
echo ""
info "PM2 startup ayarlanıyor (sunucu yeniden başlayınca otomatik çalışır)..."
pm2 save
pm2 startup || warn "PM2 startup için root yetkisi gerekebilir. Çıktıdaki komutu manuel çalıştırın."

# ── 13. Durum özeti ──────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Kurulum tamamlandı!                                          ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PORT=$(grep -E "^PORT=" .env | cut -d= -f2 | tr -d '"' | tr -d "'" || echo "3001")
echo "  API URL  : http://localhost:${PORT}/api"
echo "  Health   : http://localhost:${PORT}/api/health"
echo ""
echo "  PM2 komutları:"
echo "    pm2 status                    → Süreç durumu"
echo "    pm2 logs sesli-kitap-api      → Logları izle"
echo "    pm2 restart sesli-kitap-api   → Yeniden başlat"
echo "    pm2 stop sesli-kitap-api      → Durdur"
echo "    pm2 delete sesli-kitap-api    → Sil"
echo ""
pm2 status
