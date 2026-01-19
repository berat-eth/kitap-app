#!/bin/bash

################################################################################
# Hızlı Hata Düzeltme Scripti
# tsc: not found hatasını düzeltir
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

BACKEND_DIR="/var/www/audiobook/backend"
FRONTEND_DIR="/var/www/audiobook/frontend"

log "=========================================="
log "Backend Hatası Düzeltiliyor"
log "=========================================="

# Backend dizinine git
if [ ! -d "$BACKEND_DIR" ]; then
    error "Backend dizini bulunamadı: $BACKEND_DIR"
fi

cd $BACKEND_DIR

# Mevcut PM2 processini durdur
log "Backend durduruluyor..."
pm2 delete audiobook-backend 2>/dev/null || warning "Backend zaten durdurulmuş"

# Bağımlılıkları yeniden kur (devDependencies dahil)
log "Bağımlılıklar kuruluyor..."
npm install
log "Bağımlılıklar kuruldu"

# Build
log "Backend build ediliyor..."
npm run build || error "Build başarısız!"
log "Build başarılı"

# Production temizlik
log "DevDependencies temizleniyor..."
npm prune --production
log "Temizleme tamamlandı"

# PM2 ile başlat
log "Backend başlatılıyor..."
pm2 start ecosystem.config.js
pm2 save
log "Backend başlatıldı"

# Durum kontrolü
log "=========================================="
pm2 status
log "=========================================="

# Health check
log "Servis test ediliyor..."
sleep 3

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✓ Backend başarıyla çalışıyor!"
else
    error "✗ Backend erişilebilir değil!"
fi

log "=========================================="
log "Düzeltme tamamlandı!"
log "=========================================="
log ""
log "Logları görüntülemek için: pm2 logs audiobook-backend"
log "Durumu kontrol etmek için: pm2 status"

exit 0

