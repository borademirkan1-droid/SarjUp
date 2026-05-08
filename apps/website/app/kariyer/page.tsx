import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Kariyer | Şarjup",
  description: "Şarjup'ta kariyer fırsatları. Akıllı şarj ekosistemini birlikte inşa edelim.",
};

export default function KariyerPage() {
  return (
    <LegalLayout
      badge="KARİYER"
      pageTitle="Şarjup'ta Kariyer"
      pageSubtitle="Modern işletmeler için akıllı şarj altyapısı kuran ekibimize katılın."
      lastUpdated="8 Mayıs 2026"
      sections={[
        {
          id: "hakkimizda",
          title: "Neden Şarjup?",
          content: (
            <>
              <p>
                Şarjup, Türkiye genelinde B2B akıllı telefon şarj cihazı kiralama ekosistemi kuruyoruz.
                Küçük ama hızlı büyüyen ekibimizde her çalışanın etkisi doğrudan görülür.
              </p>
              <ul>
                <li>Erken aşama startup — kararları sen şekillendir</li>
                <li>Uzaktan çalışma imkânı</li>
                <li>Rekabetçi maaş + hisse opsiyonu (early team)</li>
                <li>Teknoloji ve donanım bütçesi</li>
              </ul>
            </>
          ),
        },
        {
          id: "acik-pozisyonlar",
          title: "Açık Pozisyonlar",
          content: (
            <>
              <p>
                Şu an belirli bir ilan yayınlanmamıştır. Ancak her zaman yetenekli insanlarla tanışmak isteriz.
              </p>
              <p>
                Yazılım geliştirme, satış, operasyon veya pazarlama alanlarında kendinizi görmek istiyorsanız{" "}
                <strong>kariyer@sarjup.com.tr</strong> adresine CV&apos;nizi gönderin.
              </p>
              <ul>
                <li><strong>Full-Stack Geliştirici</strong> — Next.js, React Native, Supabase</li>
                <li><strong>Saha Satış Uzmanı</strong> — İstanbul, Ankara, İzmir</li>
                <li><strong>Operasyon Koordinatörü</strong> — Cihaz lojistiği ve partner yönetimi</li>
              </ul>
            </>
          ),
        },
        {
          id: "basvuru",
          title: "Başvuru",
          content: (
            <>
              <p>
                CV ve kısa bir tanıtım yazısıyla{" "}
                <a href="mailto:kariyer@sarjup.com.tr">kariyer@sarjup.com.tr</a> adresine yazın.
                Tüm başvurular 5 iş günü içinde yanıtlanır.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
