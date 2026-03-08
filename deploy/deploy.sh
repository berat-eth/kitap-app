#!/bin/bash
# ============================================================
# Plaxsy - Tek Script Canlıya Alma
# Sunucu kurulumu + Deploy + SSL (Let's Encrypt)
# Domain: api.plaxsy.com, plaxsy.com
# Kullanım: sudo bash deploy.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="/var/www/plaxsy"
LOG_DIR="/var/log/plaxsy"
DOMAIN_API="api.plaxsy.com"
DOMAIN_WEB="plaxsy.com"

# Proje kökü kontrolü
if [ ! -d "$PROJECT_ROOT/sesli-kitap-backend" ] || [ ! -d "$PROJECT_ROOT/web app" ]; then
  echo "HATA: Proje dizini bulunamadı. deploy.sh proje kökünden çalıştırılmalı."
  echo "Örnek: cd /path/to/kitap-app && sudo bash deploy/deploy.sh"
  exit 1
fi

echo "=============================================="
echo "  Plaxsy - Canlıya Alma (Tek Script)"
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

# --- 3. Backend Deploy ---
echo ""
echo "[3/6] Backend deploy ediliyor..."
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '.git' \
  "$PROJECT_ROOT/sesli-kitap-backend/" "$DEPLOY_DIR/backend/"

if [ -f "$PROJECT_ROOT/sesli-kitap-backend/.env" ]; then
  cp "$PROJECT_ROOT/sesli-kitap-backend/.env" "$DEPLOY_DIR/backend/.env"
  echo "  .env kopyalandı"
else
  echo "  UYARI: sesli-kitap-backend/.env bulunamadı - manuel ekleyin"
fi

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

cat > "$DEPLOY_DIR/web/.env.local" << ENVEOF
NEXT_PUBLIC_API_URL=https://$DOMAIN_API/api
NEXT_PUBLIC_API_KEY=
ENVEOF
if [ -f "$PROJECT_ROOT/web app/.env.local" ]; then
  NEXT_KEY=$(grep NEXT_PUBLIC_API_KEY "$PROJECT_ROOT/web app/.env.local" | cut -d'=' -f2)
  [ -n "$NEXT_KEY" ] && sed -i "s|NEXT_PUBLIC_API_KEY=|NEXT_PUBLIC_API_KEY=$NEXT_KEY|" "$DEPLOY_DIR/web/.env.local"
fi

cd $DEPLOY_DIR/web
npm install
npm run build

# --- 5. Nginx + PM2 ---
echo ""
echo "[5/6] Nginx ve PM2 yapılandırılıyor..."

cat > /etc/nginx/sites-available/plaxsy << 'NGINXEOF'
server {
    listen 80;
    server_name api.plaxsy.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
    location /uploads {
        alias /var/www/plaxsy/backend/uploads;
    }
}
server {
    listen 80;
    server_name plaxsy.com www.plaxsy.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/plaxsy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

cat > $DEPLOY_DIR/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'plaxsy-api',
      cwd: '/var/www/plaxsy/backend',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      error_file: '/var/log/plaxsy/api-error.log',
      out_file: '/var/log/plaxsy/api-out.log',
      merge_logs: true,
    },
    {
      name: 'plaxsy-web',
      cwd: '/var/www/plaxsy/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3000 },
      error_file: '/var/log/plaxsy/web-error.log',
      out_file: '/var/log/plaxsy/web-out.log',
      merge_logs: true,
    },
  ],
};
PM2EOF

cd $DEPLOY_DIR
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
echo "  Deploy tamamlandı"
echo "=============================================="
echo "API:  https://$DOMAIN_API"
echo "Web:  https://$DOMAIN_WEB"
echo ""
echo "pm2 status   - durum"
echo "pm2 logs    - loglar"
echo ""
