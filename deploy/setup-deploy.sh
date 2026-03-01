#!/usr/bin/env bash
# =============================================================
# Sesli Kitap - Sunucu Kurulum Scripti (Linux)
# kitap1.beratsimsek.com.tr  → Web sitesi
# api1.beratsimsek.com.tr    → API
# Kullanım: bash setup-deploy.sh
# =============================================================

set -euo pipefail

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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Sesli Kitap - Sunucu Kurulum Scripti     ${NC}"
echo -e "${CYAN}  kitap1 + api1.beratsimsek.com.tr         ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ── 1. Proje dizinleri ─────────────────────────────────────
info "Proje dizinleri oluşturuluyor..."
DEPLOY_DIR="/var/www/kitap-app"
sudo mkdir -p "$DEPLOY_DIR/backend"
sudo mkdir -p "$DEPLOY_DIR/web-app"
sudo mkdir -p "$DEPLOY_DIR/backend/uploads"
sudo mkdir -p "$DEPLOY_DIR/backend/logs"
success "Dizinler hazır: $DEPLOY_DIR"

# ── 2. Backend kurulumu ─────────────────────────────────────
info "Backend kuruluyor..."
cd "$PROJECT_ROOT/backend"
npm install --production=false
npm run build
success "Backend derlendi."

# Backend dosyalarını kopyala
sudo cp -r dist package.json package-lock.json ecosystem.config.js "$DEPLOY_DIR/backend/"
sudo cp .env "$DEPLOY_DIR/backend/" 2>/dev/null || warn ".env bulunamadı - backend/.env oluşturun"
sudo cp -r node_modules "$DEPLOY_DIR/backend/" 2>/dev/null || (cd "$DEPLOY_DIR/backend" && sudo npm install --production)
success "Backend kopyalandı."

# ── 3. .env CORS kontrolü ──────────────────────────────────
info "CORS ayarları kontrol ediliyor..."
ENV_FILE="$DEPLOY_DIR/backend/.env"
if [ -f "$ENV_FILE" ]; then
  if ! grep -q "kitap1.beratsimsek.com.tr" "$ENV_FILE"; then
    warn "ALLOWED_ORIGINS'a https://kitap1.beratsimsek.com.tr ekleyin!"
    echo "  Örnek: ALLOWED_ORIGINS=https://kitap1.beratsimsek.com.tr,https://api1.beratsimsek.com.tr"
  else
    success "CORS origins mevcut."
  fi
fi

# ── 4. Web app kurulumu ─────────────────────────────────────
info "Web uygulaması kuruluyor..."
cd "$PROJECT_ROOT/web app"
# Production API URL (build zamanında gerekli)
export NEXT_PUBLIC_API_URL="https://api1.beratsimsek.com.tr/api"
[ -f .env.local ] && export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true
npm install
npm run build
success "Web app derlendi."

# Web app dosyalarını kopyala
sudo cp -r .next package.json package-lock.json public "$DEPLOY_DIR/web-app/" 2>/dev/null || true
sudo cp -r node_modules "$DEPLOY_DIR/web-app/" 2>/dev/null || (cd "$DEPLOY_DIR/web-app" && sudo npm install --production)
success "Web app kopyalandı."

# ── 5. Nginx yapılandırması ─────────────────────────────────
info "Nginx yapılandırması kuruluyor..."
NGINX_CONF="$SCRIPT_DIR/nginx/kitap-sites.conf"
if [ -f "$NGINX_CONF" ]; then
  sudo cp "$NGINX_CONF" /etc/nginx/sites-available/kitap-sites.conf
  sudo ln -sf /etc/nginx/sites-available/kitap-sites.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
  if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx 2>/dev/null || warn "Nginx reload başarısız - manuel: systemctl reload nginx"
    success "Nginx yapılandırıldı."
  else
    warn "Nginx config hatası. Kontrol: nginx -t"
  fi
else
  warn "Nginx config bulunamadı: $NGINX_CONF"
fi

# ── 6. PM2 ile başlat ───────────────────────────────────────
info "PM2 süreçleri başlatılıyor..."

# Backend
cd "$DEPLOY_DIR/backend"
if pm2 list 2>/dev/null | grep -q "sesli-kitap-api"; then
  pm2 reload ecosystem.config.js --update-env
  success "Backend yeniden yüklendi."
else
  pm2 start ecosystem.config.js
  success "Backend başlatıldı."
fi

# Web app - ecosystem gerekli
sudo mkdir -p "$DEPLOY_DIR/web-app/logs"
if [ ! -f "$DEPLOY_DIR/web-app/ecosystem.config.js" ]; then
  cat << 'WEBEOF' | sudo tee "$DEPLOY_DIR/web-app/ecosystem.config.js" > /dev/null
module.exports = {
  apps: [{
    name: 'sesli-kitap-web',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/kitap-app/web-app',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: '/var/www/kitap-app/web-app/logs/err.log',
    out_file: '/var/www/kitap-app/web-app/logs/out.log',
  }],
};
WEBEOF
fi

cd "$DEPLOY_DIR/web-app"
if pm2 list 2>/dev/null | grep -q "sesli-kitap-web"; then
  pm2 reload ecosystem.config.js --update-env
  success "Web app yeniden yüklendi."
else
  pm2 start ecosystem.config.js
  success "Web app başlatıldı."
fi

pm2 save

# ── 7. İzinler ──────────────────────────────────────────────
info "Dosya izinleri ayarlanıyor..."
sudo chown -R "$USER:$USER" "$DEPLOY_DIR" 2>/dev/null || sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || true
success "İzinler ayarlandı."

# ── 8. Özet ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Kurulum tamamlandı!                                          ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Web sitesi : https://kitap1.beratsimsek.com.tr"
echo "  API        : https://api1.beratsimsek.com.tr"
echo ""
echo "  DNS kayıtları (A veya CNAME) sunucu IP'nize yönlendirilmeli."
echo ""
echo "  HTTPS için Let's Encrypt:"
echo "    sudo certbot --nginx -d kitap1.beratsimsek.com.tr -d api1.beratsimsek.com.tr"
echo ""
echo "  PM2 komutları:"
echo "    pm2 status"
echo "    pm2 logs sesli-kitap-api"
echo "    pm2 logs sesli-kitap-web"
echo ""
pm2 status
