import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Basın Kiti | Şarjup",
  description: "Şarjup basın kiti — logolar, görseller ve kurumsal bilgiler.",
};

export default function BasinPage() {
  return (
    <LegalLayout
      badge="BASIN"
      pageTitle="Basın Kiti"
      pageSubtitle="Şarjup hakkında haberler, logolar ve kurumsal bilgiler."
      lastUpdated="8 Mayıs 2026"
      sections={[
        {
          id: "hakkinda",
          title: "Şarjup Hakkında",
          content: (
            <>
              <p>
                Şarjup, Türkiye&apos;de B2B akıllı telefon şarj cihazı kiralama hizmeti sunan bir teknoloji girişimidir.
                Kafe, restoran, otel, AVM ve havalimanı gibi işletmelere cihaz kiralayarak müşteri memnuniyetini
                artırma ve ek gelir elde etme imkânı sağlar.
              </p>
              <p>
                NFC ve QR tabanlı şarj sistemi ile güvenli ödeme altyapısını bir arada sunan Şarjup,
                2026 yılında Kocaeli&apos;nde kurulmuştur.
              </p>
            </>
          ),
        },
        {
          id: "kurumsal-bilgiler",
          title: "Kurumsal Bilgiler",
          content: (
            <>
              <ul>
                <li><strong>Ticari Unvan:</strong> Bora Demirkan (Şahıs İşletmesi)</li>
                <li><strong>Vergi No:</strong> 2870431990</li>
                <li><strong>Adres:</strong> Kemalpaşa Mah. Cumhuriyet Blv. Dündar Rorf İş Merk No:76 İç Kapı No:116, İzmit / Kocaeli</li>
                <li><strong>E-posta:</strong> basin@sarjup.com.tr</li>
                <li><strong>Web:</strong> sarjup.com.tr</li>
                <li><strong>Kuruluş:</strong> 2026</li>
              </ul>
            </>
          ),
        },
        {
          id: "logo-ve-gorseller",
          title: "Logo ve Görseller",
          content: (
            <>
              <p>
                Basın ve editoryal kullanım için Şarjup logo ve görsellerine erişmek için{" "}
                <a href="mailto:basin@sarjup.com.tr">basin@sarjup.com.tr</a> adresine ulaşın.
                Logo kullanımında marka yönergelerimize uyulması gerekmektedir.
              </p>
            </>
          ),
        },
        {
          id: "iletisim",
          title: "Basın İletişim",
          content: (
            <>
              <p>
                Röportaj, haber veya iş birliği talepleri için aşağıdaki kanallardan ulaşabilirsiniz:
              </p>
              <ul>
                <li><strong>E-posta:</strong> basin@sarjup.com.tr</li>
                <li><strong>Telefon:</strong> 0540 366 41 41</li>
              </ul>
            </>
          ),
        },
      ]}
    />
  );
}
