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
- `/root/data/.env` production değerleriyle hazır — **tek dosya**; API, Next.js ve admin panel aynı dosyayı okur (`ENV_PATH` ile başka yol da verilebilir). Şablon: repoda `/.env.example`

## `/root/data/.env` (özet)

```env
# Backend
PORT=3001
DB_HOST=localhost
DB_USER=wirbooks
DB_PASSWORD=...
DB_NAME=wirbooks
API_KEY=...
ADMIN_API_KEY=...
UPLOAD_BASE_URL=https://api.wirbooks.com.tr

# Next.js (build/start sırasında next.config yükler)
NEXT_PUBLIC_API_URL=https://api.wirbooks.com.tr/api
NEXT_PUBLIC_API_KEY=...

# Admin panel (PORT ile çakışmaması için ayrı port anahtarı)
ADMIN_PANEL_PORT=3050
BACKEND_URL=http://127.0.0.1:3001
SESSION_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
# ADMIN_API_KEY yukarıdaki ile aynı olmalı
```

Ayrıntılı liste için proje kökündeki **`.env.example`** dosyasına bakın.

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

**Not:** Script çalışır çalışmaz mevcut **Wirbooks PM2** süreçleri (`wirbooks-api`, `wirbooks-web`, `wirbooks-admin` ve eski `plaxsy-*` isimleri) durdurulup silinir; build bittikten sonra yeniden başlatılır. Deploy süresince API / web / admin kısa süre hizmet dışı kalabilir.

## Faydalı Komutlar

| Komut | Açıklama |
|-------|----------|
| `pm2 status` | Tüm süreçlerin durumu |
| `pm2 logs wirbooks-admin` | Admin logları |
| `pm2 logs wirbooks-api` | API logları |
| `pm2 logs wirbooks-web` | Web logları |
| `pm2 restart wirbooks-admin` | Admin'i yeniden başlat |
| `pm2 restart all` | Tümünü yeniden başlat |
