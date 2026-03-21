import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { InnerPageHero } from "@/components/inner-page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oynatma ve kontroller",
  description:
    "Sesli kitap bölümlerini webde nasıl oynatırsınız? Oynat, duraklat ve ses ayarları.",
};

export default function OynatmaPage() {
  return (
    <main className="relative z-[1] mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <InnerPageHero
        title="Oynatma"
        description="Kitap detay sayfasındaki bölüm listesinde her satırda tarayıcının ses oynatıcısı bulunur."
      />

      <div className="space-y-8">
        <ContentCard title="Temel kontroller" id="temel">
          <ul>
            <li>
              <strong>Oynat / Duraklat:</strong> Oynatıcının solundaki düğme ile
              başlatıp durdurursunuz.
            </li>
            <li>
              <strong>İlerleme çubuğu:</strong> Kaydırarak bölüm içinde istediğiniz
              ana atlarsınız (tarayıcıya bağlıdır).
            </li>
            <li>
              <strong>Ses seviyesi:</strong> Sistem sesi veya oynatıcı üzerindeki ses
              kaydırıcısı ile ayarlayın.
            </li>
          </ul>
        </ContentCard>

        <ContentCard title="Tarayıcı ve cihaz" id="tarayici">
          <p>
            Bazı tarayıcılar otomatik oynatmayı kısıtlar; ilk kez oynatırken sayfaya
            tıklamanız gerekebilir. iOS Safari ve Chrome mobilde kontroller ekranın
            altına yakın görünebilir.
          </p>
          <p>
            Uzun süreli ve arka planda dinleme için{" "}
            <strong>Wirbooks mobil uygulaması</strong> daha uygundur.
          </p>
        </ContentCard>

        <ContentCard title="Sorun giderme" id="sorun">
          <ul>
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

        <p className="text-center text-sm text-[var(--muted)]">
          Genel dinleme önerileri için{" "}
          <Link
            href="/dinle"
            className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Dinleme rehberi
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
