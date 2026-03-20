#!/bin/bash
# ============================================================
# Wirbooks - Tek Script Canlıya Alma
# Sunucu kurulumu + Deploy + SSL (Let's Encrypt)
# API: api.wirbooks.com.tr | Ana site: wirbooks.com.tr
# Kullanım: sudo bash deploy/deploy.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="/var/www/wirbooks"
LOG_DIR="/var/log/wirbooks"
DOMAIN_API="api.wirbooks.com.tr"
DOMAIN_WEB="wirbooks.com.tr"
DATA_DIR="/root/data"
ENV_FILE="$DATA_DIR/.env"

# Proje kökü kontrolü
if [ ! -d "$PROJECT_ROOT/backend" ] || [ ! -d "$PROJECT_ROOT/web app" ]; then
  echo "HATA: Proje dizini bulunamadı. deploy.sh proje kökünden çalıştırılmalı."
  echo "Örnek: cd /path/to/kitap-app && sudo bash deploy/deploy.sh"
  exit 1
fi

echo "=============================================="
echo "  Wirbooks - Canlıya Alma (Tek Script)"
echo "=============================================="
echo ""

# --- 1. Sunucu Kurulumu (tüm bağımlılıklar) ---
echo "[1/6] Sistem güncelleniyor ve bağımlılıklar kuruluyor..."

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg

# Node.js 20.x
if ! command -v node &> /dev/null; then
  echo "  Node.js kuruluyor..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "  Node.js mevcut: $(node -v)"
fi

# rsync (dosya kopyalama için)
apt-get install -y -qq rsync 2>/dev/null || true

# PM2
if ! command -v pm2 &> /dev/null; then
  echo "  PM2 kuruluyor..."
  npm install -g pm2
else
  echo "  PM2 mevcut"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
  echo "  Nginx kuruluyor..."
  apt-get install -y nginx
else
  echo "  Nginx mevcut"
fi

# Certbot (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
  echo "  Certbot kuruluyor..."
  apt-get install -y certbot python3-certbot-nginx
else
  echo "  Certbot mevcut"
fi

echo "  Node.js: $(node -v)"

# --- 2. Dizinler ---
echo ""
echo "[2/6] Dizinler oluşturuluyor..."
mkdir -p $DEPLOY_DIR/backend $DEPLOY_DIR/web $LOG_DIR

# Tek env dosyası kontrolü
if [ ! -f "$ENV_FILE" ]; then
  echo "HATA: Tek env dosyası bulunamadı: $ENV_FILE"
  echo "Lütfen $ENV_FILE dosyasını DB + NEXT_PUBLIC + API_KEY değerleriyle oluşturun."
  exit 1
fi

# Env'i yükle (web build sırasında NEXT_PUBLIC değerleri gerekli)
set -a
source "$ENV_FILE"
set +a

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://$DOMAIN_API/api}"
export NEXT_PUBLIC_API_KEY="${NEXT_PUBLIC_API_KEY:-${API_KEY:-}}"

# --- 3. Backend Deploy ---
echo ""
echo "[3/6] Backend deploy ediliyor..."
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'uploads' \
  --exclude '.git' \
  "$PROJECT_ROOT/backend/" "$DEPLOY_DIR/backend/"

cd $DEPLOY_DIR/backend
npm install --production
mkdir -p uploads/audio uploads/covers

# --- 4. Web App Deploy ---
echo ""
echo "[4/6] Web app deploy ediliyor..."
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env.local' \
  --exclude '.git' \
  "$PROJECT_ROOT/web app/" "$DEPLOY_DIR/web/"

cd $DEPLOY_DIR/web
npm install
rm -rf .next
npm run build

# --- 5. Nginx + PM2 ---
echo ""
echo "[5/6] Nginx ve PM2 yapılandırılıyor..."

cat > /etc/nginx/sites-available/wirbooks << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN_API};
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 50M;
    }
    location /uploads {
        alias ${DEPLOY_DIR}/backend/uploads;
    }
}
server {
    listen 80;
    server_name ${DOMAIN_WEB} www.${DOMAIN_WEB};
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/wirbooks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/plaxsy 2>/dev/null || true
nginx -t && systemctl reload nginx

cat > $DEPLOY_DIR/ecosystem.config.js << PM2EOF
module.exports = {
  apps: [
    {
      name: 'wirbooks-api',
      cwd: '${DEPLOY_DIR}/backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: '${LOG_DIR}/api-error.log',
      out_file: '${LOG_DIR}/api-out.log',
      merge_logs: true,
    },
    {
      name: 'wirbooks-web',
      cwd: '${DEPLOY_DIR}/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: { 
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: '${NEXT_PUBLIC_API_URL}',
        NEXT_PUBLIC_API_KEY: '${NEXT_PUBLIC_API_KEY}'
      },
      error_file: '${LOG_DIR}/web-error.log',
      out_file: '${LOG_DIR}/web-out.log',
      merge_logs: true,
    },
  ],
};
PM2EOF

cd $DEPLOY_DIR
pm2 delete wirbooks-api wirbooks-web 2>/dev/null || true
pm2 delete plaxsy-api plaxsy-web 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true

# --- 6. SSL ---
echo ""
echo "[6/6] SSL sertifikası alınıyor (Let's Encrypt)..."
if certbot --nginx -d $DOMAIN_API -d $DOMAIN_WEB -d www.$DOMAIN_WEB \
  --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>/dev/null; then
  echo "  SSL kuruldu"
else
  echo "  UYARI: SSL alınamadı. DNS kontrol edin: $DOMAIN_API, $DOMAIN_WEB -> sunucu IP"
  echo "  Sonra manuel: sudo certbot --nginx -d $DOMAIN_API -d $DOMAIN_WEB -d www.$DOMAIN_WEB"
fi

echo ""
echo "=============================================="
echo "  Wirbooks deploy tamamlandı"
echo "=============================================="
echo "API:  https://$DOMAIN_API"
echo "Web:  https://$DOMAIN_WEB"
echo ""
echo "pm2 status   - durum"
echo "pm2 logs    - loglar"
echo ""
