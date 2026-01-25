#!/bin/bash

# ===========================================
# Hızlı Deployment Script
# Dosyaları sunucuya gönder ve restart et
# ===========================================

# YAPILANDIRMA - DEĞİŞTİR
SERVER_USER="root"
SERVER_HOST="YOUR_SERVER_IP"
SERVER_PORT="22"
DEPLOY_PATH="/var/www/sesli-kitap-backend"
APP_NAME="sesli-kitap-api"

echo "🚀 Hızlı deployment başlatılıyor..."

# Dosyaları gönder
echo "📦 Dosyalar gönderiliyor..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'uploads/*' \
    --exclude 'logs/*' \
    --exclude 'deploy' \
    -e "ssh -p $SERVER_PORT" \
    ../ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/

# Sunucuda build ve restart
echo "🔨 Build ve restart yapılıyor..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << EOF
    cd $DEPLOY_PATH
    npm ci
    npm run build
    pm2 restart $APP_NAME
    pm2 status
EOF

echo ""
echo "✅ Deployment tamamlandı!"
echo "   Logları görmek için: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'pm2 logs $APP_NAME'"
