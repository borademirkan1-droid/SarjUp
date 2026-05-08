import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Teslimat & İptal Koşulları | Şarjup",
  description:
    "Şarjup akıllı şarj cihazı kiralama hizmetinde kurulum, teslimat ve iptal koşulları.",
};

export default function TeslimatIadePage() {
  return (
    <LegalLayout
      badge="YASAL"
      pageTitle="Teslimat & İptal Koşulları"
      pageSubtitle="Şarjup cihaz kiralama hizmetinde kurulum süreci, hizmet aktivasyonu ve iptal/fesih koşulları."
      lastUpdated="7 Mayıs 2026"
      sections={[
        {
          id: "kurulum-teslimat",
          title: "1. Kurulum ve Teslimat",
          content: (
            <>
              <p>
                Şarjup akıllı şarj cihazları fiziksel bir ürün satışı değil, <strong>kiralama hizmeti</strong> kapsamında
                sunulmaktadır. Cihazlar, Şarjup ekibi tarafından Alıcı&apos;nın bildirdiği işletme adresine teslim edilir
                ve kurulur.
              </p>
              <ul>
                <li>Kurulum randevusu ödeme onayından sonra en geç <strong>3 iş günü</strong> içinde planlanır.</li>
                <li>Kurulum Şarjup personeli tarafından ücretsiz gerçekleştirilir.</li>
                <li>Kurulum süresi ortalama 30–60 dakikadır.</li>
                <li>Kurulum sonrası cihaz test edilir ve NFC aktivasyonu yapılır.</li>
              </ul>
            </>
          ),
        },
        {
          id: "hizmet-aktivasyonu",
          title: "2. Hizmet Aktivasyonu",
          content: (
            <>
              <p>
                Ödeme tamamlandıktan sonra hizmet aktivasyonu NFC teknolojisi ile gerçekleştirilir:
              </p>
              <ul>
                <li>Şarjup uygulaması üzerinden aktivasyon ekranı açılır.</li>
                <li>Şirket telefonu cihaza yaklaştırılır.</li>
                <li>Hizmet süresi anlık olarak güncellenir.</li>
                <li>Aktivasyon onayı SMS ve e-posta ile bildirilir.</li>
              </ul>
              <p>
                Kart ödemelerinde aktivasyon anında, FAST/havale yönteminde ödeme doğrulamasının ardından
                en geç <strong>1 iş günü</strong> içinde gerçekleştirilir.
              </p>
            </>
          ),
        },
        {
          id: "iptal-kosullari",
          title: "3. İptal Koşulları",
          content: (
            <>
              <p><strong>Kurulum öncesi iptal:</strong></p>
              <ul>
                <li>Ödeme yapıldıktan sonra kurulum gerçekleşmeden önce iptal talebinde bulunulursa ödeme tutarının tamamı iade edilir.</li>
                <li>İptal talebi <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a> adresine yazılı olarak iletilmelidir.</li>
              </ul>
              <p><strong>Kurulum sonrası iptal:</strong></p>
              <ul>
                <li>Hizmet aktive edildikten sonra cayma hakkı kullanılamaz (Mesafeli Sözleşmeler Yönetmeliği Madde 15/1-ğ).</li>
                <li>Dönem sonu fesih: Mevcut ödeme döneminin sona ermesiyle hizmet durdurulur, cihaz Şarjup tarafından geri alınır.</li>
                <li>Dönem ortası fesih: Kalan dönem ücreti iade edilmez.</li>
              </ul>
            </>
          ),
        },
        {
          id: "iade-kosullari",
          title: "4. İade Koşulları",
          content: (
            <>
              <p>
                Şarjup bir kiralama hizmetidir; cihazın mülkiyeti Şarjup&apos;a aittir. Alıcı cihazı iade etmez,
                hizmet sonunda Şarjup ekibi cihazı geri alır.
              </p>
              <ul>
                <li>Geri alma işlemi ücretsizdir.</li>
                <li>Cihaz normal kullanım dışında hasar görmüşse hasar bedeli Alıcı&apos;dan talep edilebilir.</li>
                <li>Geri alma randevusu fesih bildiriminden itibaren 5 iş günü içinde planlanır.</li>
              </ul>
            </>
          ),
        },
        {
          id: "odeme-iade",
          title: "5. Ödeme İadesi",
          content: (
            <>
              <p>İade hakkı doğan durumlarda:</p>
              <ul>
                <li><strong>Kredi kartı ödemeleri:</strong> İade, ödemenin yapıldığı karta en geç 7 iş günü içinde yansıtılır.</li>
                <li><strong>Banka havalesi / FAST ödemeleri:</strong> İade, Alıcı&apos;nın bildirdiği IBAN&apos;a en geç 5 iş günü içinde yapılır.</li>
              </ul>
              <p>
                İade talepleri için: <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a>
              </p>
            </>
          ),
        },
        {
          id: "hizmet-kesintisi",
          title: "6. Hizmet Kesintisi ve Arıza",
          content: (
            <>
              <p>
                Cihazdan kaynaklanan arıza veya teknik sorunlarda:
              </p>
              <ul>
                <li>Şarjup, bildirim tarihinden itibaren <strong>48 saat</strong> içinde müdahale eder.</li>
                <li>7 günü aşan kesintilerde ilgili süre kira bedelinden mahsup edilir.</li>
                <li>Müşteriden kaynaklanan arızalar (kırılma, su hasarı vb.) kapsam dışıdır.</li>
              </ul>
              <p>
                Arıza bildirimi: <a href="tel:+905403664141">0540 366 41 41</a> veya{" "}
                <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a>
              </p>
            </>
          ),
        },
        {
          id: "iletisim",
          title: "7. İletişim",
          content: (
            <>
              <p>Teslimat, kurulum veya iptal işlemleri için:</p>
              <p>
                <strong>E-posta:</strong> info@sarjup.com.tr<br />
                <strong>Telefon / WhatsApp:</strong> 0540 366 41 41<br />
                <strong>Adres:</strong> Kemalpaşa Mah. Cumhuriyet Blv. Dündar Rorf İş Merk No:76 İç Kapı No:116 İzmit / Kocaeli
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
