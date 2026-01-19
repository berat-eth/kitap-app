# Sesli Kitap Uygulaması - Deployment Rehberi

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Ubuntu Server**: 22.04 LTS
- **Domain**: kitap.beratsimsek.com.tr
- **API Subdomain**: api.kitap.beratsimsek.com.tr
- **MySQL Database**: Uzak sunucu (zaten mevcut)
- **Root Erişimi**: SSH ile sunucuya root olarak bağlanabilmeli

### 1. DNS Ayarları

Deployment öncesi DNS kayıtlarını ayarlayın:

```
A Record:  kitap.beratsimsek.com.tr     -> [Sunucu IP]
A Record:  www.kitap.beratsimsek.com.tr -> [Sunucu IP]
A Record:  api.kitap.beratsimsek.com.tr -> [Sunucu IP]
```

DNS yayılımı için 5-10 dakika bekleyin.

### 2. Dosyaları Sunucuya Yükle

Tüm proje dosyalarını sunucuya yükleyin:

```bash
# Yerel bilgisayardan
scp -r "e:/projeler/kitap aapp" root@[SUNUCU_IP]:/root/audiobook-app

# Veya git clone kullanın (önerilir)
ssh root@[SUNUCU_IP]
cd /root
git clone [GIT_REPO_URL] audiobook-app
```

### 3. Deployment Scriptini Çalıştır

```bash
ssh root@[SUNUCU_IP]
cd /root/audiobook-app
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

Script şunları otomatik yapar:
- ✅ Sistem güncellemeleri
- ✅ Node.js 20.x kurulumu
- ✅ PM2 kurulumu ve yapılandırması
- ✅ Nginx kurulumu ve yapılandırması
- ✅ Let's Encrypt SSL sertifikası
- ✅ Backend ve Frontend deployment
- ✅ Database migration
- ✅ Firewall yapılandırması
- ✅ Otomatik yeniden başlatma

**Süre**: ~10-15 dakika

---

## 📋 Detaylı Kurulum Adımları

### Adım 1: Sunucu Hazırlığı

```bash
# Sunucuya bağlan
ssh root@[SUNUCU_IP]

# Sistem güncellemeleri
apt update && apt upgrade -y

# Script dosyalarını indir
cd /root
# Dosyaları yükleyin (scp, git, vb.)
```

### Adım 2: Script İzinlerini Ayarla

```bash
cd /root/audiobook-app
chmod +x deploy-ubuntu.sh
```

### Adım 3: Deployment Scriptini Başlat

```bash
./deploy-ubuntu.sh
```

Script çalışırken:
1. Tüm bağımlılıkları kurar
2. Uygulamaları build eder
3. DNS kontrolü yapar (Enter ile onaylayın)
4. SSL sertifikalarını kurar

---

## 🔧 Kurulum Sonrası

### Erişim URL'leri

- **Frontend**: https://kitap.beratsimsek.com.tr
- **API**: https://api.kitap.beratsimsek.com.tr
- **Admin Panel**: https://kitap.beratsimsek.com.tr/admin

### İlk Admin Girişi

```
Email: admin@audiobook.com
Password: admin123
```

⚠️ **Önemli**: İlk girişte şifreyi mutlaka değiştirin!

### Test

```bash
# Backend health check
curl https://api.kitap.beratsimsek.com.tr/health

# Public books endpoint
curl https://api.kitap.beratsimsek.com.tr/api/public/books

# Frontend
curl https://kitap.beratsimsek.com.tr
```

---

## 🛠️ Yönetim Komutları

### PM2 (Uygulama Yönetimi)

```bash
# Servis durumunu görüntüle
pm2 status

# Logları görüntüle
pm2 logs

# Belirli bir servisi yeniden başlat
pm2 restart audiobook-backend
pm2 restart audiobook-frontend

# Tüm servisleri yeniden başlat
pm2 restart all

# Servisi durdur
pm2 stop audiobook-backend

# Servisi başlat
pm2 start audiobook-backend

# Gerçek zamanlı monitoring
pm2 monit

# Log dosyalarını temizle
pm2 flush
```

### Nginx (Web Sunucusu)

```bash
# Nginx durumu
systemctl status nginx

# Nginx'i yeniden başlat
systemctl restart nginx

# Konfigürasyon testi
nginx -t

# Nginx logları
tail -f /var/log/nginx/audiobook-api.access.log
tail -f /var/log/nginx/audiobook-frontend.access.log
tail -f /var/log/nginx/audiobook-api.error.log
```

### SSL Sertifikası

```bash
# Sertifika durumu
certbot certificates

# Manuel yenileme
certbot renew

# Yenileme testi (dry run)
certbot renew --dry-run
```

### Özel Scriptler

```bash
# Monitoring
/usr/local/bin/monitor-audiobook.sh

# Backup
/usr/local/bin/backup-audiobook.sh

# Güncelleme (git kullanıyorsanız)
/usr/local/bin/update-audiobook.sh
```

---

## 📁 Dizin Yapısı

```
/var/www/audiobook/
├── backend/
│   ├── dist/              # Build edilmiş backend
│   ├── src/               # Kaynak kodlar
│   ├── uploads/           # Yüklenen dosyalar
│   ├── logs/              # Log dosyaları
│   ├── .env               # Environment variables
│   └── ecosystem.config.js # PM2 config
│
└── frontend/
    ├── .next/             # Build edilmiş frontend
    ├── app/               # Next.js app
    ├── components/        # React components
    ├── logs/              # Log dosyaları
    ├── .env.production    # Production env
    └── ecosystem.config.js # PM2 config
```

---

## 🔍 Log Dosyaları

### Backend Logs

```bash
# PM2 logs
tail -f /var/www/audiobook/backend/logs/pm2-out.log
tail -f /var/www/audiobook/backend/logs/pm2-error.log

# Application logs (Winston)
tail -f /var/www/audiobook/backend/logs/combined.log
tail -f /var/www/audiobook/backend/logs/error.log
```

### Frontend Logs

```bash
# PM2 logs
tail -f /var/www/audiobook/frontend/logs/pm2-out.log
tail -f /var/www/audiobook/frontend/logs/pm2-error.log
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/audiobook-api.access.log
tail -f /var/log/nginx/audiobook-frontend.access.log

# Error logs
tail -f /var/log/nginx/audiobook-api.error.log
tail -f /var/log/nginx/audiobook-frontend.error.log
```

---

## 🔄 Güncelleme

### Manuel Güncelleme

```bash
# Backend güncelle
cd /var/www/audiobook/backend
git pull
npm install --production
npm run build
pm2 restart audiobook-backend

# Frontend güncelle
cd /var/www/audiobook/frontend
git pull
npm install
npm run build
pm2 restart audiobook-frontend
```

### Otomatik Güncelleme (Script ile)

```bash
/usr/local/bin/update-audiobook.sh
```

---

## 💾 Backup

### Manuel Backup

```bash
# Uploads klasörünü yedekle
tar -czf /var/backups/audiobook/uploads_$(date +%Y%m%d).tar.gz \
  -C /var/www/audiobook/backend uploads/

# Database backup (uzak sunucudan)
mysqldump -h 92.113.22.70 -u u987029066_kitap -p u987029066_kitap \
  > /var/backups/audiobook/db_$(date +%Y%m%d).sql
```

### Otomatik Backup

Script otomatik olarak her gece saat 02:00'de backup alır:

```bash
# Cronjob kontrol
crontab -l

# Backup logları
tail -f /var/log/audiobook-backup.log
```

### Restore

```bash
# Uploads restore
tar -xzf /var/backups/audiobook/uploads_20240119.tar.gz \
  -C /var/www/audiobook/backend

# Database restore
mysql -h 92.113.22.70 -u u987029066_kitap -p u987029066_kitap \
  < /var/backups/audiobook/db_20240119.sql
```

---

## 🔒 Güvenlik

### Firewall (UFW)

```bash
# Firewall durumu
ufw status

# Yeni port aç
ufw allow 8080/tcp

# Port kapat
ufw deny 8080/tcp
```

### SSL Sertifikası

- Otomatik yenileme aktif (certbot timer)
- Her 60 günde bir kontrol eder
- 30 gün kala yeniler

### Güvenlik Güncellemeleri

```bash
# Sistem güncellemeleri
apt update
apt upgrade -y

# NPM güvenlik güncellemeleri
cd /var/www/audiobook/backend
npm audit fix

cd /var/www/audiobook/frontend
npm audit fix
```

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor

```bash
# PM2 durumunu kontrol
pm2 status

# Logları kontrol
pm2 logs audiobook-backend

# Servisi yeniden başlat
pm2 restart audiobook-backend

# .env dosyasını kontrol
cat /var/www/audiobook/backend/.env

# Port kullanımını kontrol
netstat -tulpn | grep 3001
```

### Frontend Çalışmıyor

```bash
# PM2 durumunu kontrol
pm2 status

# Logları kontrol
pm2 logs audiobook-frontend

# Build kontrolü
cd /var/www/audiobook/frontend
npm run build

# Port kullanımını kontrol
netstat -tulpn | grep 3000
```

### Nginx Hataları

```bash
# Konfigürasyon testi
nginx -t

# Error logları
tail -50 /var/log/nginx/error.log

# Nginx'i yeniden başlat
systemctl restart nginx
```

### SSL Sorunları

```bash
# Sertifika kontrolü
certbot certificates

# Manuel yenileme
certbot renew --force-renewal

# Nginx konfigürasyonunu tekrar oluştur
certbot --nginx -d kitap.beratsimsek.com.tr
```

### Database Bağlantı Sorunları

```bash
# MySQL bağlantısını test et
mysql -h 92.113.22.70 -u u987029066_kitap -p

# Backend .env kontrolü
cat /var/www/audiobook/backend/.env | grep DB_

# Backend logları
tail -50 /var/www/audiobook/backend/logs/error.log
```

### Disk Doldu

```bash
# Disk kullanımı
df -h

# Büyük dosyaları bul
du -sh /var/www/audiobook/backend/uploads/*

# PM2 logları temizle
pm2 flush

# Eski backup'ları sil
rm -f /var/backups/audiobook/uploads_*.tar.gz

# Eski log dosyalarını sil
find /var/log/nginx -name "*.log" -mtime +30 -delete
```

---

## 📊 Performans İzleme

### Sistem Kaynakları

```bash
# CPU ve Memory
top

# Disk I/O
iotop

# Network
iftop

# PM2 monitoring
pm2 monit
```

### Uygulama Metrikleri

```bash
# API response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" \
  https://api.kitap.beratsimsek.com.tr/health

# Nginx access logs analizi
cat /var/log/nginx/audiobook-api.access.log | \
  awk '{print $9}' | sort | uniq -c | sort -rn
```

---

## 📱 Mobil App Konfigürasyonu

Mobil app'i backend API'ye bağlamak için:

### 1. API URL'ini Ayarla

`mobil app/src/config/api.ts` (yeni dosya oluşturun):

```typescript
export const API_CONFIG = {
  baseURL: 'https://api.kitap.beratsimsek.com.tr/api',
  timeout: 30000,
};
```

### 2. Axios/Fetch Konfigürasyonu

```typescript
import axios from 'axios';
import { API_CONFIG } from './config/api';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### 3. Device ID Yönetimi

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const getDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = uuid.v4();
    await AsyncStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
};

// API isteklerinde kullanım
api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId();
  config.headers['X-Device-ID'] = deviceId;
  return config;
});
```

---

## 🔗 Faydalı Linkler

- **Frontend**: https://kitap.beratsimsek.com.tr
- **API Docs**: https://api.kitap.beratsimsek.com.tr/api-docs
- **Admin Panel**: https://kitap.beratsimsek.com.tr/admin
- **API Health**: https://api.kitap.beratsimsek.com.tr/health

---

## 📞 Destek

Sorun yaşarsanız:

1. Logları kontrol edin
2. `monitor-audiobook.sh` scriptini çalıştırın
3. Sistem kaynaklarını kontrol edin
4. Nginx ve PM2 durumunu kontrol edin

---

## 📝 Notlar

- **SSL Sertifikası**: Her 90 günde bir otomatik yenilenir
- **Backup**: Her gece saat 02:00'de otomatik alınır
- **PM2**: Uygulama çökerse otomatik yeniden başlatır
- **Nginx**: Rate limiting aktif (API için 10 req/s)
- **Uploads**: Backend uploads klasörüne kaydedilir
- **CORS**: Sadece belirlenen domainlerden erişim

---

## ✅ Deployment Checklist

- [ ] DNS kayıtları ayarlandı
- [ ] Sunucuya SSH erişimi var
- [ ] Deploy scripti çalıştırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Backend health check başarılı
- [ ] Frontend erişilebilir
- [ ] Admin paneline giriş yapıldı
- [ ] Admin şifresi değiştirildi
- [ ] Database migration tamamlandı
- [ ] Upload dizini yazılabilir
- [ ] PM2 autostart aktif
- [ ] Nginx çalışıyor
- [ ] Firewall yapılandırıldı
- [ ] Backup cronjob eklendi
- [ ] SSL otomatik yenileme aktif

---

**Son Güncelleme**: 2026-01-19

