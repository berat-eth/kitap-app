import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dinleme Rehberi",
  description: "Wirbooks ile sesli kitap dinleme: katalog, bölümler, kalite ve mobil uygulama önerileri.",
};

export default function DinlePage() {
  return (
    <>
      <InnerPageHero
        eyebrow="Rehber"
        title="Nasıl Dinlenir?"
        description="Web üzerinden önizleme, mobil uygulamada kesintisiz dinleme ve kütüphanenizi düzenli kullanma ipuçları."
      />

      <div className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ContentCard
              title="Katalogdan kitaba geçin"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              }
              accent
            >
              <p>
                <Link href="/kitaplar" style={{ color: "#d0d0d0", fontWeight: "600" }}>
                  Katalog
                </Link>{" "}
                sayfasından arama ve filtrelerle kitap bulun. Bir kapağa tıklayarak kitap
                detayına gidin; burada süre, yazar ve bölüm listesini görürsünüz.
              </p>
              <p style={{ marginTop: "10px" }}>
                Tarayıcıda her bölümün yanındaki oynatıcı ile kısa önizleme yapabilirsiniz.
                Arka planda dinleme ve indirme için <strong style={{ color: "var(--ink)" }}>mobil uygulamayı</strong> kullanmanızı öneririz.
              </p>
            </ContentCard>

            <ContentCard
              title="Dinleme ortamı"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              }
            >
              <p>
                Net ses için kulaklık veya düşük gürültülü bir ortam tercih edin. Mobil
                veride yüksek kalite seçeneği daha fazla veri kullanır; Wi‑Fi veya sınırsız
                paketlerde rahatça açabilirsiniz.
              </p>
              <ul style={{ marginTop: "12px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Yürürken veya araç kullanırken dikkatinizi yolda tutun.</li>
                <li>Uzun süreli dinlemelerde ses seviyesini güvenli aralıkta tutun.</li>
              </ul>
            </ContentCard>

            <ContentCard
              title="İlerleme ve favoriler"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
            >
              <p>
                Tam dinleme deneyiminde ilerlemenizi kaydetmek, favorilere eklemek ve
                çevrimdışı dinlemek için uygulama içi hesap / cihaz özelliklerini kullanın.
                Web sitesi öncelikle keşif ve hızlı önizleme içindir.
              </p>
            </ContentCard>

            {/* CTA */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "0.9rem", color: "var(--ink-3)", marginBottom: "12px" }}>
                Oynatıcı düğmeleri ve tarayıcı ses kontrolleri için
              </p>
              <Link href="/oynatma" className="btn btn-primary" style={{ padding: "10px 24px" }}>
                Oynatma Rehberi
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
