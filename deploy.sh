#!/bin/bash

# ===========================================
# Sesli Kitap - Kapsamli Deployment Scripti
# Backend API + Web App
# Interaktif Kurulum
# ===========================================

set -e

# ===========================================
# RENKLER VE FORMATLAR
# ===========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

# ===========================================
# GLOBAL DEGISKENLER
# ===========================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
WEBAPP_DIR="$SCRIPT_DIR/web app"
CONFIG_FILE="$SCRIPT_DIR/.deploy.conf"
BACKUP_DIR="$SCRIPT_DIR/backups"
RELEASES_DIR="$SCRIPT_DIR/releases"
LOGS_DIR="$SCRIPT_DIR/logs"

# Varsayilan degerler
DOMAIN=""
DOMAIN_TYPE="single"
BACKEND_PORT="3001"
WEB_PORT="3000"
PM2_MODE="cluster"
INSTALL_REDIS="no"
INSTALL_SSL="no"
INSTALL_FAIL2BAN="no"
INSTALL_SWAP="no"
INSTALL_FIREWALL="no"
BACKUP_ENABLED="yes"
BACKUP_RETENTION="7"
ROLLBACK_ENABLED="yes"
HEALTH_CHECK_ENABLED="yes"
LOG_ROTATION_ENABLED="yes"

# Veritabani
DB_HOST=""
DB_PORT="3306"
DB_NAME=""
DB_USER=""
DB_PASSWORD=""

# Admin
ADMIN_API_KEY=""
SSL_EMAIL=""

# ===========================================
# YARDIMCI FONKSIYONLAR
# ===========================================

print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║       🎧  SESLİ KİTAP - DEPLOYMENT SCRİPTİ  🎧            ║"
    echo "║                                                           ║"
    echo "║       Backend API + Web App Kurulumu                      ║"
    echo "║       Version 1.0.0                                       ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[UYARI]${NC} $1"
}

log_error() {
    echo -e "${RED}[HATA]${NC} $1"
}

log_step() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}${BOLD}  $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

press_enter() {
    echo ""
    read -p "Devam etmek için Enter'a basın..."
}

confirm() {
    local prompt="$1"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [E/h]: "
    else
        prompt="$prompt [e/H]: "
    fi
    
    read -p "$prompt" response
    response=${response:-$default}
    
    case "$response" in
        [eEyY]) return 0 ;;
        *) return 1 ;;
    esac
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Bu script root olarak çalıştırılmalı!"
        echo "   sudo $0 $@"
        exit 1
    fi
}

# ===========================================
# YAPILANDIRMA DOSYASI ISLEMLERI
# ===========================================

save_config() {
    log_info "Yapılandırma kaydediliyor..."
    cat > "$CONFIG_FILE" << EOF
# Sesli Kitap Deployment Yapilandirmasi
# Otomatik olusturuldu: $(date)

# Domain
DOMAIN="$DOMAIN"
DOMAIN_TYPE="$DOMAIN_TYPE"

# Portlar
BACKEND_PORT="$BACKEND_PORT"
WEB_PORT="$WEB_PORT"

# PM2
PM2_MODE="$PM2_MODE"

# Kurulum Secenekleri
INSTALL_REDIS="$INSTALL_REDIS"
INSTALL_SSL="$INSTALL_SSL"
INSTALL_FAIL2BAN="$INSTALL_FAIL2BAN"
INSTALL_SWAP="$INSTALL_SWAP"
INSTALL_FIREWALL="$INSTALL_FIREWALL"

# Ozellikler
BACKUP_ENABLED="$BACKUP_ENABLED"
BACKUP_RETENTION="$BACKUP_RETENTION"
ROLLBACK_ENABLED="$ROLLBACK_ENABLED"
HEALTH_CHECK_ENABLED="$HEALTH_CHECK_ENABLED"
LOG_ROTATION_ENABLED="$LOG_ROTATION_ENABLED"

# Veritabani
DB_HOST="$DB_HOST"
DB_PORT="$DB_PORT"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"

# Admin
ADMIN_API_KEY="$ADMIN_API_KEY"
SSL_EMAIL="$SSL_EMAIL"
EOF
    log_success "Yapılandırma kaydedildi: $CONFIG_FILE"
}

load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        return 0
    fi
    return 1
}

# ===========================================
# INTERAKTIF MENULER
# ===========================================

show_main_menu() {
    print_banner
    
    echo -e "${WHITE}${BOLD}Ana Menü${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Tam Kurulum (Tüm bileşenleri kur)"
    echo -e "  ${CYAN}2)${NC} Sadece Backend API kur"
    echo -e "  ${CYAN}3)${NC} Sadece Web App kur"
    echo -e "  ${CYAN}4)${NC} Güncelleme (Mevcut kurulumu güncelle)"
    echo -e "  ${CYAN}5)${NC} Bakım Modu"
    echo -e "  ${CYAN}6)${NC} Sistem Durumu"
    echo -e "  ${CYAN}0)${NC} Çıkış"
    echo ""
    read -p "Seçiminiz [0-6]: " choice
    
    case $choice in
        1) install_full ;;
        2) install_backend_only ;;
        3) install_webapp_only ;;
        4) show_update_menu ;;
        5) show_maintenance_menu ;;
        6) show_status ;;
        0) echo "Güle güle!"; exit 0 ;;
        *) log_error "Geçersiz seçim!"; sleep 1; show_main_menu ;;
    esac
}

show_update_menu() {
    print_banner
    
    echo -e "${WHITE}${BOLD}Güncelleme Menüsü${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Tümünü Güncelle (Backend + Web)"
    echo -e "  ${CYAN}2)${NC} Sadece Backend Güncelle"
    echo -e "  ${CYAN}3)${NC} Sadece Web App Güncelle"
    echo -e "  ${CYAN}0)${NC} Ana Menü"
    echo ""
    read -p "Seçiminiz [0-3]: " choice
    
    case $choice in
        1) update_all ;;
        2) update_backend ;;
        3) update_webapp ;;
        0) show_main_menu ;;
        *) log_error "Geçersiz seçim!"; sleep 1; show_update_menu ;;
    esac
}

show_maintenance_menu() {
    print_banner
    
    echo -e "${WHITE}${BOLD}Bakım Menüsü${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC}  Yedekleme Yap"
    echo -e "  ${CYAN}2)${NC}  Yedekten Geri Yükle"
    echo -e "  ${CYAN}3)${NC}  Rollback (Önceki Sürüm)"
    echo -e "  ${CYAN}4)${NC}  Logları Görüntüle"
    echo -e "  ${CYAN}5)${NC}  Sistem Durumu"
    echo -e "  ${CYAN}6)${NC}  Servisleri Yeniden Başlat"
    echo -e "  ${CYAN}7)${NC}  SSL Sertifikası Yenile"
    echo -e "  ${CYAN}8)${NC}  Yapılandırmayı Düzenle"
    echo -e "  ${CYAN}9)${NC}  Veritabanı Bağlantısı Test Et"
    echo -e "  ${CYAN}10)${NC} Canlı Monitoring"
    echo -e "  ${CYAN}0)${NC}  Ana Menü"
    echo ""
    read -p "Seçiminiz [0-10]: " choice
    
    case $choice in
        1) do_backup ;;
        2) do_restore ;;
        3) do_rollback ;;
        4) show_logs_menu ;;
        5) show_status ;;
        6) restart_services ;;
        7) renew_ssl ;;
        8) edit_config ;;
        9) test_database ;;
        10) live_monitor ;;
        0) show_main_menu ;;
        *) log_error "Geçersiz seçim!"; sleep 1; show_maintenance_menu ;;
    esac
}

show_logs_menu() {
    print_banner
    
    echo -e "${WHITE}${BOLD}Log Görüntüleme${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Backend Logları"
    echo -e "  ${CYAN}2)${NC} Web App Logları"
    echo -e "  ${CYAN}3)${NC} Nginx Logları"
    echo -e "  ${CYAN}4)${NC} PM2 Tüm Loglar"
    echo -e "  ${CYAN}5)${NC} Sistem Logları"
    echo -e "  ${CYAN}0)${NC} Geri"
    echo ""
    read -p "Seçiminiz [0-5]: " choice
    
    case $choice in
        1) pm2 logs sesli-kitap-api --lines 100; press_enter; show_logs_menu ;;
        2) pm2 logs sesli-kitap-web --lines 100; press_enter; show_logs_menu ;;
        3) tail -100 /var/log/nginx/error.log; press_enter; show_logs_menu ;;
        4) pm2 logs --lines 100; press_enter; show_logs_menu ;;
        5) journalctl -xe --no-pager | tail -100; press_enter; show_logs_menu ;;
        0) show_maintenance_menu ;;
        *) log_error "Geçersiz seçim!"; sleep 1; show_logs_menu ;;
    esac
}

# ===========================================
# KURULUM WIZARD'I
# ===========================================

wizard_components() {
    log_step "Adım 1/7: Bileşen Seçimi"
    
    local components=("Node.js 20.x" "PM2" "Nginx" "Redis" "SSL (Let's Encrypt)" "Fail2ban")
    local selected=(1 1 1 0 0 0)  # Varsayilan: ilk 3 secili
    
    while true; do
        echo -e "${WHITE}Hangi bileşenleri kurmak istiyorsunuz?${NC}"
        echo ""
        for i in "${!components[@]}"; do
            if [ "${selected[$i]}" -eq 1 ]; then
                echo -e "  ${GREEN}[$((i+1))] [x]${NC} ${components[$i]}"
            else
                echo -e "  ${CYAN}[$((i+1))] [ ]${NC} ${components[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}Numara girerek seçin/kaldırın, devam için Enter${NC}"
        echo ""
        read -p "Seçiminiz: " choice
        
        if [ -z "$choice" ]; then
            break
        elif [[ "$choice" =~ ^[1-6]$ ]]; then
            idx=$((choice-1))
            if [ "${selected[$idx]}" -eq 1 ]; then
                selected[$idx]=0
            else
                selected[$idx]=1
            fi
        fi
        clear
        print_banner
        log_step "Adım 1/7: Bileşen Seçimi"
    done
    
    # Secim sonuclari
    [ "${selected[3]}" -eq 1 ] && INSTALL_REDIS="yes"
    [ "${selected[4]}" -eq 1 ] && INSTALL_SSL="yes"
    [ "${selected[5]}" -eq 1 ] && INSTALL_FAIL2BAN="yes"
}

wizard_domain() {
    log_step "Adım 2/7: Domain Yapılandırması"
    
    echo -e "${WHITE}Domain yapılandırması:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Tek domain (örn: ornek.com ve ornek.com/api)"
    echo -e "  ${CYAN}2)${NC} Subdomain (örn: www.ornek.com ve api.ornek.com)"
    echo -e "  ${CYAN}3)${NC} Sadece IP (domain kullanma)"
    echo ""
    read -p "Seçiminiz [1-3]: " choice
    
    case $choice in
        1) DOMAIN_TYPE="single" ;;
        2) DOMAIN_TYPE="subdomain" ;;
        3) DOMAIN_TYPE="ip" ;;
        *) DOMAIN_TYPE="single" ;;
    esac
    
    if [ "$DOMAIN_TYPE" != "ip" ]; then
        echo ""
        read -p "Domain adınızı girin (örn: ornek.com): " DOMAIN
        
        if [ "$DOMAIN_TYPE" = "subdomain" ]; then
            read -p "API subdomain (varsayılan: api): " API_SUBDOMAIN
            API_SUBDOMAIN=${API_SUBDOMAIN:-api}
        fi
    fi
}

wizard_database() {
    log_step "Adım 3/7: Veritabanı Yapılandırması"
    
    echo -e "${WHITE}MySQL Veritabanı Ayarları:${NC}"
    echo ""
    
    read -p "  Host [92.113.22.70]: " input
    DB_HOST=${input:-92.113.22.70}
    
    read -p "  Port [3306]: " input
    DB_PORT=${input:-3306}
    
    read -p "  Database [u987029066_kitap]: " input
    DB_NAME=${input:-u987029066_kitap}
    
    read -p "  Kullanıcı [u987029066_kitap]: " input
    DB_USER=${input:-u987029066_kitap}
    
    read -sp "  Şifre: " DB_PASSWORD
    echo ""
    
    # Test baglantisi
    echo ""
    if confirm "Veritabanı bağlantısını test etmek ister misiniz?" "y"; then
        test_database_connection
    fi
}

wizard_features() {
    log_step "Adım 4/7: Ek Özellikler"
    
    local features=("Otomatik Yedekleme (Günlük)" "Rollback Desteği" "Health Check" "Log Rotation" "Swap Alanı (2GB)" "UFW Firewall")
    local selected=(1 1 1 1 0 0)
    
    while true; do
        echo -e "${WHITE}Ek özellikler:${NC}"
        echo ""
        for i in "${!features[@]}"; do
            if [ "${selected[$i]}" -eq 1 ]; then
                echo -e "  ${GREEN}[$((i+1))] [x]${NC} ${features[$i]}"
            else
                echo -e "  ${CYAN}[$((i+1))] [ ]${NC} ${features[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}Numara girerek seçin/kaldırın, devam için Enter${NC}"
        echo ""
        read -p "Seçiminiz: " choice
        
        if [ -z "$choice" ]; then
            break
        elif [[ "$choice" =~ ^[1-6]$ ]]; then
            idx=$((choice-1))
            selected[$idx]=$((1 - ${selected[$idx]}))
        fi
        clear
        print_banner
        log_step "Adım 4/7: Ek Özellikler"
    done
    
    [ "${selected[0]}" -eq 1 ] && BACKUP_ENABLED="yes" || BACKUP_ENABLED="no"
    [ "${selected[1]}" -eq 1 ] && ROLLBACK_ENABLED="yes" || ROLLBACK_ENABLED="no"
    [ "${selected[2]}" -eq 1 ] && HEALTH_CHECK_ENABLED="yes" || HEALTH_CHECK_ENABLED="no"
    [ "${selected[3]}" -eq 1 ] && LOG_ROTATION_ENABLED="yes" || LOG_ROTATION_ENABLED="no"
    [ "${selected[4]}" -eq 1 ] && INSTALL_SWAP="yes" || INSTALL_SWAP="no"
    [ "${selected[5]}" -eq 1 ] && INSTALL_FIREWALL="yes" || INSTALL_FIREWALL="no"
}

wizard_pm2() {
    log_step "Adım 5/7: PM2 Yapılandırması"
    
    echo -e "${WHITE}PM2 çalışma modu:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Cluster (Çoklu CPU kullan - Önerilen)"
    echo -e "  ${CYAN}2)${NC} Fork (Tek instance)"
    echo -e "  ${CYAN}3)${NC} Otomatik (CPU sayısına göre)"
    echo ""
    read -p "Seçiminiz [1-3]: " choice
    
    case $choice in
        1) PM2_MODE="cluster" ;;
        2) PM2_MODE="fork" ;;
        3) PM2_MODE="auto" ;;
        *) PM2_MODE="cluster" ;;
    esac
    
    echo ""
    read -p "Backend port [3001]: " input
    BACKEND_PORT=${input:-3001}
    
    read -p "Web App port [3000]: " input
    WEB_PORT=${input:-3000}
}

wizard_admin() {
    log_step "Adım 6/7: Admin Yapılandırması"
    
    echo -e "${WHITE}Admin API Ayarları:${NC}"
    echo ""
    
    # Otomatik API key olustur
    local auto_key="sk-admin-$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64)"
    
    echo -e "  Otomatik oluşturulan API key:"
    echo -e "  ${CYAN}$auto_key${NC}"
    echo ""
    
    if confirm "Bu API key'i kullanmak ister misiniz?" "y"; then
        ADMIN_API_KEY="$auto_key"
    else
        read -p "  Kendi API key'inizi girin: " ADMIN_API_KEY
    fi
    
    if [ "$INSTALL_SSL" = "yes" ]; then
        echo ""
        read -p "  SSL için email adresiniz: " SSL_EMAIL
    fi
}

wizard_summary() {
    log_step "Adım 7/7: Kurulum Özeti"
    
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║                    KURULUM ÖZETİ                          ║${NC}"
    echo -e "${WHITE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${NC}  Uygulamalar    : ${CYAN}Backend + Web App${NC}"
    echo -e "${WHITE}║${NC}  Domain         : ${CYAN}${DOMAIN:-IP üzerinden}${NC}"
    echo -e "${WHITE}║${NC}  Domain Tipi    : ${CYAN}$DOMAIN_TYPE${NC}"
    echo -e "${WHITE}║${NC}  Backend Port   : ${CYAN}$BACKEND_PORT${NC}"
    echo -e "${WHITE}║${NC}  Web Port       : ${CYAN}$WEB_PORT${NC}"
    echo -e "${WHITE}║${NC}  PM2 Modu       : ${CYAN}$PM2_MODE${NC}"
    echo -e "${WHITE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${NC}  Redis          : ${CYAN}$INSTALL_REDIS${NC}"
    echo -e "${WHITE}║${NC}  SSL            : ${CYAN}$INSTALL_SSL${NC}"
    echo -e "${WHITE}║${NC}  Fail2ban       : ${CYAN}$INSTALL_FAIL2BAN${NC}"
    echo -e "${WHITE}║${NC}  Firewall       : ${CYAN}$INSTALL_FIREWALL${NC}"
    echo -e "${WHITE}║${NC}  Swap           : ${CYAN}$INSTALL_SWAP${NC}"
    echo -e "${WHITE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${NC}  Yedekleme      : ${CYAN}$BACKUP_ENABLED${NC}"
    echo -e "${WHITE}║${NC}  Rollback       : ${CYAN}$ROLLBACK_ENABLED${NC}"
    echo -e "${WHITE}║${NC}  Health Check   : ${CYAN}$HEALTH_CHECK_ENABLED${NC}"
    echo -e "${WHITE}║${NC}  Log Rotation   : ${CYAN}$LOG_ROTATION_ENABLED${NC}"
    echo -e "${WHITE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${WHITE}║${NC}  DB Host        : ${CYAN}$DB_HOST${NC}"
    echo -e "${WHITE}║${NC}  DB Name        : ${CYAN}$DB_NAME${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if confirm "Kuruluma başlamak istiyor musunuz?" "y"; then
        save_config
        return 0
    else
        log_warning "Kurulum iptal edildi."
        exit 0
    fi
}

# ===========================================
# KURULUM FONKSIYONLARI
# ===========================================

install_system_packages() {
    log_step "Sistem Paketleri Kuruluyor"
    
    log_info "Paket listesi güncelleniyor..."
    apt-get update -y
    
    log_info "Temel paketler kuruluyor..."
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        unzip \
        htop \
        vim
    
    log_success "Sistem paketleri kuruldu"
}

install_nodejs() {
    log_step "Node.js Kuruluyor"
    
    if command -v node &> /dev/null; then
        local current_version=$(node -v)
        log_info "Node.js zaten yüklü: $current_version"
    else
        log_info "Node.js 20.x kuruluyor..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    log_success "Node.js: $(node -v)"
    log_success "npm: $(npm -v)"
}

install_pm2() {
    log_step "PM2 Kuruluyor"
    
    if command -v pm2 &> /dev/null; then
        log_info "PM2 zaten yüklü: $(pm2 -v)"
    else
        log_info "PM2 kuruluyor..."
        npm install -g pm2
    fi
    
    # Log rotation
    if [ "$LOG_ROTATION_ENABLED" = "yes" ]; then
        log_info "PM2 log rotation yapılandırılıyor..."
        pm2 install pm2-logrotate
        pm2 set pm2-logrotate:max_size 10M
        pm2 set pm2-logrotate:retain 7
        pm2 set pm2-logrotate:compress true
    fi
    
    log_success "PM2 kuruldu: $(pm2 -v)"
}

install_nginx() {
    log_step "Nginx Kuruluyor"
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx zaten yüklü"
    else
        log_info "Nginx kuruluyor..."
        apt-get install -y nginx
    fi
    
    systemctl enable nginx
    systemctl start nginx
    
    log_success "Nginx kuruldu"
}

install_redis() {
    if [ "$INSTALL_REDIS" != "yes" ]; then
        return
    fi
    
    log_step "Redis Kuruluyor"
    
    if command -v redis-server &> /dev/null; then
        log_info "Redis zaten yüklü"
    else
        log_info "Redis kuruluyor..."
        apt-get install -y redis-server
    fi
    
    systemctl enable redis-server
    systemctl start redis-server
    
    log_success "Redis kuruldu"
}

install_certbot() {
    if [ "$INSTALL_SSL" != "yes" ]; then
        return
    fi
    
    log_step "Certbot Kuruluyor"
    
    if command -v certbot &> /dev/null; then
        log_info "Certbot zaten yüklü"
    else
        log_info "Certbot kuruluyor..."
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    log_success "Certbot kuruldu"
}

install_fail2ban() {
    if [ "$INSTALL_FAIL2BAN" != "yes" ]; then
        return
    fi
    
    log_step "Fail2ban Kuruluyor"
    
    if command -v fail2ban-server &> /dev/null; then
        log_info "Fail2ban zaten yüklü"
    else
        log_info "Fail2ban kuruluyor..."
        apt-get install -y fail2ban
    fi
    
    # Nginx jail
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2ban kuruldu"
}

setup_firewall() {
    if [ "$INSTALL_FIREWALL" != "yes" ]; then
        return
    fi
    
    log_step "Firewall Yapılandırılıyor"
    
    log_info "UFW kuruluyor..."
    apt-get install -y ufw
    
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    
    log_success "Firewall aktif"
}

setup_swap() {
    if [ "$INSTALL_SWAP" != "yes" ]; then
        return
    fi
    
    log_step "Swap Alanı Oluşturuluyor"
    
    if [ -f /swapfile ]; then
        log_info "Swap alanı zaten var"
    else
        log_info "2GB swap alanı oluşturuluyor..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    
    log_success "Swap alanı hazır"
}

# ===========================================
# UYGULAMA KURULUM FONKSIYONLARI
# ===========================================

setup_directories() {
    log_step "Dizinler Oluşturuluyor"
    
    mkdir -p "$BACKUP_DIR/db"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$RELEASES_DIR/backend"
    mkdir -p "$RELEASES_DIR/web"
    mkdir -p "$LOGS_DIR"
    mkdir -p "$BACKEND_DIR/uploads/audio"
    mkdir -p "$BACKEND_DIR/uploads/images"
    mkdir -p "$BACKEND_DIR/logs"
    
    chmod -R 755 "$BACKUP_DIR"
    chmod -R 755 "$RELEASES_DIR"
    chmod -R 755 "$LOGS_DIR"
    
    log_success "Dizinler oluşturuldu"
}

create_backend_env() {
    log_step "Backend .env Oluşturuluyor"
    
    cat > "$BACKEND_DIR/.env" << EOF
# ===========================================
# Sesli Kitap Backend - Ortam Değişkenleri
# Otomatik oluşturuldu: $(date)
# ===========================================

# Server Ayarları
NODE_ENV=production
PORT=$BACKEND_PORT
API_PREFIX=/api

# MySQL Veritabanı
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=${INSTALL_REDIS:+localhost}
REDIS_PORT=6379
REDIS_PASSWORD=

# Admin API Key
ADMIN_API_KEY=$ADMIN_API_KEY

# CORS Ayarları
CORS_ORIGINS=http://localhost:$WEB_PORT,https://$DOMAIN

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Dosya Yükleme
UPLOAD_MAX_SIZE=50000000
AUDIO_UPLOAD_PATH=./uploads/audio
IMAGE_UPLOAD_PATH=./uploads/images

# Logging
LOG_LEVEL=info

# Swagger
SWAGGER_ENABLED=true
EOF
    
    log_success "Backend .env oluşturuldu"
}

create_webapp_env() {
    log_step "Web App .env.local Oluşturuluyor"
    
    local api_url
    if [ "$DOMAIN_TYPE" = "ip" ]; then
        api_url="http://localhost:$BACKEND_PORT/api"
    elif [ "$DOMAIN_TYPE" = "subdomain" ]; then
        api_url="https://api.$DOMAIN/api"
    else
        api_url="https://$DOMAIN/api"
    fi
    
    cat > "$WEBAPP_DIR/.env.local" << EOF
# ===========================================
# Sesli Kitap Web App - Ortam Değişkenleri
# Otomatik oluşturuldu: $(date)
# ===========================================

NEXT_PUBLIC_API_URL=$api_url
EOF
    
    log_success "Web App .env.local oluşturuldu"
}

build_backend() {
    log_step "Backend Build Ediliyor"
    
    cd "$BACKEND_DIR"
    
    # Rollback icin mevcut dist'i yedekle
    if [ "$ROLLBACK_ENABLED" = "yes" ] && [ -d "dist" ]; then
        local timestamp=$(date +%Y%m%d_%H%M%S)
        cp -r dist "$RELEASES_DIR/backend/$timestamp"
        
        # Eski release'leri temizle (son 3 tane kalsın)
        cd "$RELEASES_DIR/backend"
        ls -t | tail -n +4 | xargs -r rm -rf
        cd "$BACKEND_DIR"
    fi
    
    log_info "npm paketleri yükleniyor..."
    npm install
    
    log_info "TypeScript build yapılıyor..."
    npm run build
    
    log_success "Backend build tamamlandı"
}

build_webapp() {
    log_step "Web App Build Ediliyor"
    
    cd "$WEBAPP_DIR"
    
    # Rollback icin mevcut .next'i yedekle
    if [ "$ROLLBACK_ENABLED" = "yes" ] && [ -d ".next" ]; then
        local timestamp=$(date +%Y%m%d_%H%M%S)
        cp -r .next "$RELEASES_DIR/web/$timestamp"
        
        # Eski release'leri temizle (son 3 tane kalsın)
        cd "$RELEASES_DIR/web"
        ls -t | tail -n +4 | xargs -r rm -rf
        cd "$WEBAPP_DIR"
    fi
    
    log_info "npm paketleri yükleniyor..."
    npm install
    
    log_info "Next.js build yapılıyor..."
    npm run build
    
    log_success "Web App build tamamlandı"
}

setup_database() {
    log_step "Veritabanı Hazırlanıyor"
    
    cd "$BACKEND_DIR"
    
    log_info "Veritabanı tabloları senkronize ediliyor..."
    npm run db:sync
    
    if confirm "Örnek veri eklemek ister misiniz?" "n"; then
        npm run db:seed
    fi
    
    log_success "Veritabanı hazır"
}

start_pm2_apps() {
    log_step "PM2 Uygulamaları Başlatılıyor"
    
    # Mevcut uygulamaları durdur
    pm2 delete sesli-kitap-api 2>/dev/null || true
    pm2 delete sesli-kitap-web 2>/dev/null || true
    
    # PM2 instance sayisi
    local instances="max"
    [ "$PM2_MODE" = "fork" ] && instances="1"
    
    # Backend baslat
    cd "$BACKEND_DIR"
    log_info "Backend başlatılıyor..."
    pm2 start dist/app.js \
        --name sesli-kitap-api \
        -i $instances \
        --max-memory-restart 500M \
        --env production
    
    # Web App baslat
    cd "$WEBAPP_DIR"
    log_info "Web App başlatılıyor..."
    pm2 start npm \
        --name sesli-kitap-web \
        -i $instances \
        --max-memory-restart 500M \
        -- start
    
    # Kaydet ve startup ayarla
    pm2 save
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    log_success "PM2 uygulamaları başlatıldı"
    pm2 status
}

configure_nginx() {
    log_step "Nginx Yapılandırılıyor"
    
    local nginx_conf="/etc/nginx/sites-available/sesli-kitap"
    
    if [ "$DOMAIN_TYPE" = "ip" ]; then
        # IP bazli yapilandirma
        cat > "$nginx_conf" << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    client_max_body_size 50M;
    
    # Web App
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Swagger
    location /api-docs {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Uploads
    location /uploads {
        alias $BACKEND_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Health
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        access_log off;
    }
}
EOF
    elif [ "$DOMAIN_TYPE" = "single" ]; then
        # Tek domain yapilandirma
        cat > "$nginx_conf" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL (certbot tarafindan doldurulacak)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    
    client_max_body_size 50M;
    
    # Guvenlik headerlari
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Web App
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Swagger
    location /api-docs {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Uploads
    location /uploads {
        alias $BACKEND_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Health
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        access_log off;
    }
}
EOF
    else
        # Subdomain yapilandirma
        cat > "$nginx_conf" << EOF
# Web App
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# API
server {
    listen 80;
    server_name api.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /uploads {
        alias $BACKEND_DIR/uploads;
        expires 30d;
    }
}
EOF
    fi
    
    # Symlink olustur
    ln -sf "$nginx_conf" /etc/nginx/sites-enabled/sesli-kitap
    rm -f /etc/nginx/sites-enabled/default
    
    # Test ve restart
    nginx -t
    systemctl restart nginx
    
    log_success "Nginx yapılandırıldı"
}

setup_ssl() {
    if [ "$INSTALL_SSL" != "yes" ] || [ "$DOMAIN_TYPE" = "ip" ]; then
        return
    fi
    
    log_step "SSL Sertifikası Alınıyor"
    
    # Gecici olarak HTTP-only config kullan
    cat > /etc/nginx/sites-available/sesli-kitap << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
    }
}
EOF
    
    systemctl restart nginx
    
    # Certbot
    certbot --nginx -d $DOMAIN -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email "$SSL_EMAIL" \
        --redirect
    
    # Gercek config'i geri yukle
    configure_nginx
    
    # Otomatik yenileme
    (crontab -l 2>/dev/null | grep -v certbot; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL sertifikası kuruldu"
}

setup_backup_cron() {
    if [ "$BACKUP_ENABLED" != "yes" ]; then
        return
    fi
    
    log_step "Yedekleme Cron'u Ayarlanıyor"
    
    # Yedekleme scripti
    cat > "$SCRIPT_DIR/backup-cron.sh" << EOF
#!/bin/bash
# Otomatik yedekleme scripti

BACKUP_DIR="$BACKUP_DIR"
DB_HOST="$DB_HOST"
DB_PORT="$DB_PORT"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"
RETENTION=$BACKUP_RETENTION

DATE=\$(date +%Y%m%d_%H%M%S)

# Veritabani yedekle
mysqldump -h \$DB_HOST -P \$DB_PORT -u \$DB_USER -p\$DB_PASSWORD \$DB_NAME > "\$BACKUP_DIR/db/db_\$DATE.sql"
gzip "\$BACKUP_DIR/db/db_\$DATE.sql"

# Uploads yedekle
tar -czf "\$BACKUP_DIR/files/uploads_\$DATE.tar.gz" -C "$BACKEND_DIR" uploads

# Eski yedekleri temizle
find "\$BACKUP_DIR/db" -name "*.gz" -mtime +\$RETENTION -delete
find "\$BACKUP_DIR/files" -name "*.tar.gz" -mtime +\$RETENTION -delete

echo "Yedekleme tamamlandi: \$DATE"
EOF
    
    chmod +x "$SCRIPT_DIR/backup-cron.sh"
    
    # Cron ekle (her gun gece 3'te)
    (crontab -l 2>/dev/null | grep -v backup-cron; echo "0 3 * * * $SCRIPT_DIR/backup-cron.sh >> $LOGS_DIR/backup.log 2>&1") | crontab -
    
    log_success "Yedekleme cron'u ayarlandı"
}

# ===========================================
# BAKIM FONKSIYONLARI
# ===========================================

do_backup() {
    log_step "Manuel Yedekleme"
    
    local DATE=$(date +%Y%m%d_%H%M%S)
    
    # Veritabani
    log_info "Veritabanı yedekleniyor..."
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/db/db_$DATE.sql"
    gzip "$BACKUP_DIR/db/db_$DATE.sql"
    log_success "Veritabanı yedeklendi: db_$DATE.sql.gz"
    
    # Uploads
    log_info "Upload dosyaları yedekleniyor..."
    tar -czf "$BACKUP_DIR/files/uploads_$DATE.tar.gz" -C "$BACKEND_DIR" uploads
    log_success "Dosyalar yedeklendi: uploads_$DATE.tar.gz"
    
    press_enter
    show_maintenance_menu
}

do_restore() {
    log_step "Yedekten Geri Yükleme"
    
    echo -e "${WHITE}Mevcut veritabanı yedekleri:${NC}"
    echo ""
    ls -la "$BACKUP_DIR/db/"*.gz 2>/dev/null || echo "Yedek bulunamadı"
    echo ""
    
    read -p "Geri yüklenecek dosya adı (örn: db_20240101_120000.sql.gz): " filename
    
    if [ -f "$BACKUP_DIR/db/$filename" ]; then
        if confirm "Bu yedek geri yüklenecek. Emin misiniz?" "n"; then
            log_info "Yedek geri yükleniyor..."
            gunzip -c "$BACKUP_DIR/db/$filename" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
            log_success "Veritabanı geri yüklendi!"
        fi
    else
        log_error "Dosya bulunamadı!"
    fi
    
    press_enter
    show_maintenance_menu
}

do_rollback() {
    log_step "Rollback"
    
    echo -e "${WHITE}Backend sürümleri:${NC}"
    ls -la "$RELEASES_DIR/backend/" 2>/dev/null || echo "Sürüm bulunamadı"
    echo ""
    
    echo -e "${WHITE}Web App sürümleri:${NC}"
    ls -la "$RELEASES_DIR/web/" 2>/dev/null || echo "Sürüm bulunamadı"
    echo ""
    
    echo -e "  ${CYAN}1)${NC} Backend rollback"
    echo -e "  ${CYAN}2)${NC} Web App rollback"
    echo -e "  ${CYAN}3)${NC} Her ikisi"
    echo -e "  ${CYAN}0)${NC} İptal"
    echo ""
    read -p "Seçiminiz [0-3]: " choice
    
    case $choice in
        1)
            read -p "Backend sürüm klasörü: " version
            if [ -d "$RELEASES_DIR/backend/$version" ]; then
                rm -rf "$BACKEND_DIR/dist"
                cp -r "$RELEASES_DIR/backend/$version" "$BACKEND_DIR/dist"
                pm2 restart sesli-kitap-api
                log_success "Backend rollback tamamlandı!"
            fi
            ;;
        2)
            read -p "Web App sürüm klasörü: " version
            if [ -d "$RELEASES_DIR/web/$version" ]; then
                rm -rf "$WEBAPP_DIR/.next"
                cp -r "$RELEASES_DIR/web/$version" "$WEBAPP_DIR/.next"
                pm2 restart sesli-kitap-web
                log_success "Web App rollback tamamlandı!"
            fi
            ;;
        3)
            read -p "Sürüm klasörü: " version
            if [ -d "$RELEASES_DIR/backend/$version" ]; then
                rm -rf "$BACKEND_DIR/dist"
                cp -r "$RELEASES_DIR/backend/$version" "$BACKEND_DIR/dist"
            fi
            if [ -d "$RELEASES_DIR/web/$version" ]; then
                rm -rf "$WEBAPP_DIR/.next"
                cp -r "$RELEASES_DIR/web/$version" "$WEBAPP_DIR/.next"
            fi
            pm2 restart all
            log_success "Rollback tamamlandı!"
            ;;
    esac
    
    press_enter
    show_maintenance_menu
}

show_status() {
    log_step "Sistem Durumu"
    
    echo -e "${WHITE}PM2 Durumu:${NC}"
    pm2 status
    echo ""
    
    echo -e "${WHITE}Nginx Durumu:${NC}"
    systemctl status nginx --no-pager | head -10
    echo ""
    
    if [ "$INSTALL_REDIS" = "yes" ]; then
        echo -e "${WHITE}Redis Durumu:${NC}"
        systemctl status redis-server --no-pager | head -5
        echo ""
    fi
    
    echo -e "${WHITE}Disk Kullanımı:${NC}"
    df -h | head -5
    echo ""
    
    echo -e "${WHITE}Bellek Kullanımı:${NC}"
    free -h
    echo ""
    
    echo -e "${WHITE}CPU Yükü:${NC}"
    uptime
    echo ""
    
    press_enter
    show_main_menu
}

restart_services() {
    log_step "Servisler Yeniden Başlatılıyor"
    
    echo -e "  ${CYAN}1)${NC} Tümünü restart"
    echo -e "  ${CYAN}2)${NC} Sadece Backend"
    echo -e "  ${CYAN}3)${NC} Sadece Web App"
    echo -e "  ${CYAN}4)${NC} Nginx"
    echo -e "  ${CYAN}0)${NC} İptal"
    echo ""
    read -p "Seçiminiz [0-4]: " choice
    
    case $choice in
        1) pm2 restart all; systemctl restart nginx ;;
        2) pm2 restart sesli-kitap-api ;;
        3) pm2 restart sesli-kitap-web ;;
        4) systemctl restart nginx ;;
    esac
    
    log_success "Servisler yeniden başlatıldı"
    press_enter
    show_maintenance_menu
}

renew_ssl() {
    log_step "SSL Sertifikası Yenileniyor"
    
    certbot renew
    systemctl restart nginx
    
    log_success "SSL sertifikası yenilendi"
    press_enter
    show_maintenance_menu
}

edit_config() {
    log_step "Yapılandırma Düzenleme"
    
    if [ -f "$CONFIG_FILE" ]; then
        ${EDITOR:-nano} "$CONFIG_FILE"
        source "$CONFIG_FILE"
        log_success "Yapılandırma yüklendi"
    else
        log_error "Yapılandırma dosyası bulunamadı!"
    fi
    
    press_enter
    show_maintenance_menu
}

test_database() {
    log_step "Veritabanı Bağlantı Testi"
    
    test_database_connection
    
    press_enter
    show_maintenance_menu
}

test_database_connection() {
    log_info "Veritabanı bağlantısı test ediliyor..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" &>/dev/null; then
        log_success "Veritabanı bağlantısı başarılı!"
        return 0
    else
        log_error "Veritabanı bağlantısı başarısız!"
        return 1
    fi
}

live_monitor() {
    log_step "Canlı Monitoring"
    
    log_info "Çıkmak için Ctrl+C"
    echo ""
    
    pm2 monit
    
    show_maintenance_menu
}

# ===========================================
# GUNCELLEME FONKSIYONLARI
# ===========================================

update_all() {
    log_step "Tümü Güncelleniyor"
    
    load_config
    
    build_backend
    build_webapp
    
    pm2 restart all
    
    log_success "Güncelleme tamamlandı!"
    pm2 status
    
    press_enter
    show_main_menu
}

update_backend() {
    log_step "Backend Güncelleniyor"
    
    load_config
    build_backend
    pm2 restart sesli-kitap-api
    
    log_success "Backend güncellendi!"
    press_enter
    show_update_menu
}

update_webapp() {
    log_step "Web App Güncelleniyor"
    
    load_config
    build_webapp
    pm2 restart sesli-kitap-web
    
    log_success "Web App güncellendi!"
    press_enter
    show_update_menu
}

# ===========================================
# ANA KURULUM FONKSIYONLARI
# ===========================================

install_full() {
    check_root
    print_banner
    
    # Wizard
    wizard_components
    wizard_domain
    wizard_database
    wizard_features
    wizard_pm2
    wizard_admin
    wizard_summary
    
    # Kurulum
    install_system_packages
    install_nodejs
    install_pm2
    install_nginx
    install_redis
    install_certbot
    install_fail2ban
    setup_firewall
    setup_swap
    
    setup_directories
    create_backend_env
    create_webapp_env
    
    build_backend
    build_webapp
    setup_database
    
    start_pm2_apps
    configure_nginx
    setup_ssl
    setup_backup_cron
    
    # Sonuc
    log_step "Kurulum Tamamlandı!"
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           🎉 KURULUM BAŞARIYLA TAMAMLANDI! 🎉             ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    if [ "$DOMAIN_TYPE" = "ip" ]; then
        local ip=$(curl -s ifconfig.me 2>/dev/null || echo "SUNUCU_IP")
        echo -e "  Web App   : ${CYAN}http://$ip${NC}"
        echo -e "  API       : ${CYAN}http://$ip/api${NC}"
        echo -e "  Swagger   : ${CYAN}http://$ip/api-docs${NC}"
    else
        echo -e "  Web App   : ${CYAN}https://$DOMAIN${NC}"
        echo -e "  API       : ${CYAN}https://$DOMAIN/api${NC}"
        echo -e "  Swagger   : ${CYAN}https://$DOMAIN/api-docs${NC}"
    fi
    echo ""
    echo -e "  Admin Key : ${YELLOW}$ADMIN_API_KEY${NC}"
    echo ""
    echo -e "  PM2 Durum : ${CYAN}pm2 status${NC}"
    echo -e "  Loglar    : ${CYAN}pm2 logs${NC}"
    echo -e "  Restart   : ${CYAN}pm2 restart all${NC}"
    echo ""
    
    press_enter
    show_main_menu
}

install_backend_only() {
    check_root
    print_banner
    
    wizard_domain
    wizard_database
    wizard_features
    wizard_pm2
    wizard_admin
    wizard_summary
    
    install_system_packages
    install_nodejs
    install_pm2
    install_nginx
    install_redis
    install_certbot
    
    setup_directories
    create_backend_env
    build_backend
    setup_database
    
    # Sadece backend PM2
    pm2 delete sesli-kitap-api 2>/dev/null || true
    cd "$BACKEND_DIR"
    pm2 start dist/app.js --name sesli-kitap-api -i max
    pm2 save
    
    log_success "Backend kurulumu tamamlandı!"
    press_enter
    show_main_menu
}

install_webapp_only() {
    check_root
    print_banner
    
    wizard_domain
    wizard_features
    wizard_pm2
    
    BACKEND_PORT="3001"  # Varsayilan
    
    cat > "$WEBAPP_DIR/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT/api
EOF
    
    wizard_summary
    
    install_system_packages
    install_nodejs
    install_pm2
    install_nginx
    
    build_webapp
    
    # Sadece web PM2
    pm2 delete sesli-kitap-web 2>/dev/null || true
    cd "$WEBAPP_DIR"
    pm2 start npm --name sesli-kitap-web -i max -- start
    pm2 save
    
    log_success "Web App kurulumu tamamlandı!"
    press_enter
    show_main_menu
}

# ===========================================
# KOMUT SATIRI ISLEMLERI
# ===========================================

case "$1" in
    install)
        install_full
        ;;
    update)
        case "$2" in
            backend) check_root; load_config; build_backend; pm2 restart sesli-kitap-api ;;
            web) check_root; load_config; build_webapp; pm2 restart sesli-kitap-web ;;
            *) check_root; load_config; update_all ;;
        esac
        ;;
    backup)
        load_config
        do_backup
        ;;
    restore)
        load_config
        do_restore
        ;;
    rollback)
        load_config
        do_rollback
        ;;
    status)
        load_config
        show_status
        ;;
    logs)
        case "$2" in
            backend) pm2 logs sesli-kitap-api --lines 100 ;;
            web) pm2 logs sesli-kitap-web --lines 100 ;;
            nginx) tail -100 /var/log/nginx/error.log ;;
            *) pm2 logs --lines 100 ;;
        esac
        ;;
    restart)
        case "$2" in
            backend) pm2 restart sesli-kitap-api ;;
            web) pm2 restart sesli-kitap-web ;;
            nginx) systemctl restart nginx ;;
            *) pm2 restart all; systemctl restart nginx ;;
        esac
        ;;
    ssl)
        certbot renew
        systemctl restart nginx
        ;;
    monitor)
        pm2 monit
        ;;
    config)
        ${EDITOR:-nano} "$CONFIG_FILE"
        ;;
    uninstall)
        check_root
        if confirm "TÜM KURULUM SİLİNECEK! Emin misiniz?" "n"; then
            pm2 delete all
            pm2 kill
            rm -f /etc/nginx/sites-enabled/sesli-kitap
            rm -f /etc/nginx/sites-available/sesli-kitap
            systemctl restart nginx
            rm -f "$CONFIG_FILE"
            log_success "Kurulum kaldırıldı"
        fi
        ;;
    help|--help|-h)
        echo ""
        echo "Kullanım: $0 [komut] [seçenek]"
        echo ""
        echo "Komutlar:"
        echo "  install           İnteraktif tam kurulum"
        echo "  update [app]      Güncelleme (backend|web|tümü)"
        echo "  backup            Manuel yedekleme"
        echo "  restore           Yedekten geri yükle"
        echo "  rollback          Önceki sürüme dön"
        echo "  status            Sistem durumu"
        echo "  logs [app]        Log görüntüle (backend|web|nginx)"
        echo "  restart [app]     Yeniden başlat (backend|web|nginx)"
        echo "  ssl               SSL sertifikası yenile"
        echo "  monitor           Canlı monitoring"
        echo "  config            Yapılandırmayı düzenle"
        echo "  uninstall         Kurulumu kaldır"
        echo ""
        echo "Parametresiz çalıştırma interaktif menüyü açar."
        echo ""
        ;;
    *)
        # Parametresiz - interaktif menu
        if load_config; then
            show_main_menu
        else
            check_root
            show_main_menu
        fi
        ;;
esac

exit 0
