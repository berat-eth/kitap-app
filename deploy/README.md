# Wirbooks - Canlıya Alma

**Tek script:** `deploy.sh` — Sunucu kurulumu, deploy ve SSL tek komutta.

| Servis | Domain | Port |
|--------|--------|------|
| API | **api.wirbooks.com.tr** | 3001 |
| Ana site (Next.js) | **wirbooks.com.tr** | 3000 |
| Admin paneli | **admin.wirbooks.com.tr** | 3050 |

## Kullanım

```bash
cd /path/to/kitap-app
sudo bash deploy/deploy.sh
```

## Ön Koşullar

- Ubuntu 22.04 LTS
- DNS A kayıtları sunucu IP'sine yönlendirilmiş:
  - `wirbooks.com.tr`
  - `www.wirbooks.com.tr`
  - `api.wirbooks.com.tr`
  - `admin.wirbooks.com.tr`
- `/root/data/.env` production değerleriyle hazır (aşağıya bakın)

## `/root/data/.env` Örneği

```env
# Veritabanı
DB_HOST=localhost
DB_USER=wirbooks
DB_PASSWORD=...
DB_NAME=wirbooks

# API
API_KEY=...

# Next.js web
NEXT_PUBLIC_API_URL=https://api.wirbooks.com.tr/api
NEXT_PUBLIC_API_KEY=...

# Admin paneli
SESSION_SECRET=...          # güçlü rastgele string
```

## Sunucu Dizinleri

| Dizin | İçerik |
|-------|--------|
| `/var/www/wirbooks/backend/` | Express API |
| `/var/www/wirbooks/web/` | Next.js web uygulaması |
| `/var/www/wirbooks/admin/` | Admin paneli |
| `/var/log/wirbooks/` | PM2 logları |

## PM2 Süreçleri

| Süreç | Açıklama |
|-------|----------|
| `wirbooks-api` | Express backend |
| `wirbooks-web` | Next.js web |
| `wirbooks-admin` | Admin paneli |

## Güncelleme

```bash
cd /path/to/kitap-app
git pull
sudo bash deploy/deploy.sh
```

## Faydalı Komutlar

| Komut | Açıklama |
|-------|----------|
| `pm2 status` | Tüm süreçlerin durumu |
| `pm2 logs wirbooks-admin` | Admin logları |
| `pm2 logs wirbooks-api` | API logları |
| `pm2 logs wirbooks-web` | Web logları |
| `pm2 restart wirbooks-admin` | Admin'i yeniden başlat |
| `pm2 restart all` | Tümünü yeniden başlat |
