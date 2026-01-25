#!/bin/bash

# ===========================================
# Sunucu İlk Kurulum Scripti
# Ubuntu 22.04+ için
# ===========================================

set -e

echo "🚀 Sunucu kurulumu başlatılıyor..."

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    echo "❌ Bu script root olarak çalıştırılmalı"
    echo "   sudo ./setup-server.sh"
    exit 1
fi

# Sistem güncelleme
echo "📦 Sistem güncelleniyor..."
apt-get update -y
apt-get upgrade -y

# Temel paketler
echo "📦 Temel paketler yükleniyor..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    htop \
    vim \
    ufw

# Node.js 20.x
echo "📦 Node.js 20.x yükleniyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "   Node.js version: $(node -v)"
echo "   npm version: $(npm -v)"

# PM2 Global
echo "📦 PM2 yükleniyor..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "   PM2 version: $(pm2 -v)"

# Nginx
echo "📦 Nginx yükleniyor..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi
systemctl enable nginx
systemctl start nginx
echo "   Nginx version: $(nginx -v 2>&1)"

# Certbot (Let's Encrypt)
echo "📦 Certbot yükleniyor..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi
echo "   Certbot version: $(certbot --version)"

# Firewall ayarları
echo "🔒 Firewall yapılandırılıyor..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
echo "   Firewall durumu: aktif"

# Uygulama dizini oluştur
echo "📁 Uygulama dizini oluşturuluyor..."
mkdir -p /var/www/sesli-kitap-backend
mkdir -p /var/www/sesli-kitap-backend/uploads/audio
mkdir -p /var/www/sesli-kitap-backend/uploads/images
mkdir -p /var/www/sesli-kitap-backend/logs
chmod -R 755 /var/www/sesli-kitap-backend

# Swap alanı (düşük RAM için)
echo "💾 Swap alanı kontrol ediliyor..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "   2GB swap alanı oluşturuldu"
else
    echo "   Swap alanı zaten var"
fi

# PM2 logrotate
echo "📋 PM2 logrotate yapılandırılıyor..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

echo ""
echo "=========================================="
echo "  ✅ Sunucu kurulumu tamamlandı!"
echo "=========================================="
echo ""
echo "Sonraki adımlar:"
echo "  1. Proje dosyalarını /var/www/sesli-kitap-backend'e kopyalayın"
echo "  2. .env dosyasını düzenleyin"
echo "  3. npm install && npm run build"
echo "  4. npm run db:sync && npm run db:seed"
echo "  5. pm2 start ecosystem.config.js --env production"
echo "  6. Nginx config'i /etc/nginx/sites-available/ altına kopyalayın"
echo "  7. certbot --nginx -d yourdomain.com"
echo ""
