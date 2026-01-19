# Uzak MySQL Sunucusu Kurulum Rehberi

Bu rehber, uzak bir MySQL sunucusu kullanarak backend API'yi kurmak için gerekli adımları içerir.

## 1. Uzak MySQL Sunucusu Bilgileri

Uzak MySQL sunucunuzun şu bilgilere ihtiyacınız var:
- **Host**: Sunucu adresi (örn: `mysql.example.com` veya IP adresi)
- **Port**: Genellikle `3306` (varsayılan MySQL portu)
- **Username**: Veritabanı kullanıcı adı
- **Password**: Veritabanı şifresi
- **Database Name**: Veritabanı adı (örn: `audiobook_db`)

## 2. .env Dosyası Ayarları

`backend/.env` dosyasını oluşturun ve aşağıdaki bilgileri doldurun:

```env
# Database Configuration
DB_HOST=your-remote-mysql-host.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=audiobook_db

# SSL Ayarları (eğer uzak sunucu SSL gerektiriyorsa)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### DATABASE_URL Kullanımı

Alternatif olarak, tek bir `DATABASE_URL` kullanabilirsiniz:

```env
DATABASE_URL=mysql://username:password@host:port/database_name
```

Örnek:
```env
DATABASE_URL=mysql://myuser:mypassword@mysql.example.com:3306/audiobook_db
```

## 3. Uzak Sunucu Bağlantı Testi

Bağlantıyı test etmek için:

```bash
# MySQL client ile test
mysql -h your-remote-mysql-host.com -u your_username -p your_database_name
```

## 4. Firewall ve Güvenlik Ayarları

Uzak MySQL sunucusuna bağlanabilmek için:

1. **Firewall**: Sunucunuzun firewall'unda MySQL portu (genellikle 3306) açık olmalı
2. **MySQL User Permissions**: Kullanıcının uzaktan bağlanma izni olmalı
3. **bind-address**: MySQL sunucusunda `bind-address` ayarı `0.0.0.0` veya sunucu IP'si olmalı

### MySQL User İzinleri

Uzak bağlantı için kullanıcı oluşturma:

```sql
-- Yerel bağlantı için
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON audiobook_db.* TO 'your_username'@'localhost';

-- Uzak bağlantı için (belirli IP)
CREATE USER 'your_username'@'your-app-server-ip' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON audiobook_db.* TO 'your_username'@'your-app-server-ip';

-- Veya tüm IP'lerden (daha az güvenli)
CREATE USER 'your_username'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON audiobook_db.* TO 'your_username'@'%';

FLUSH PRIVILEGES;
```

## 5. SSL Bağlantısı

Eğer uzak MySQL sunucusu SSL gerektiriyorsa:

```env
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

`DB_SSL_REJECT_UNAUTHORIZED=false` kullanıldığında, self-signed sertifikalar kabul edilir.

## 6. Connection Pool Ayarları

Uzak sunucu için connection pool ayarları optimize edilmiştir:

- **connectTimeout**: 60 saniye (uzak bağlantılar için daha uzun)
- **acquireTimeout**: 60 saniye
- **timeout**: 60 saniye
- **connectionLimit**: 10 (eşzamanlı bağlantı sayısı)

Bu ayarlar `src/config/database.ts` dosyasında yapılandırılmıştır.

## 7. Veritabanı Oluşturma

Uzak sunucuda veritabanını oluşturun:

```sql
CREATE DATABASE audiobook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 8. Migration'ları Çalıştırma

Migration'ları çalıştırmadan önce `.env` dosyasının doğru yapılandırıldığından emin olun:

```bash
cd backend
npm install
npm run migrate
```

## 9. Bağlantı Sorunlarını Giderme

### "ECONNREFUSED" Hatası
- MySQL sunucusunun çalıştığından emin olun
- Port'un doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### "Access Denied" Hatası
- Kullanıcı adı ve şifrenin doğru olduğundan emin olun
- Kullanıcının uzaktan bağlanma izni olduğundan emin olun
- `bind-address` ayarını kontrol edin

### "SSL Connection Error"
- `DB_SSL=false` yaparak SSL'i devre dışı bırakabilirsiniz (güvenli değil)
- Veya `DB_SSL_REJECT_UNAUTHORIZED=false` yaparak self-signed sertifikaları kabul edebilirsiniz

### Timeout Hataları
- `connectTimeout` değerini artırın
- Ağ bağlantısını kontrol edin
- MySQL sunucusunun yükünü kontrol edin

## 10. Performans İpuçları

Uzak MySQL sunucusu kullanırken:

1. **Connection Pooling**: Zaten yapılandırılmış, bağlantıları yeniden kullanır
2. **Keep-Alive**: Aktif, bağlantıları canlı tutar
3. **Query Optimization**: İndeksleri kullanın
4. **Caching**: Redis kullanarak sorgu sonuçlarını cache'leyin

## 11. Güvenlik Önerileri

1. **SSL Kullanın**: Üretim ortamında mutlaka SSL kullanın
2. **Güçlü Şifreler**: Veritabanı şifrelerini güçlü tutun
3. **IP Kısıtlaması**: Mümkünse sadece uygulama sunucusunun IP'sinden bağlantıya izin verin
4. **Environment Variables**: `.env` dosyasını asla commit etmeyin
5. **Firewall**: Sadece gerekli portları açın

## 12. Örnek .env Dosyası

```env
# Uzak MySQL Sunucusu
DB_HOST=mysql.production.com
DB_PORT=3306
DB_USER=audiobook_user
DB_PASSWORD=super_secure_password_123
DB_NAME=audiobook_db
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Diğer ayarlar...
NODE_ENV=production
PORT=3000
ADMIN_JWT_SECRET=your-secret-key
ADMIN_JWT_REFRESH_SECRET=your-refresh-secret-key
```

## Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin: `backend/logs/`
2. MySQL sunucusu loglarını kontrol edin
3. Ağ bağlantısını test edin: `ping your-remote-mysql-host.com`
4. Port erişimini test edin: `telnet your-remote-mysql-host.com 3306`

