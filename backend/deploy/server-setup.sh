#!/bin/bash

# ===========================================
# Sesli Kitap Backend - Sunucu Kurulum Scripti
# Doğrudan sunucuda çalıştırın
# ===========================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[UYARI]${NC} $1"; }
log_error() { echo -e "${RED}[HATA]${NC} $1"; }

# ===========================================
# YAPILANDIRMA - BU KISMI DÜZENLE
# ===========================================

APP_NAME="sesli-kitap-api"
APP_PORT="3001"
DOMAIN="api.yourdomain.com"           # DOMAIN ADINI DEĞİŞTİR
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"  # Backend klasörü

# ===========================================
# FONKSİYONLAR
# ===========================================

print_header() {
    echo ""
    echo "=========================================="
    echo "  🎧 Sesli Kitap Backend Kurulumu"
    echo "=========================================="
    echo "  Uygulama dizini: $APP_DIR"
    echo "=========================================="
    echo ""
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Bu script root olarak çalıştırılmalı!"
        echo "   sudo $0 $1"
        exit 1
    fi
}

# Sistem paketlerini kur
install_packages() {
    log_info "Sistem güncelleniyor..."
    apt-get update -y
    apt-get upgrade -y
    
    log_info "Temel paketler yükleniyor..."
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        unzip \
        htop \
        ufw
    
    log_success "Temel paketler yüklendi"
}

# Node.js kur
install_nodejs() {
    if command -v node &> /dev/null; then
        log_info "Node.js zaten yüklü: $(node -v)"
    else
        log_info "Node.js 20.x yükleniyor..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        log_success "Node.js yüklendi: $(node -v)"
    fi
}

# PM2 kur
install_pm2() {
    if command -v pm2 &> /dev/null; then
        log_info "PM2 zaten yüklü: $(pm2 -v)"
    else
        log_info "PM2 yükleniyor..."
        npm install -g pm2
        log_success "PM2 yüklendi: $(pm2 -v)"
    fi
}

# Nginx kur
install_nginx() {
    if command -v nginx &> /dev/null; then
        log_info "Nginx zaten yüklü"
    else
        log_info "Nginx yükleniyor..."
        apt-get install -y nginx
        log_success "Nginx yüklendi"
    fi
    systemctl enable nginx
    systemctl start nginx
}

# Certbot kur
install_certbot() {
    if command -v certbot &> /dev/null; then
        log_info "Certbot zaten yüklü"
    else
        log_info "Certbot yükleniyor..."
        apt-get install -y certbot python3-certbot-nginx
        log_success "Certbot yüklendi"
    fi
}

# Firewall ayarla
setup_firewall() {
    log_info "Firewall yapılandırılıyor..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    log_success "Firewall aktif"
}

# Uygulama dizinlerini oluştur
setup_directories() {
    log_info "Dizinler oluşturuluyor..."
    mkdir -p "$APP_DIR/uploads/audio"
    mkdir -p "$APP_DIR/uploads/images"
    mkdir -p "$APP_DIR/logs"
    chmod -R 755 "$APP_DIR/uploads"
    chmod -R 755 "$APP_DIR/logs"
    log_success "Dizinler hazır"
}

# npm paketlerini yükle ve build
build_app() {
    log_info "npm paketleri yükleniyor..."
    cd "$APP_DIR"
    npm ci
    
    log_info "TypeScript build yapılıyor..."
    npm run build
    
    log_success "Build tamamlandı"
}

# Veritabanını hazırla
setup_database() {
    log_info "Veritabanı tabloları oluşturuluyor..."
    cd "$APP_DIR"
    npm run db:sync
    log_success "Veritabanı hazır"
}

# Seed data ekle
seed_database() {
    log_info "Örnek veriler ekleniyor..."
    cd "$APP_DIR"
    npm run db:seed
    log_success "Örnek veriler eklendi"
}

# PM2 ile başlat
start_app() {
    log_info "Uygulama başlatılıyor..."
    cd "$APP_DIR"
    
    # Varsa durdur
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Başlat
    pm2 start dist/app.js \
        --name $APP_NAME \
        --env production \
        -i max \
        --max-memory-restart 500M
    
    # Kaydet ve startup ayarla
    pm2 save
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    log_success "Uygulama başlatıldı"
    pm2 status
}

# Nginx yapılandır
setup_nginx() {
    log_info "Nginx yapılandırılıyor..."
    
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
upstream sesli_kitap_backend {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://sesli_kitap_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        alias $APP_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 50M;
}
EOF

    # Symlink
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test ve restart
    nginx -t
    systemctl restart nginx
    
    log_success "Nginx yapılandırıldı"
}

# SSL sertifikası al
setup_ssl() {
    log_info "SSL sertifikası alınıyor..."
    
    # Email sor
    read -p "SSL için email adresiniz: " SSL_EMAIL
    
    certbot --nginx -d $DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $SSL_EMAIL \
        --redirect
    
    # Otomatik yenileme
    (crontab -l 2>/dev/null | grep -v certbot; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL sertifikası kuruldu"
}

# Durumu göster
show_status() {
    echo ""
    echo "=========================================="
    echo "  📊 Sistem Durumu"
    echo "=========================================="
    echo ""
    echo "PM2 Durumu:"
    pm2 status
    echo ""
    echo "Nginx Durumu:"
    systemctl status nginx --no-pager -l | head -5
    echo ""
}

# Sadece güncelleme
update_app() {
    log_info "Uygulama güncelleniyor..."
    build_app
    pm2 restart $APP_NAME
    log_success "Güncelleme tamamlandı"
    pm2 status
}

# ===========================================
# ANA PROGRAM
# ===========================================

usage() {
    echo "Kullanım: sudo $0 [komut]"
    echo ""
    echo "Komutlar:"
    echo "  install     Tam kurulum (ilk kez)"
    echo "  update      Sadece güncelleme (build + restart)"
    echo "  build       Sadece build"
    echo "  start       Uygulamayı başlat"
    echo "  stop        Uygulamayı durdur"
    echo "  restart     Uygulamayı yeniden başlat"
    echo "  logs        PM2 loglarını göster"
    echo "  status      Durumu göster"
    echo "  nginx       Nginx'i yapılandır"
    echo "  ssl         SSL sertifikası al"
    echo "  db-sync     Veritabanı tablolarını oluştur"
    echo "  db-seed     Örnek veri ekle"
    echo ""
}

case "$1" in
    install)
        check_root
        print_header
        install_packages
        install_nodejs
        install_pm2
        install_nginx
        install_certbot
        setup_firewall
        setup_directories
        build_app
        setup_database
        start_app
        setup_nginx
        
        echo ""
        log_success "🎉 Kurulum tamamlandı!"
        echo ""
        echo "  API: http://$DOMAIN"
        echo "  Swagger: http://$DOMAIN/api-docs"
        echo ""
        echo "  SSL için: sudo $0 ssl"
        echo "  Loglar: sudo $0 logs"
        echo ""
        ;;
    update)
        check_root
        update_app
        ;;
    build)
        build_app
        ;;
    start)
        check_root
        start_app
        ;;
    stop)
        check_root
        pm2 stop $APP_NAME
        log_success "Uygulama durduruldu"
        ;;
    restart)
        check_root
        pm2 restart $APP_NAME
        log_success "Uygulama yeniden başlatıldı"
        pm2 status
        ;;
    logs)
        pm2 logs $APP_NAME --lines 100
        ;;
    status)
        show_status
        ;;
    nginx)
        check_root
        setup_nginx
        ;;
    ssl)
        check_root
        setup_ssl
        ;;
    db-sync)
        setup_database
        ;;
    db-seed)
        seed_database
        ;;
    *)
        usage
        exit 1
        ;;
esac

exit 0
