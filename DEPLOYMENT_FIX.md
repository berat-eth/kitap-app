# Deployment Hatası Düzeltme Rehberi

## Sorun: `tsc: not found`

Bu hata, backend build edilmeye çalışılırken TypeScript compiler'ın bulunamadığını gösterir.

### Neden Oldu?

Script `npm install --production` kullandı, bu da sadece production dependencies'i kurar ve devDependencies'i atlar. Ancak TypeScript compiler (`tsc`) devDependencies'de olduğu için build yapılamadı.

### Çözüm 1: Manuel Düzeltme (Sunucuda)

Eğer script hata verdiyse, sunucuda şu adımları izleyin:

```bash
# Sunucuya bağlanın
ssh root@[SUNUCU_IP]

# Backend dizinine gidin
cd /var/www/audiobook/backend

# Tüm bağımlılıkları kurun (devDependencies dahil)
npm install

# Build yapın
npm run build

# Şimdi devDependencies'i temizleyin (disk alanı için)
npm prune --production

# Backend'i başlatın
pm2 start ecosystem.config.js

# Durumu kontrol edin
pm2 status
pm2 logs audiobook-backend
```

### Çözüm 2: Scripti Yeniden Çalıştırma

Güncellenmiş scripti kullanın:

```bash
# Sunucuya yeni scripti yükleyin
scp deploy-ubuntu.sh root@[SUNUCU_IP]:/root/audiobook-app/

# Sunucuya bağlanın
ssh root@[SUNUCU_IP]

# Script dizinine gidin
cd /root/audiobook-app

# Scripti tekrar çalıştırın
./deploy-ubuntu.sh
```

### Çözüm 3: Sadece Backend'i Tekrar Deploy Etme

Eğer frontend çalışıyorsa, sadece backend'i düzeltebilirsiniz:

```bash
ssh root@[SUNUCU_IP]

# Backend dizini
cd /var/www/audiobook/backend

# Bağımlılıkları kur
npm install

# Build
npm run build

# Production temizlik
npm prune --production

# PM2'yi yeniden başlat
pm2 restart audiobook-backend

# Kontrol
pm2 logs audiobook-backend --lines 50
```

## Multer Uyarısı

```
npm warn deprecated multer@1.4.5-lts.2: Multer 1.x is impacted by vulnerabilities
```

Bu sadece bir uyarıdır, uygulama çalışır. Ancak güvenlik için güncellenebilir:

### Multer Güncelleme

`backend/package.json`:

```json
{
  "dependencies": {
    "multer": "^2.0.0"  // 1.4.5-lts.1 yerine
  }
}
```

Sonra:

```bash
cd /var/www/audiobook/backend
npm install
npm run build
pm2 restart audiobook-backend
```

## Deployment Kontrol Listesi

### 1. Bağımlılıklar Kontrolü

```bash
cd /var/www/audiobook/backend
npm list typescript
npm list tsx
```

Eğer bulunamazsa:

```bash
npm install typescript tsx --save-dev
```

### 2. Build Kontrolü

```bash
cd /var/www/audiobook/backend
npm run build

# Başarılı olursa dist/ klasörü oluşur
ls -la dist/
```

### 3. PM2 Kontrolü

```bash
pm2 status
pm2 logs audiobook-backend --lines 100
```

### 4. Nginx Kontrolü

```bash
systemctl status nginx
nginx -t
curl http://localhost:3001/health
```

### 5. Frontend Kontrolü

```bash
cd /var/www/audiobook/frontend
pm2 logs audiobook-frontend --lines 50
curl http://localhost:3000
```

## Tam Yeniden Deployment

Eğer her şey karıştıysa, baştan yapın:

```bash
# Eski uygulamayı durdur
pm2 delete all

# Dizini temizle
rm -rf /var/www/audiobook

# Scripti tekrar çalıştır
cd /root/audiobook-app
./deploy-ubuntu.sh
```

## Hata Logları

### Backend Logları

```bash
# PM2 logs
tail -f /var/www/audiobook/backend/logs/pm2-error.log
tail -f /var/www/audiobook/backend/logs/pm2-out.log

# Application logs
tail -f /var/www/audiobook/backend/logs/error.log
tail -f /var/www/audiobook/backend/logs/combined.log
```

### Nginx Logları

```bash
tail -f /var/log/nginx/audiobook-api.error.log
tail -f /var/log/nginx/audiobook-frontend.error.log
```

## Database Migration Hatası

Eğer migration hatası aldıysanız:

```bash
cd /var/www/audiobook/backend

# Migration'ı manuel çalıştır
npm run migrate

# Veya doğrudan
node dist/migrations/run.js

# Veya tsx ile
npx tsx src/migrations/run.ts
```

## Environment Variables Kontrolü

```bash
# Backend .env
cat /var/www/audiobook/backend/.env

# Önemli değişkenleri kontrol et
grep -E "DB_|JWT_|PORT" /var/www/audiobook/backend/.env
```

## Port Kullanım Kontrolü

```bash
# 3000 ve 3001 portlarını kontrol et
netstat -tulpn | grep -E "3000|3001"

# Veya
lsof -i :3000
lsof -i :3001
```

## Firewall Kontrolü

```bash
ufw status
ufw allow 3000/tcp  # Eğer frontend doğrudan erişilecekse
ufw allow 3001/tcp  # Eğer backend doğrudan erişilecekse
```

## SSL Sertifika Kontrolü

```bash
certbot certificates
certbot renew --dry-run
```

## Performans Kontrolü

```bash
# Sistem kaynakları
free -h
df -h
top

# PM2 monitoring
pm2 monit

# Process durumu
ps aux | grep node
```

## Hızlı Test

```bash
# Backend API
curl -I https://api.kitap.beratsimsek.com.tr/health

# Frontend
curl -I https://kitap.beratsimsek.com.tr

# Public books
curl https://api.kitap.beratsimsek.com.tr/api/public/books
```

## Acil Durum Komutları

```bash
# Her şeyi yeniden başlat
pm2 restart all
systemctl restart nginx

# Logları temizle
pm2 flush

# Cache temizle (eğer Redis kullanıyorsanız)
redis-cli FLUSHALL

# Disk alanı temizle
npm cache clean --force
apt autoremove -y
apt autoclean
```

## Destek İletişim

Sorun devam ederse:

1. **Logları toplayın**:
```bash
pm2 logs --lines 200 > /tmp/pm2-logs.txt
tail -200 /var/log/nginx/audiobook-api.error.log > /tmp/nginx-logs.txt
cat /var/www/audiobook/backend/.env > /tmp/backend-env.txt
```

2. **Sistem bilgilerini toplayın**:
```bash
uname -a > /tmp/system-info.txt
node --version >> /tmp/system-info.txt
npm --version >> /tmp/system-info.txt
pm2 --version >> /tmp/system-info.txt
nginx -v >> /tmp/system-info.txt
```

3. **Bu dosyaları inceleyin ve sorunu belirleyin**

---

**Not**: Script artık güncellenmiş durumda ve bu hatayı vermeyecek. Ancak bu rehber gelecekteki sorunlar için yararlı olabilir.

