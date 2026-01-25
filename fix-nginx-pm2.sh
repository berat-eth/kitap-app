#!/bin/bash

# Nginx ve PM2 Hızlı Düzeltme Script'i

echo "=========================================="
echo "Nginx ve PM2 Düzeltme Script'i"
echo "=========================================="
echo ""

# 1. Nginx Rate Limit Duplicate Hatasını Düzelt
echo "[1/4] Nginx rate limit duplicate hatası düzeltiliyor..."

# Tüm rate-limit config dosyalarını temizle
rm -f /etc/nginx/conf.d/rate-limit*.conf
rm -f /etc/nginx/conf.d/rate-lim*.conf

# nginx.conf'dan eski include'ları kaldır
sed -i '/include.*conf.d\/rate-limit/d' /etc/nginx/nginx.conf
sed -i '/include.*conf.d\/rate-lim/d' /etc/nginx/nginx.conf

# nginx.conf'dan duplicate limit_req_zone direktiflerini kaldır
sed -i '/limit_req_zone.*api_limit/d' /etc/nginx/nginx.conf

# Yeni temiz rate limit config dosyası oluştur
mkdir -p /etc/nginx/conf.d
cat > /etc/nginx/conf.d/rate-limit.conf << 'EOF'
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
EOF

# nginx.conf'a include ekle (eğer yoksa)
if ! grep -q "include.*conf.d/rate-limit.conf" /etc/nginx/nginx.conf; then
    # http bloğunun içine include ekle
    sed -i '/^http {/a\    include /etc/nginx/conf.d/rate-limit.conf;' /etc/nginx/nginx.conf
fi

echo "✅ Nginx rate limit config düzeltildi"

# 2. Nginx Config Test
echo "[2/4] Nginx yapılandırması test ediliyor..."
if nginx -t 2>&1 | grep -q "test is successful"; then
    echo "✅ Nginx yapılandırması geçerli"
else
    echo "❌ Nginx yapılandırması hala hatalı!"
    nginx -t
    exit 1
fi

# 3. PM2 Duplicate Instance'ları Temizle
echo "[3/4] PM2 duplicate instance'ları temizleniyor..."

# Tüm PM2 process'lerini durdur
pm2 stop all 2>/dev/null || true
sleep 2

# Tüm PM2 process'lerini sil
pm2 delete all 2>/dev/null || true
sleep 1

# PM2 loglarını temizle
pm2 flush 2>/dev/null || true

# PM2 dump dosyasını temizle (eski kayıtları sil)
rm -f /root/.pm2/dump.pm2 2>/dev/null || true

echo "✅ PM2 temizlendi"

# 4. PM2'yi Yeniden Başlat (eğer ecosystem dosyaları varsa)
echo "[4/4] PM2 instance'ları yeniden başlatılıyor..."

BACKEND_DIR="/root/audiobook-app/backend"
FRONTEND_DIR="/root/audiobook-app/web app"

# Backend'i başlat
if [ -f "$BACKEND_DIR/ecosystem.config.js" ]; then
    echo "Backend başlatılıyor..."
    cd "$BACKEND_DIR"
    pm2 start ecosystem.config.js 2>/dev/null || echo "⚠️  Backend başlatılamadı (ecosystem.config.js bulunamadı veya hata)"
fi

# Frontend'i başlat
if [ -f "$FRONTEND_DIR/ecosystem.config.js" ]; then
    echo "Frontend başlatılıyor..."
    cd "$FRONTEND_DIR"
    pm2 start ecosystem.config.js 2>/dev/null || echo "⚠️  Frontend başlatılamadı (ecosystem.config.js bulunamadı veya hata)"
fi

# PM2'yi kaydet
pm2 save 2>/dev/null || true

echo "✅ PM2 instance'ları başlatıldı"

# 5. Nginx'i Yeniden Başlat
echo ""
echo "Nginx yeniden başlatılıyor..."
systemctl restart nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx başarıyla başlatıldı"
else
    echo "❌ Nginx başlatılamadı!"
    systemctl status nginx --no-pager
    exit 1
fi

# 6. Durum Raporu
echo ""
echo "=========================================="
echo "Düzeltme Tamamlandı!"
echo "=========================================="
echo ""
echo "PM2 Durumu:"
pm2 status
echo ""
echo "Nginx Durumu:"
systemctl status nginx --no-pager | head -5
echo ""
echo "✅ Tüm düzeltmeler tamamlandı!"
