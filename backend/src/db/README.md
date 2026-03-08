# Veritabanı Kurulumu

## Root Yetkisi Sorunu

Uygulama **root** kullanıcısı gerektirmez. Sınırlı yetkili bir kullanıcı kullanın.

---

## Seçenek 1: VPS / Dedicated Sunucu (MySQL root erişiminiz var)

1. `create-app-user.sql` dosyasını açın
2. `@db`, `@user`, `@pwd` değişkenlerini düzenleyin
3. Script'i çalıştırın:
   ```bash
   mysql -u root -p < backend/src/db/create-app-user.sql
   ```
4. `backend/.env` dosyasında:
   ```
   DB_USER=seslikitap_app
   DB_PASSWORD=GucluSifre123!
   ```

---

## Seçenek 2: Hostinger / cPanel (Paylaşımlı hosting)

cPanel'de root erişiminiz yoktur. Şu adımları izleyin:

1. **cPanel → MySQL Databases** bölümüne gidin
2. **Add MySQL User** ile yeni kullanıcı oluşturun (örn: `seslikitap_app`)
3. **Add User To Database** ile bu kullanıcıyı veritabanınıza ekleyin
4. **ALL PRIVILEGES** verin (cPanel genelde sadece bu seçeneği sunar – kullanıcı yine de sadece o veritabanına erişir)
5. `backend/.env` dosyasında bu kullanıcıyı kullanın

**Önemli:** Ana cPanel hesabı yerine bu ayrı veritabanı kullanıcısını kullanın. Böylece uygulama güvenliği ihlal edilse bile cPanel erişimi risk altında olmaz.

---

## Gerekli Yetkiler

| Yetki | Amaç |
|-------|------|
| SELECT, INSERT, UPDATE, DELETE | Uygulama CRUD işlemleri |
| CREATE, DROP, ALTER, INDEX | Migrasyon (tablo oluşturma/güncelleme) |

**Verilmeyen yetkiler:** GRANT, SUPER, CREATE USER, SHUTDOWN – root seviyesinde yetkiler gerekmez.
