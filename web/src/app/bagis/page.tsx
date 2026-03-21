import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bağış",
  description:
    "Wirbooks sesli kitap platformunu destekleyin. Bağışlar içerik ve altyapıya katkı sağlar.",
};

export default function BagisPage() {
  return (
    <main className="relative z-[1] mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <InnerPageHero
        title="Bağış"
        description="Wirbooks’u sürdürülebilir kılmak için bağışlarınız içerik üretimi, barındırma ve geliştirmeye yardımcı olur."
      />

      <div className="space-y-8">
        <ContentCard title="Bağışınız nereye gider?" id="nerede">
          <p>
            Toplanan destekler <strong>altyapı</strong> (sunucu, depolama, trafik),{" "}
            <strong>yazılım</strong> geliştirme ve <strong>içerik</strong> süreçlerine
            kanalize edilir. Şeffaflık için ileride özet rapor paylaşımı hedeflenmektedir.
          </p>
        </ContentCard>

        <ContentCard title="Nasıl bağış yapılır?" id="nasil">
          <p>
            Resmi ödeme bağlantıları (banka / kredi kartı / havale) tanımlandığında bu
            sayfada yayınlanacaktır. Şimdilik destek olmak için{" "}
            <a
              href="mailto:destek@wirbooks.com.tr"
              className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              destek@wirbooks.com.tr
            </a>{" "}
            adresine e‑posta ile ulaşabilir veya sosyal kanallardan iletişime
            geçebilirsiniz.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Not: Gerçek IBAN veya ödeme sağlayıcı bilgileri yalnızca resmi duyurularla
            paylaşılmalıdır; güvenmediğiniz kaynaklardan gelen hesaplara para
            göndermeyin.
          </p>
        </ContentCard>

        <div className="rounded-2xl border border-[var(--stroke)] bg-gradient-to-br from-teal-50/80 to-orange-50/40 p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="font-display text-lg font-semibold text-[var(--ink-bright)]">
            Teşekkürler
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Dinlediğiniz her kitap ve paylaştığınız her öneri de ayrı bir destektir.
          </p>
          <Link
            href="/kitaplar"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-14px_rgba(13,148,136,0.55)] transition-transform hover:-translate-y-0.5"
          >
            Kataloğu keşfet
          </Link>
        </div>
      </div>
    </main>
  );
}
