import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oynatma ve Kontroller",
  description: "Sesli kitap bölümlerini webde nasıl oynatırsınız? Oynat, duraklat ve ses ayarları.",
};

export default function OynatmaPage() {
  return (
    <>
      <InnerPageHero
        eyebrow="Kontroller"
        title="Oynatma"
        description="Kitap detay sayfasındaki bölüm listesinde her satırda tarayıcının ses oynatıcısı bulunur."
      />

      <div className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ContentCard
              title="Temel kontroller"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              }
              accent
            >
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "20px" }}>
                <li>
                  <strong style={{ color: "var(--ink)" }}>Oynat / Duraklat:</strong>{" "}
                  Oynatıcının solundaki düğme ile başlatıp durdurursunuz.
                </li>
                <li>
                  <strong style={{ color: "var(--ink)" }}>İlerleme çubuğu:</strong>{" "}
                  Kaydırarak bölüm içinde istediğiniz ana atlarsınız (tarayıcıya bağlıdır).
                </li>
                <li>
                  <strong style={{ color: "var(--ink)" }}>Ses seviyesi:</strong>{" "}
                  Sistem sesi veya oynatıcı üzerindeki ses kaydırıcısı ile ayarlayın.
                </li>
              </ul>
            </ContentCard>

            <ContentCard
              title="Tarayıcı ve cihaz"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            >
              <p>
                Bazı tarayıcılar otomatik oynatmayı kısıtlar; ilk kez oynatırken sayfaya
                tıklamanız gerekebilir. iOS Safari ve Chrome mobilde kontroller ekranın
                altına yakın görünebilir.
              </p>
              <p style={{ marginTop: "10px" }}>
                Uzun süreli ve arka planda dinleme için{" "}
                <strong style={{ color: "var(--ink)" }}>Wirbooks mobil uygulaması</strong> daha uygundur.
              </p>
            </ContentCard>

            <ContentCard
              title="Sorun giderme"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            >
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "20px" }}>
                <li>Ses yoksa cihazın sessiz modunu ve medya sesini kontrol edin.</li>
                <li>
                  Bölüm yüklenmiyorsa ağ bağlantınızı deneyin; gerekirse sayfayı yenileyin.
                </li>
                <li>
                  Dosya sunucuda yoksa &quot;Ses dosyası yok&quot; mesajı görünebilir;
                  yönetim panelinden içerik kontrol edilmelidir.
                </li>
              </ul>
            </ContentCard>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--ink-3)" }}>
              Genel dinleme önerileri için{" "}
              <Link href="/dinle" style={{ color: "#d0d0d0", fontWeight: "600" }}>
                Dinleme Rehberi
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
