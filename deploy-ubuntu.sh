#!/bin/bash

################################################################################
# Sesli Kitap Uygulaması - Ubuntu 22.04 SSL Deploy Script
# Domain: kitap.beratsimsek.com.tr
# API Subdomain: api.kitap.beratsimsek.com.tr
# 
# Bu script şunları yapar:
# 1. Sistem güncellemeleri ve gerekli paketleri kurar
# 2. Node.js 20.x kurar
# 3. PM2 kurar ve yapılandırır
# 4. Nginx kurar ve yapılandırır
# 5. Let's Encrypt SSL sertifikası kurar
# 6. Backend API'yi deploy eder
# 7. Web Frontend'i build ve deploy eder
# 8. Firewall yapılandırır
# 9. Otomatik yeniden başlatma ayarları yapar
#
# Kullanım: sudo bash deploy-ubuntu.sh
################################################################################

set -e  # Hata durumunda scripti durdur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Değişkenler
DOMAIN="kitap.beratsimsek.com.tr"
API_DOMAIN="api.beratsimsek.com.tr"
EMAIL="admin@beratsimsek.com.tr"  # SSL sertifikası için email
APP_USER="audiobook"
APP_DIR="/var/www/audiobook"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NODE_VERSION="20"

# Database bilgileri (.env dosyasından okunacak)
DB_HOST="92.113.22.70"
DB_PORT="3306"
DB_USER="u987029066_kitap"
DB_PASSWORD="38cdfD8217.."
DB_NAME="u987029066_kitap"

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[HATA]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[UYARI]${NC} $1"
}

info() {
    echo -e "${BLUE}[BİLGİ]${NC} $1"
}

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    error "Bu script root olarak çalıştırılmalıdır. 'sudo bash deploy-ubuntu.sh' kullanın."
fi

log "=========================================="
log "Sesli Kitap Uygulaması Deployment Başlıyor"
log "Domain: $DOMAIN"
log "API: $API_DOMAIN"
log "=========================================="

# 1. Sistem güncellemeleri
log "Sistem güncelleniyor..."
apt-get update
apt-get upgrade -y

# 2. Gerekli paketleri kur
log "Gerekli paketler kuruluyor..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    mysql-client \
    unzip

# 3. Node.js kurulumu
log "Node.js $NODE_VERSION.x kuruluyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    log "Node.js $(node --version) kuruldu"
else
    log "Node.js zaten kurulu: $(node --version)"
fi

# 4. PM2 kurulumu
log "PM2 kuruluyor..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
log "PM2 kuruldu: $(pm2 --version)"

# 5. Uygulama kullanıcısı oluştur
log "Uygulama kullanıcısı oluşturuluyor..."
if id "$APP_USER" &>/dev/null; then
    warning "Kullanıcı $APP_USER zaten mevcut"
else
    useradd -m -s /bin/bash $APP_USER
    log "Kullanıcı $APP_USER oluşturuldu"
fi

# 6. Uygulama dizinlerini oluştur
log "Uygulama dizinleri oluşturuluyor..."
mkdir -p $APP_DIR
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR
mkdir -p $BACKEND_DIR/uploads
mkdir -p $BACKEND_DIR/logs

# 7. Kaynak kodları kopyala (bu script'in çalıştırıldığı dizinden)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
log "Kaynak kodlar kopyalanıyor..."

# Backend kopyala
log "Backend kopyalanıyor..."
if [ -d "$SCRIPT_DIR/backend" ]; then
    cp -r "$SCRIPT_DIR/backend"/* $BACKEND_DIR/
    log "Backend dosyaları kopyalandı"
else
    error "Backend dizini bulunamadı: $SCRIPT_DIR/backend"
fi

# Web app kopyala
log "Web app kopyalanıyor..."
if [ -d "$SCRIPT_DIR/web app" ]; then
    cp -r "$SCRIPT_DIR/web app"/* $FRONTEND_DIR/
    log "Web app dosyaları kopyalandı"
else
    error "Web app dizini bulunamadı: $SCRIPT_DIR/web app"
fi

# 8. Backend .env dosyası oluştur
log "Backend .env dosyası oluşturuluyor..."
cat > $BACKEND_DIR/.env << EOL
# Server Configuration
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false

# Admin JWT Configuration
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
ADMIN_JWT_REFRESH_SECRET=$(openssl rand -base64 32)
ADMIN_JWT_EXPIRES_IN=15m
ADMIN_JWT_REFRESH_EXPIRES_IN=7d

# Device ID Configuration
DEVICE_ID_HEADER=X-Device-ID

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
MAX_COVER_SIZE=5242880

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Email Configuration
EMAIL_ENABLED=false

# CORS Configuration
CORS_ORIGIN=https://$DOMAIN,https://$API_DOMAIN

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX_REQUESTS=1000
EOL

log "Backend .env dosyası oluşturuldu"

# 9. Frontend .env dosyası oluştur
log "Frontend .env dosyası oluşturuluyor..."
cat > $FRONTEND_DIR/.env.production << EOL
NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api
NODE_ENV=production
EOL

log "Frontend .env dosyası oluşturuldu"

# 10. Backend bağımlılıklarını kur
log "Backend bağımlılıkları kuruluyor..."
cd $BACKEND_DIR
npm install --production
log "Backend bağımlılıkları kuruldu"

# 11. Backend build
log "Backend build ediliyor..."
npm run build
log "Backend build tamamlandı"

# 12. Database migration
log "Database migration çalıştırılıyor..."
npm run migrate || warning "Migration başarısız oldu veya zaten çalıştırılmış"

# 13. Frontend bağımlılıklarını kur ve build
log "Frontend bağımlılıkları kuruluyor..."
cd $FRONTEND_DIR
npm install
log "Frontend bağımlılıkları kuruldu"

log "Frontend build ediliyor... (Bu işlem birkaç dakika sürebilir)"
npm run build
log "Frontend build tamamlandı"

# 14. İzinleri ayarla
log "Dosya izinleri ayarlanıyor..."
chown -R $APP_USER:$APP_USER $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 777 $BACKEND_DIR/uploads
chmod -R 777 $BACKEND_DIR/logs

# 15. PM2 ile backend'i başlat
log "Backend PM2 ile başlatılıyor..."
cd $BACKEND_DIR

# PM2 ecosystem dosyası oluştur
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'audiobook-backend',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
EOL

pm2 delete audiobook-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
log "Backend başlatıldı ve PM2'ye kaydedildi"

# 16. PM2 ile frontend'i başlat
log "Frontend PM2 ile başlatılıyor..."
cd $FRONTEND_DIR

# PM2 ecosystem dosyası oluştur
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'audiobook-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOL

mkdir -p logs
pm2 delete audiobook-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
log "Frontend başlatıldı ve PM2'ye kaydedildi"

# 17. Nginx yapılandırması
log "Nginx yapılandırılıyor..."

# Backend için Nginx config
cat > /etc/nginx/sites-available/audiobook-api << EOL
server {
    listen 80;
    server_name $API_DOMAIN;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/audiobook-api.access.log;
    error_log /var/log/nginx/audiobook-api.error.log;

    # API proxy
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads - statik dosya sunumu
    location /uploads/ {
        alias $BACKEND_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # Max upload size
    client_max_body_size 500M;
}
EOL

# Frontend için Nginx config
cat > /etc/nginx/sites-available/audiobook-frontend << EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/audiobook-frontend.access.log;
    error_log /var/log/nginx/audiobook-frontend.error.log;

    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Max upload size
    client_max_body_size 50M;
}
EOL

# Nginx konfigürasyonlarını aktifleştir
ln -sf /etc/nginx/sites-available/audiobook-api /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/audiobook-frontend /etc/nginx/sites-enabled/

# Default site'ı devre dışı bırak
rm -f /etc/nginx/sites-enabled/default

# Nginx yapılandırmasını test et
log "Nginx yapılandırması test ediliyor..."
nginx -t || error "Nginx yapılandırması hatalı!"

# Nginx'i yeniden başlat
systemctl restart nginx
systemctl enable nginx
log "Nginx yapılandırıldı ve başlatıldı"

# 18. Firewall yapılandırması
log "Firewall yapılandırılıyor..."
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw status
log "Firewall yapılandırıldı"

# 19. DNS kontrolü
log "DNS kayıtları kontrol ediliyor..."
info "Lütfen DNS kayıtlarınızın doğru olduğundan emin olun:"
info "  A Record: $DOMAIN -> $(curl -s ifconfig.me)"
info "  A Record: $API_DOMAIN -> $(curl -s ifconfig.me)"
info ""
info "DNS yayılımı için 5-10 dakika beklemeniz gerekebilir."
echo ""
read -p "DNS kayıtları hazır mı? SSL kurulumuna devam etmek için Enter'a basın (Ctrl+C ile iptal edin): " -r

# 20. Let's Encrypt SSL sertifikası kur
log "SSL sertifikaları kuruluyor..."
info "Bu işlem birkaç dakika sürebilir..."

# Certbot ile SSL sertifikalarını al
certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d $API_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect || warning "SSL sertifikası kurulumu başarısız oldu. Manuel olarak çalıştırın: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"

# SSL sertifikası otomatik yenileme testi
certbot renew --dry-run || warning "SSL otomatik yenileme testi başarısız"

log "SSL sertifikaları kuruldu"

# 21. Nginx'i yeniden başlat (SSL sonrası)
systemctl restart nginx

# 22. Sistem servisleri durumunu kontrol et
log "Sistem servisleri kontrol ediliyor..."
systemctl status nginx --no-pager || warning "Nginx servisi sorunlu"
pm2 status

# 23. Son kontroller ve bilgilendirme
log "=========================================="
log "DEPLOYMENT TAMAMLANDI!"
log "=========================================="
echo ""
info "Frontend URL: https://$DOMAIN"
info "API URL: https://$API_DOMAIN"
info "Admin Panel: https://$DOMAIN/admin"
echo ""
info "Admin Giriş Bilgileri (İlk Kurulum):"
info "  Email: admin@audiobook.com"
info "  Password: admin123"
info "  ⚠️  İlk girişte şifreyi mutlaka değiştirin!"
echo ""
info "PM2 Komutları:"
info "  pm2 status              - Servisleri görüntüle"
info "  pm2 logs                - Logları görüntüle"
info "  pm2 restart all         - Tüm servisleri yeniden başlat"
info "  pm2 monit               - Gerçek zamanlı monitoring"
echo ""
info "Nginx Komutları:"
info "  systemctl status nginx  - Nginx durumu"
info "  nginx -t                - Konfigürasyon testi"
info "  systemctl restart nginx - Nginx'i yeniden başlat"
echo ""
info "Log Dosyaları:"
info "  Backend Logs: $BACKEND_DIR/logs/"
info "  Frontend Logs: $FRONTEND_DIR/logs/"
info "  Nginx Logs: /var/log/nginx/"
echo ""
info "Dosya Yükleme Dizini:"
info "  $BACKEND_DIR/uploads/"
echo ""

# 24. Health check
log "Servisler test ediliyor..."
sleep 3

# Backend health check
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✓ Backend çalışıyor"
else
    warning "✗ Backend erişilebilir değil"
fi

# Frontend health check
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✓ Frontend çalışıyor"
else
    warning "✗ Frontend erişilebilir değil"
fi

# SSL check
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "✓ SSL sertifikası kurulu"
    info "SSL sertifikası: $(certbot certificates | grep 'Expiry Date' | head -1)"
else
    warning "✗ SSL sertifikası bulunamadı"
fi

log "=========================================="
log "Deployment scripti tamamlandı!"
log "=========================================="

# 25. Otomatik güncelleme scripti oluştur
log "Otomatik güncelleme scripti oluşturuluyor..."
cat > /usr/local/bin/update-audiobook.sh << 'EOL'
#!/bin/bash
# Audiobook uygulaması güncelleme scripti

APP_DIR="/var/www/audiobook"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "Audiobook güncelleniyor..."

# Backend güncelle
cd $BACKEND_DIR
git pull
npm install --production
npm run build
pm2 restart audiobook-backend

# Frontend güncelle
cd $FRONTEND_DIR
git pull
npm install
npm run build
pm2 restart audiobook-frontend

echo "Güncelleme tamamlandı!"
pm2 status
EOL

chmod +x /usr/local/bin/update-audiobook.sh
log "Güncelleme scripti oluşturuldu: /usr/local/bin/update-audiobook.sh"

# 26. Monitoring scripti oluştur
cat > /usr/local/bin/monitor-audiobook.sh << 'EOL'
#!/bin/bash
# Audiobook monitoring scripti

echo "========== AUDIOBOOK SERVİS DURUMU =========="
echo ""
echo "PM2 Servisleri:"
pm2 status
echo ""
echo "Nginx Durumu:"
systemctl status nginx --no-pager | grep Active
echo ""
echo "Disk Kullanımı:"
df -h | grep -E "Filesystem|/var/www"
echo ""
echo "Memory Kullanımı:"
free -h
echo ""
echo "Son 10 Backend Log:"
tail -10 /var/www/audiobook/backend/logs/pm2-out.log
echo ""
echo "SSL Sertifika Durumu:"
certbot certificates | grep -E "Certificate Name|Expiry Date"
echo ""
echo "============================================="
EOL

chmod +x /usr/local/bin/monitor-audiobook.sh
log "Monitoring scripti oluşturuldu: /usr/local/bin/monitor-audiobook.sh"

# 27. Backup scripti oluştur
cat > /usr/local/bin/backup-audiobook.sh << 'EOL'
#!/bin/bash
# Audiobook backup scripti

BACKUP_DIR="/var/backups/audiobook"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
UPLOAD_DIR="/var/www/audiobook/backend/uploads"

mkdir -p $BACKUP_DIR

echo "Backup başlıyor: $TIMESTAMP"

# Uploads klasörünü yedekle
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C /var/www/audiobook/backend uploads/
echo "Uploads yedeklendi"

# Son 7 günden eski backupları sil
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
echo "Eski backuplar temizlendi"

echo "Backup tamamlandı: $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
EOL

chmod +x /usr/local/bin/backup-audiobook.sh
log "Backup scripti oluşturuldu: /usr/local/bin/backup-audiobook.sh"

# 28. Cronjob ekle (otomatik backup)
log "Otomatik backup cronjob ekleniyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-audiobook.sh >> /var/log/audiobook-backup.log 2>&1") | crontab -
log "Günlük backup cronjob eklendi (her gece saat 02:00)"

log ""
log "=========================================="
log "KULLANIM KOMUTLARI:"
log "=========================================="
info "Güncelleme:  sudo /usr/local/bin/update-audiobook.sh"
info "Monitoring:  sudo /usr/local/bin/monitor-audiobook.sh"
info "Backup:      sudo /usr/local/bin/backup-audiobook.sh"
log "=========================================="

exit 0

