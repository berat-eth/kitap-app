# Wirbooks - Canlıya Alma

**Tek script:** `deploy.sh` — Sunucu kurulumu, deploy ve SSL tek komutta.

| Servis | Domain |
|--------|--------|
| API | **api.wirbooks.com.tr** |
| Ana site | **wirbooks.com.tr** |

## Kullanım

```bash
cd /path/to/kitap-app
sudo bash deploy/deploy.sh
```

## Ön Koşullar

- Ubuntu 22.04 LTS
- DNS: `wirbooks.com.tr`, `www.wirbooks.com.tr`, `api.wirbooks.com.tr` → sunucu IP
- `sesli-kitap-backend/.env` production değerleriyle hazır

## Sunucu Dizinleri

- Uygulama: `/var/www/wirbooks/`
- Loglar: `/var/log/wirbooks/`
- PM2: `wirbooks-api`, `wirbooks-web`

## Güncelleme

```bash
cd /path/to/kitap-app
git pull
sudo bash deploy/deploy.sh
```

## Faydalı Komutlar

| Komut | Açıklama |
|-------|----------|
| `pm2 status` | Uygulama durumu |
| `pm2 logs wirbooks-api` | API logları |
| `pm2 restart all` | Yeniden başlat |
