import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dinleme rehberi",
  description:
    "Wirbooks ile sesli kitap dinleme: katalog, bölümler, kalite ve mobil uygulama önerileri.",
};

export default function DinlePage() {
  return (
    <main className="relative z-[1] mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <InnerPageHero
        title="Nasıl dinlenir?"
        description="Web üzerinden önizleme, mobil uygulamada kesintisiz dinleme ve kütüphanenizi düzenli kullanma ipuçları."
      />

      <div className="space-y-8">
        <ContentCard title="Katalogdan kitaba geçin" id="baslangic">
          <p>
            <Link
              href="/kitaplar"
              className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Katalog
            </Link>{" "}
            sayfasından arama ve filtrelerle kitap bulun. Bir kapağa tıklayarak kitap
            detayına gidin; burada süre, yazar ve bölüm listesini görürsünüz.
          </p>
          <p>
            Tarayıcıda her bölümün yanındaki oynatıcı ile kısa önizleme yapabilirsiniz.
            Arka planda dinleme ve indirme için{" "}
            <strong>mobil uygulamayı</strong> kullanmanızı öneririz.
          </p>
        </ContentCard>

        <ContentCard title="Dinleme ortamı" id="ortam">
          <p>
            Net ses için kulaklık veya düşük gürültülü bir ortam tercih edin. Mobil
            veride yüksek kalite seçeneği daha fazla veri kullanır; Wi‑Fi veya sınırsız
            paketlerde rahatça açabilirsiniz.
          </p>
          <ul>
            <li>Yürürken veya araç kullanırken dikkatinizi yolda tutun.</li>
            <li>Uzun süreli dinlemelerde ses seviyesini güvenli aralıkta tutun.</li>
          </ul>
        </ContentCard>

        <ContentCard title="İlerleme ve favoriler" id="ilerleme">
          <p>
            Tam dinleme deneyiminde ilerlemenizi kaydetmek, favorilere eklemek ve
            çevrimdışı dinlemek için uygulama içi hesap / cihaz özelliklerini kullanın.
            Web sitesi öncelikle keşif ve hızlı önizleme içindir.
          </p>
        </ContentCard>

        <div className="rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--surface)] p-6 text-center md:p-8">
          <p className="text-sm text-[var(--muted)]">
            Oynatıcı düğmeleri ve tarayıcı ses kontrolleri için
          </p>
          <Link
            href="/oynatma"
            className="mt-2 inline-block font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Oynatma sayfasına gidin →
          </Link>
        </div>
      </div>
    </main>
  );
}
