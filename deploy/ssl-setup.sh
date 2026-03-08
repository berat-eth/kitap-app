#!/usr/bin/env bash
# =============================================================
# Sesli Kitap - SSL Kurulum Scripti (Let's Encrypt)
# kitap1.beratsimsek.com.tr + api1.beratsimsek.com.tr
# Kullanım: sudo bash ssl-setup.sh
# =============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Root kontrolü
if [ "$(id -u)" -ne 0 ]; then
  error "Bu script root olarak çalıştırılmalı: sudo bash ssl-setup.sh"
fi

DOMAIN_WEB="kitap1.beratsimsek.com.tr"
DOMAIN_API="api1.beratsimsek.com.tr"

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  SSL Kurulumu (Let's Encrypt)             ${NC}"
echo -e "${CYAN}  $DOMAIN_WEB | $DOMAIN_API  ${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# 1. Certbot kurulumu
info "Certbot kontrol ediliyor..."
if ! command -v certbot &>/dev/null; then
  info "Certbot yükleniyor..."
  if command -v apt-get &>/dev/null; then
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
  elif command -v yum &>/dev/null; then
    yum install -y certbot python3-certbot-nginx
  else
    error "Certbot yüklenemedi. Manuel: https://certbot.eff.org"
  fi
  success "Certbot yüklendi."
else
  success "Certbot $(certbot --version 2>&1 | head -1) mevcut."
fi

# 2. Nginx config kontrolü
info "Nginx yapılandırması kontrol ediliyor..."
if [ ! -f /etc/nginx/sites-available/kitap-sites.conf ]; then
  warn "Nginx config bulunamadı. Önce deploy/nginx/kitap-sites.conf kurun."
  read -rp "Devam etmek ister misiniz? Certbot standalone modda çalışacak. [e/H]: " CONT
  if [[ ! "$CONT" =~ ^[Ee]$ ]]; then
    error "Kurulum iptal edildi."
  fi
  STANDALONE=1
else
  STANDALONE=0
  success "Nginx config mevcut."
fi

# 3. Port 80 erişilebilir mi?
info "Port 80 erişilebilirliği kontrol ediliyor..."
if ! curl -s -o /dev/null -w "%{http_code}" "http://localhost" 2>/dev/null | grep -qE "200|301|302|404"; then
  if [ "$STANDALONE" -eq 1 ]; then
    warn "Nginx çalışmıyor olabilir. Certbot standalone modda geçici olarak 80'i kullanacak."
  else
    warn "Nginx çalışıyor mu kontrol edin: systemctl status nginx"
  fi
fi

# 4. SSL sertifikası al
info "SSL sertifikası alınıyor..."
# E-posta: SSL_EMAIL=admin@example.com ile verebilir veya script soracak
CERTBOT_EMAIL="${SSL_EMAIL:-}"
if [ -z "$CERTBOT_EMAIL" ] && [ -t 0 ]; then
  echo ""
  echo "  E-posta (yenileme bildirimi, boş bırakılabilir):"
  read -rp "  > " CERTBOT_EMAIL
  echo ""
fi

CERTBOT_OPTS="-d $DOMAIN_WEB -d $DOMAIN_API --non-interactive --agree-tos --redirect"
if [ -n "$CERTBOT_EMAIL" ]; then
  CERTBOT_OPTS="$CERTBOT_OPTS -m $CERTBOT_EMAIL"
else
  CERTBOT_OPTS="$CERTBOT_OPTS --register-unsafely-without-email"
fi

if [ "$STANDALONE" -eq 0 ]; then
  certbot --nginx $CERTBOT_OPTS
else
  certbot certonly --standalone ${CERTBOT_OPTS/--redirect/}
  warn "Standalone mod kullanıldı. Nginx config'e SSL bloklarını manuel ekleyin."
  echo "  Örnek: deploy/nginx/kitap-sites-ssl.conf"
fi

if [ $? -eq 0 ]; then
  success "SSL sertifikaları alındı!"
else
  error "SSL sertifikası alınamadı. DNS ve port 80 erişimini kontrol edin."
fi

# 5. Otomatik yenileme
info "Otomatik yenileme kontrol ediliyor..."
if systemctl is-enabled certbot.timer &>/dev/null; then
  success "Certbot timer aktif - sertifikalar otomatik yenilenecek."
else
  (systemctl enable certbot.timer 2>/dev/null && systemctl start certbot.timer) || warn "Certbot timer manuel kurulmalı."
fi

# 6. Test
info "SSL yenileme testi..."
certbot renew --dry-run 2>/dev/null && success "Yenileme testi başarılı." || warn "Yenileme testi atlandı."

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  SSL kurulumu tamamlandı!                                    ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  https://$DOMAIN_WEB"
echo "  https://$DOMAIN_API"
echo ""
echo "  Sertifika konumu: /etc/letsencrypt/live/$DOMAIN_WEB/"
echo "  Yenileme: certbot renew (otomatik - günlük kontrol)"
echo ""
