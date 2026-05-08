import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Şarjup",
  description:
    "Şarjup akıllı şarj cihazı kiralama hizmetine ilişkin mesafeli satış sözleşmesi.",
};

export default function MesafeliSatisPage() {
  return (
    <LegalLayout
      badge="YASAL"
      pageTitle="Mesafeli Satış Sözleşmesi"
      pageSubtitle="Şarjup akıllı şarj cihazı kiralama hizmetine ilişkin mesafeli hizmet sözleşmesi."
      lastUpdated="7 Mayıs 2026"
      sections={[
        {
          id: "taraflar",
          title: "1. Taraflar",
          content: (
            <>
              <p><strong>Hizmet Sağlayıcı (Satıcı):</strong></p>
              <ul>
                <li>Ad Soyad: Bora Demirkan</li>
                <li>Ticaret Unvanı: Şarjup</li>
                <li>Adres: Kemalpaşa Mah. Cumhuriyet Blv. Dündar Rorf İş Merk No:76 İç Kapı No:116 İzmit / Kocaeli</li>
                <li>Vergi Kimlik No: 2870431990</li>
                <li>E-posta: info@sarjup.com.tr</li>
                <li>Telefon: 0540 366 41 41</li>
                <li>Web: sarjup.com.tr</li>
              </ul>
              <p><strong>Alıcı (Müşteri):</strong></p>
              <p>
                Hizmet başvurusu sırasında kimlik, iletişim ve fatura bilgilerini sisteme kaydeden gerçek veya tüzel kişi.
              </p>
            </>
          ),
        },
        {
          id: "konu",
          title: "2. Sözleşmenin Konusu",
          content: (
            <>
              <p>
                İşbu Mesafeli Hizmet Sözleşmesi; Alıcı&apos;nın Şarjup web sitesi (sarjup.com.tr) veya mobil uygulaması üzerinden
                talep ettiği akıllı telefon şarj cihazı kiralama hizmetinin kapsam, koşul ve bedelini düzenler.
              </p>
              <p>
                Hizmet; Satıcı&apos;ya ait NFC destekli akıllı şarj cihazlarının Alıcı&apos;nın işletme adresine kurulumunu,
                teknik desteği ve bakımını kapsar.
              </p>
            </>
          ),
        },
        {
          id: "hizmet-bedeli",
          title: "3. Hizmet Bedeli ve Ödeme",
          content: (
            <>
              <p>
                Hizmet bedeli, seçilen cihaz adedi ve kira süresi ile <strong>sarjup.com.tr/fiyatlandirma</strong> sayfasında
                belirtilen güncel tarifeye göre belirlenir.
              </p>
              <ul>
                <li>Aylık kiralama: 1.200 ₺ / cihaz (+ KDV)</li>
                <li>3–12 aylık kampanyalarda fiyatlandırma sayfasındaki indirimli tarifeler geçerlidir.</li>
                <li>3–5 cihaz için cihaz başı 100 ₺, 6–9 cihaz için cihaz başı 200 ₺ indirim uygulanır.</li>
                <li>Kurulum ücreti alınmaz.</li>
              </ul>
              <p>
                Ödeme; kredi/banka kartı (iyzico güvenli ödeme altyapısı) veya FAST/havale yöntemiyle yapılır.
                Ödeme tamamlandıktan sonra NFC aktivasyonu gerçekleştirilir.
              </p>
            </>
          ),
        },
        {
          id: "teslimat-aktivasyon",
          title: "4. Teslimat ve Aktivasyon",
          content: (
            <>
              <p>
                Akıllı şarj cihazları Şarjup ekibi tarafından Alıcı&apos;nın belirlediği işletme adresine kurulur.
                Kurulum randevusu ödeme onayından sonra en geç <strong>3 iş günü</strong> içinde planlanır.
              </p>
              <p>
                Cihaz aktivasyonu NFC teknolojisi ile gerçekleştirilir. Ödeme sonrasında Şarjup uygulaması üzerinden
                aktivasyon ekranına erişilir; şirket telefonu cihaza yaklaştırılarak hizmet süresi uzatılır.
              </p>
            </>
          ),
        },
        {
          id: "cayma-hakki",
          title: "5. Cayma Hakkı",
          content: (
            <>
              <p>
                6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 49. maddesi ve Mesafeli Sözleşmeler Yönetmeliği
                kapsamında Alıcı, sözleşmenin kurulduğu tarihten itibaren <strong>14 gün</strong> içinde herhangi bir
                gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir.
              </p>
              <p>
                Ancak cihaz kurulumu ve hizmet aktivasyonu tamamlanmış ise, Alıcı&apos;nın açık onayıyla ifaya başlanmış
                hizmetlerde cayma hakkı kullanılamaz (Yönetmelik Madde 15/1-ğ).
              </p>
              <p>
                Cayma bildiriminin <strong>info@sarjup.com.tr</strong> adresine yazılı olarak iletilmesi yeterlidir.
              </p>
            </>
          ),
        },
        {
          id: "sozlesme-suresi",
          title: "6. Sözleşme Süresi ve Fesih",
          content: (
            <>
              <p>
                Sözleşme, seçilen kira süresi boyunca geçerlidir. Minimum bağlılık süresi yoktur; aylık kiralama
                seçeneğinde Alıcı her dönem sonunda yenileme yapmama hakkına sahiptir.
              </p>
              <p>
                Alıcı sözleşmeyi feshetmek istediğinde, o dönemin kira bedelini ödemek kaydıyla hizmet sonlandırılır
                ve cihaz Şarjup ekibince geri alınır.
              </p>
              <p>
                Satıcı; ödeme yapılmaması, cihazın hasara uğratılması veya sözleşme ihlali durumunda sözleşmeyi
                tek taraflı feshedebilir.
              </p>
            </>
          ),
        },
        {
          id: "garanti-destek",
          title: "7. Garanti ve Teknik Destek",
          content: (
            <>
              <p>
                Kira süresi boyunca cihazın normal kullanımdan kaynaklanan arıza ve bakımı Şarjup tarafından
                ücretsiz karşılanır. Kasıt veya ihmal sonucu oluşan hasarlar Alıcı sorumluluğundadır.
              </p>
              <p>
                Teknik destek için: <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a> veya{" "}
                <a href="tel:+905403664141">0540 366 41 41</a>
              </p>
            </>
          ),
        },
        {
          id: "uyusmazlik",
          title: "8. Uyuşmazlık Çözümü",
          content: (
            <>
              <p>
                İşbu sözleşmeden doğan uyuşmazlıklarda Türk hukuku uygulanır. Tüketici, Tüketici Hakem Heyetlerine
                veya Tüketici Mahkemelerine başvurabilir.
              </p>
              <p>
                Tüketici başvuruları için <strong>Kocaeli</strong> Tüketici Hakem Heyeti yetkilidir.
              </p>
            </>
          ),
        },
        {
          id: "yururluk",
          title: "9. Yürürlük",
          content: (
            <>
              <p>
                Alıcı&apos;nın ödeme işlemini onaylaması ile işbu sözleşmeyi okuduğunu, anladığını ve tüm hükümlerini
                kabul ettiğini beyan eder. Sözleşme onay tarihinde yürürlüğe girer.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
