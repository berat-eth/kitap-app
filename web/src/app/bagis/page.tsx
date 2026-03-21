import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bağış",
  description: "Wirbooks sesli kitap platformunu destekleyin. Bağışlar içerik ve altyapıya katkı sağlar.",
};

export default function BagisPage() {
  return (
    <>
      <InnerPageHero
        eyebrow="Destek"
        title="Bağış Yap"
        description="Wirbooks'u sürdürülebilir kılmak için bağışlarınız içerik üretimi, barındırma ve geliştirmeye yardımcı olur."
      />

      <div className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ContentCard
              title="Bağışınız nereye gider?"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              accent
            >
              <p>
                Toplanan destekler{" "}
                <strong style={{ color: "var(--ink)" }}>altyapı</strong> (sunucu, depolama, trafik),{" "}
                <strong style={{ color: "var(--ink)" }}>yazılım</strong> geliştirme ve{" "}
                <strong style={{ color: "var(--ink)" }}>içerik</strong> süreçlerine kanalize edilir.
                Şeffaflık için ileride özet rapor paylaşımı hedeflenmektedir.
              </p>

              {/* Progress bars */}
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Altyapı & Sunucu", pct: 45 },
                  { label: "İçerik Üretimi", pct: 35 },
                  { label: "Yazılım Geliştirme", pct: 20 },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-2)" }}>{item.label}</span>
                      <span style={{ fontSize: "0.8rem", color: "#d0d0d0", fontWeight: "600" }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--surface-3)", borderRadius: "99px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${item.pct}%`,
                          background: "linear-gradient(90deg, #ffffff, #a0a0a0)",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard
              title="Nasıl bağış yapılır?"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              }
            >
              <p>
                Resmi ödeme bağlantıları (banka / kredi kartı / havale) tanımlandığında bu
                sayfada yayınlanacaktır. Şimdilik destek olmak için{" "}
                <a
                  href="mailto:destek@wirbooks.com.tr"
                  style={{ color: "#d0d0d0", fontWeight: "600" }}
                >
                  destek@wirbooks.com.tr
                </a>{" "}
                adresine e‑posta ile ulaşabilir veya sosyal kanallardan iletişime geçebilirsiniz.
              </p>
              <p
                style={{
                  marginTop: "12px",
                  padding: "12px 16px",
                  background: "var(--amber-soft)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.82rem",
                  color: "var(--ink-2)",
                  borderLeft: "3px solid rgba(255,255,255,0.2)",
                }}
              >
                Not: Gerçek IBAN veya ödeme sağlayıcı bilgileri yalnızca resmi duyurularla
                paylaşılmalıdır; güvenmediğiniz kaynaklardan gelen hesaplara para göndermeyin.
              </p>
            </ContentCard>

            {/* Thank you card */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--radius-lg)",
                padding: "40px 32px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
              position: "absolute",
              top: "-30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              height: "200px",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🙏</div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}
              >
                Teşekkürler
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-2)", marginBottom: "24px", maxWidth: "400px", marginInline: "auto" }}>
                Dinlediğiniz her kitap ve paylaştığınız her öneri de ayrı bir destektir.
              </p>
              <Link href="/kitaplar" className="btn btn-primary">
                Kataloğu Keşfet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
