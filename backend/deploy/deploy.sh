#!/bin/bash

# ===========================================
# Sesli Kitap Backend - Deployment Script
# Ubuntu + Nginx + PM2 + Let's Encrypt
# ===========================================

set -e  # Hata durumunda dur

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonları
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ===========================================
# YAPILANDIRMA - BU KISMI DÜZENLE
# ===========================================

# Sunucu bilgileri
SERVER_USER="root"                              # SSH kullanıcısı
SERVER_HOST="YOUR_SERVER_IP"                    # Sunucu IP adresi
SERVER_PORT="22"                                # SSH portu

# Uygulama bilgileri
APP_NAME="sesli-kitap-api"                      # PM2 uygulama adı
APP_PORT="3001"                                 # Backend port
DOMAIN="api.yourdomain.com"                     # Domain adı (SSL için)
DEPLOY_PATH="/var/www/sesli-kitap-backend"      # Sunucudaki yol

# Veritabanı (zaten .env'de var, burada opsiyonel)
# DB_HOST, DB_NAME, DB_USER, DB_PASSWORD .env'den okunacak

# ===========================================
# FONKSİYONLAR
# ===========================================

print_header() {
    echo ""
    echo "=========================================="
    echo "  🎧 Sesli Kitap Backend Deployment"
    echo "=========================================="
    echo ""
}

check_local_requirements() {
    log_info "Yerel gereksinimler kontrol ediliyor..."
    
    # SSH kontrolü
    if ! command -v ssh &> /dev/null; then
        log_error "SSH bulunamadı. Lütfen OpenSSH yükleyin."
        exit 1
    fi
    
    # rsync kontrolü
    if ! command -v rsync &> /dev/null; then
        log_warning "rsync bulunamadı. scp kullanılacak."
    fi
    
    log_success "Yerel gereksinimler tamam"
}

# Sunucuya SSH komutu çalıştır
ssh_exec() {
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "$1"
}

# Dosyaları sunucuya kopyala
sync_files() {
    log_info "Dosyalar sunucuya kopyalanıyor..."
    
    # Hedef klasörü oluştur
    ssh_exec "mkdir -p $DEPLOY_PATH"
    
    # rsync varsa kullan, yoksa scp
    if command -v rsync &> /dev/null; then
        rsync -avz --progress \
            --exclude 'node_modules' \
            --exclude 'dist' \
            --exclude '.git' \
            --exclude 'uploads/*' \
            --exclude 'logs/*' \
            -e "ssh -p $SERVER_PORT" \
            ./ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
    else
        # scp ile kopyala
        scp -P $SERVER_PORT -r \
            package.json package-lock.json tsconfig.json .env \
            src/ \
            $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
    fi
    
    log_success "Dosyalar kopyalandı"
}

# Sunucuyu hazırla (ilk kurulum için)
setup_server() {
    log_info "Sunucu hazırlanıyor..."
    
    ssh_exec "
        # Paket listesini güncelle
        apt-get update -y
        
        # Gerekli paketler
        apt-get install -y curl wget git build-essential
        
        # Node.js 20.x kur
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi
        
        # PM2 kur
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        # Nginx kur
        if ! command -v nginx &> /dev/null; then
            apt-get install -y nginx
        fi
        
        # Certbot (Let's Encrypt) kur
        if ! command -v certbot &> /dev/null; then
            apt-get install -y certbot python3-certbot-nginx
        fi
        
        # Firewall ayarları
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        
        echo '✅ Sunucu hazırlığı tamamlandı'
    "
    
    log_success "Sunucu hazırlandı"
}

# Bağımlılıkları yükle ve build
install_and_build() {
    log_info "Bağımlılıklar yükleniyor ve build ediliyor..."
    
    ssh_exec "
        cd $DEPLOY_PATH
        
        # npm paketlerini yükle
        npm ci --production=false
        
        # TypeScript build
        npm run build
        
        # uploads ve logs klasörlerini oluştur
        mkdir -p uploads/audio uploads/images logs
        chmod 755 uploads logs
        
        echo '✅ Build tamamlandı'
    "
    
    log_success "Build tamamlandı"
}

# Veritabanını hazırla
setup_database() {
    log_info "Veritabanı hazırlanıyor..."
    
    ssh_exec "
        cd $DEPLOY_PATH
        
        # Tabloları sync et
        npm run db:sync
        
        # Seed data ekle (opsiyonel - sadece ilk kurulumda)
        # npm run db:seed
        
        echo '✅ Veritabanı hazırlandı'
    "
    
    log_success "Veritabanı hazırlandı"
}

# PM2 ile uygulamayı başlat
start_app() {
    log_info "Uygulama başlatılıyor..."
    
    ssh_exec "
        cd $DEPLOY_PATH
        
        # Mevcut uygulamayı durdur (varsa)
        pm2 delete $APP_NAME 2>/dev/null || true
        
        # Uygulamayı başlat
        pm2 start dist/app.js --name $APP_NAME --env production
        
        # Otomatik başlatma ayarla
        pm2 save
        pm2 startup systemd -u $SERVER_USER --hp /root
        
        # Durumu göster
        pm2 status
        
        echo '✅ Uygulama başlatıldı'
    "
    
    log_success "Uygulama başlatıldı"
}

# Nginx yapılandır
setup_nginx() {
    log_info "Nginx yapılandırılıyor..."
    
    ssh_exec "
        # Nginx config dosyası oluştur
        cat > /etc/nginx/sites-available/$APP_NAME << 'NGINX_EOF'
server {
    listen 80;
    server_name $DOMAIN;
    
    # Let's Encrypt doğrulama için
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Tüm trafiği HTTPS'e yönlendir
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL sertifikaları (Let's Encrypt tarafından doldurulacak)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Güvenlik header'ları
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection \"1; mode=block\";
    add_header Strict-Transport-Security \"max-age=31536000\" always;
    
    # Gzip sıkıştırma
    gzip on;
    gzip_types application/json text/plain application/javascript text/css;
    
    # Proxy ayarları
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
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
    
    # Static dosyalar
    location /uploads {
        alias $DEPLOY_PATH/uploads;
        expires 30d;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$APP_PORT/health;
        access_log off;
    }
}
NGINX_EOF
        
        # Symlink oluştur
        ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
        
        # Default config'i kaldır
        rm -f /etc/nginx/sites-enabled/default
        
        # Nginx config test
        nginx -t
        
        # Nginx'i yeniden başlat
        systemctl restart nginx
        
        echo '✅ Nginx yapılandırıldı'
    "
    
    log_success "Nginx yapılandırıldı"
}

# Let's Encrypt SSL sertifikası al
setup_ssl() {
    log_info "SSL sertifikası alınıyor..."
    
    ssh_exec "
        # Önce HTTP üzerinden Nginx'i başlat (SSL olmadan)
        # Geçici HTTP-only config
        cat > /etc/nginx/sites-available/$APP_NAME << 'NGINX_EOF'
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINX_EOF
        
        # Nginx'i yeniden başlat
        systemctl restart nginx
        
        # Certbot ile sertifika al
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
        
        # Otomatik yenileme için cron
        (crontab -l 2>/dev/null | grep -v certbot; echo '0 12 * * * /usr/bin/certbot renew --quiet') | crontab -
        
        echo '✅ SSL sertifikası kuruldu'
    "
    
    log_success "SSL sertifikası kuruldu"
}

# Sadece güncelleme (dosyaları gönder ve restart)
update_only() {
    log_info "Güncelleme yapılıyor..."
    
    sync_files
    install_and_build
    
    ssh_exec "
        cd $DEPLOY_PATH
        pm2 restart $APP_NAME
        pm2 status
    "
    
    log_success "Güncelleme tamamlandı"
}

# Tam kurulum
full_install() {
    print_header
    check_local_requirements
    setup_server
    sync_files
    install_and_build
    setup_database
    start_app
    setup_nginx
    setup_ssl
    
    echo ""
    log_success "🎉 Deployment tamamlandı!"
    echo ""
    echo "  API URL: https://$DOMAIN"
    echo "  Swagger: https://$DOMAIN/api-docs"
    echo "  Health:  https://$DOMAIN/health"
    echo ""
    echo "  PM2 durumu: ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
    echo "  PM2 logları: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs $APP_NAME'"
    echo ""
}

# ===========================================
# ANA PROGRAM
# ===========================================

# Kullanım bilgisi
usage() {
    echo "Kullanım: $0 [komut]"
    echo ""
    echo "Komutlar:"
    echo "  install     Tam kurulum (ilk kez)"
    echo "  update      Sadece güncelleme"
    echo "  setup       Sunucu hazırlığı"
    echo "  deploy      Dosyaları gönder ve build"
    echo "  ssl         SSL sertifikası kur"
    echo "  nginx       Nginx yapılandır"
    echo "  restart     Uygulamayı yeniden başlat"
    echo "  logs        PM2 loglarını göster"
    echo "  status      PM2 durumunu göster"
    echo ""
}

# Parametre kontrolü
case "$1" in
    install)
        full_install
        ;;
    update)
        update_only
        ;;
    setup)
        setup_server
        ;;
    deploy)
        sync_files
        install_and_build
        ;;
    ssl)
        setup_ssl
        ;;
    nginx)
        setup_nginx
        ;;
    restart)
        ssh_exec "pm2 restart $APP_NAME"
        ;;
    logs)
        ssh_exec "pm2 logs $APP_NAME --lines 100"
        ;;
    status)
        ssh_exec "pm2 status"
        ;;
    *)
        usage
        exit 1
        ;;
esac

exit 0
