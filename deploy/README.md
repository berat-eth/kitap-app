# Sesli Kitap - Sunucu Kurulumu

## Domain Yapılandırması

| Domain | Servis | Port |
|--------|--------|------|
| kitap1.beratsimsek.com.tr | Web sitesi (Next.js) | 3000 |
| api1.beratsimsek.com.tr | API (Express) | 3001 |

## Hızlı Kurulum (Linux)

```bash
# 1. Projeyi sunucuya kopyalayın
scp -r kitap-app user@sunucu:/tmp/

# 2. Sunucuda kurulum scriptini çalıştırın
ssh user@sunucu
cd /tmp/kitap-app
chmod +x deploy/setup-deploy.sh
./deploy/setup-deploy.sh
```

## Manuel Kurulum

### 1. Backend (.env)

`backend/.env` dosyasında:

```
ALLOWED_ORIGINS=https://kitap1.beratsimsek.com.tr,http://kitap1.beratsimsek.com.tr,https://api1.beratsimsek.com.tr,http://api1.beratsimsek.com.tr
```

### 2. Nginx

```bash
sudo cp deploy/nginx/kitap-sites.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/kitap-sites.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Kurulumu (Let's Encrypt)

**Otomatik (önerilen):**
```bash
chmod +x deploy/ssl-setup.sh
sudo ./deploy/ssl-setup.sh
```

**Manuel:**
```bash
# Certbot kur (Ubuntu/Debian)
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (Nginx config otomatik güncellenir)
sudo certbot --nginx -d kitap1.beratsimsek.com.tr -d api1.beratsimsek.com.tr --redirect

# E-posta ile (yenileme bildirimi)
sudo certbot --nginx -d kitap1.beratsimsek.com.tr -d api1.beratsimsek.com.tr -m email@example.com --agree-tos --redirect
```

**Ön koşullar:** DNS kayıtları sunucuya yönlendirilmiş olmalı, port 80 dışarıdan erişilebilir olmalı.

### 4. DNS

A veya CNAME kayıtları sunucu IP'nize yönlendirilmeli:
- kitap1.beratsimsek.com.tr → Sunucu IP
- api1.beratsimsek.com.tr → Sunucu IP

## Dizin Yapısı (Kurulum Sonrası)

```
/var/www/kitap-app/
├── backend/          # API (PM2: sesli-kitap-api)
│   ├── dist/
│   ├── uploads/
│   └── .env
└── web-app/          # Web sitesi (PM2: sesli-kitap-web)
    ├── .next/
    └── node_modules/
```
