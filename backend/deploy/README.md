# Deployment Kılavuzu

Bu klasör Sesli Kitap Backend'ini sunucuya deploy etmek için gerekli tüm dosyaları içerir.

## Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `deploy.sh` | Ana deployment scripti (tüm işlemler) |
| `setup-server.sh` | Sunucu ilk kurulum scripti |
| `quick-deploy.sh` | Hızlı güncelleme scripti |
| `ecosystem.config.js` | PM2 yapılandırma dosyası |
| `nginx.conf` | Nginx yapılandırma örneği |

## Gereksinimler

**Sunucu:**
- Ubuntu 20.04 veya 22.04
- Minimum 1GB RAM (2GB önerilir)
- Root erişimi

**Yerel:**
- SSH
- rsync (opsiyonel ama önerilir)

## İlk Kurulum

### 1. Sunucu Bilgilerini Ayarla

`deploy.sh` dosyasını açın ve aşağıdaki değişkenleri düzenleyin:

```bash
SERVER_USER="root"                    # SSH kullanıcısı
SERVER_HOST="YOUR_SERVER_IP"          # Sunucu IP adresi
DOMAIN="api.yourdomain.com"           # Domain adınız
```

### 2. Tam Kurulum

```bash
cd backend/deploy
chmod +x deploy.sh
./deploy.sh install
```

Bu komut:
- Sunucuya Node.js, PM2, Nginx kurar
- Dosyaları sunucuya kopyalar
- npm install ve build yapar
- Veritabanı tablolarını oluşturur
- PM2 ile uygulamayı başlatır
- Nginx'i yapılandırır
- Let's Encrypt SSL sertifikası alır

## Güncelleme

Kod değişikliklerinden sonra:

```bash
./deploy.sh update
# veya
./quick-deploy.sh
```

## Komutlar

```bash
# Tam kurulum
./deploy.sh install

# Sadece güncelleme
./deploy.sh update

# Sunucu hazırlığı
./deploy.sh setup

# Dosyaları gönder + build
./deploy.sh deploy

# SSL sertifikası kur
./deploy.sh ssl

# Nginx yapılandır
./deploy.sh nginx

# Uygulamayı restart et
./deploy.sh restart

# PM2 loglarını göster
./deploy.sh logs

# PM2 durumunu göster
./deploy.sh status
```

## Manuel Kurulum

Eğer scripti kullanmak istemiyorsanız:

### Sunucuda:

```bash
# 1. Sunucu hazırlığı
sudo ./setup-server.sh

# 2. Dosyaları kopyala (yereldan)
rsync -avz --exclude 'node_modules' --exclude 'dist' ./ root@server:/var/www/sesli-kitap-backend/

# 3. Sunucuda build
cd /var/www/sesli-kitap-backend
npm ci
npm run build

# 4. Veritabanı
npm run db:sync
npm run db:seed  # Sadece ilk kurulumda

# 5. PM2 ile başlat
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 6. Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/sesli-kitap-api
sudo ln -s /etc/nginx/sites-available/sesli-kitap-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. SSL
sudo certbot --nginx -d api.yourdomain.com
```

## Sorun Giderme

### PM2 logları
```bash
pm2 logs sesli-kitap-api
pm2 logs sesli-kitap-api --lines 200
```

### Nginx logları
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Veritabanı bağlantısı
```bash
# .env dosyasını kontrol et
cat /var/www/sesli-kitap-backend/.env

# MySQL bağlantısını test et
mysql -h DB_HOST -u DB_USER -p DB_NAME
```

### Port kontrolü
```bash
# 3001 portunu dinleyen process
sudo lsof -i :3001
sudo netstat -tlnp | grep 3001
```

### Firewall
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Sunucu kaynakları
```bash
htop
free -m
df -h
```

## Güvenlik

- `.env` dosyasını güvende tutun
- Admin API key'i güçlü olsun
- Düzenli olarak sunucuyu güncelleyin
- Firewall'u açık tutun

## Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin
2. Nginx loglarını kontrol edin
3. .env dosyasını doğrulayın
4. Veritabanı bağlantısını test edin
