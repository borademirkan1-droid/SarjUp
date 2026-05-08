import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Şarjup",
  description: "Şarjup'un 6698 sayılı KVKK kapsamındaki aydınlatma metni. Kişisel verilerin işlenmesi, korunması ve haklarınız.",
};

export default function KVKKPage() {
  return (
    <LegalLayout
      badge="KVKK AYDINLATMA METNİ"
      pageTitle="Kişisel Verilerin Korunması"
      pageSubtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, kişisel verilerinizin işlenmesine ilişkin aydınlatma metni."
      lastUpdated="27 Nisan 2026"
      sections={[
        {
          id: "veri-sorumlusu",
          title: "1. Veri Sorumlusu",
          content: (
            <>
              <p>
                <strong>Veri Sorumlusu:</strong> Şarjup
              </p>
              <p>
                <strong>Adres:</strong> Kocaeli / İzmit, Türkiye
              </p>
              <p>
                <strong>İletişim:</strong> info@sarjup.com.tr
              </p>
              <p>
                <strong>Telefon:</strong> 0540 366 41 41
              </p>
              <p>
                Şarjup (&quot;Şirket&quot;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
                kişisel verilerinizin güvenliği konusundaki sorumluluğumuzun bilincindeyiz.
              </p>
            </>
          ),
        },
        {
          id: "islenen-veriler",
          title: "2. İşlenen Kişisel Veriler",
          content: (
            <>
              <p>Şirketimiz tarafından, sunduğumuz hizmetler kapsamında aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
              <h3>Kimlik Bilgileri</h3>
              <ul>
                <li>Ad, Soyad</li>
                <li>İşletme Adı (kurumsal müşteriler için)</li>
              </ul>
              <h3>İletişim Bilgileri</h3>
              <ul>
                <li>Telefon Numarası</li>
                <li>Email Adresi</li>
                <li>Adres / Şehir Bilgisi</li>
              </ul>
              <h3>İşletme Bilgileri (B2B Müşteriler İçin)</h3>
              <ul>
                <li>İşletme türü (kafe, restoran, vb.)</li>
                <li>Bölge / Konum</li>
              </ul>
              <h3>Teknik Bilgiler</h3>
              <ul>
                <li>IP Adresi</li>
                <li>Tarayıcı bilgileri</li>
                <li>Çerez bilgileri (web sitesi kullanımı sırasında)</li>
              </ul>
            </>
          ),
        },
        {
          id: "isleme-amaclari",
          title: "3. İşleme Amaçları",
          content: (
            <>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul>
                <li>İşletmenize uygun hizmet sunulması</li>
                <li>İletişim taleplerinize yanıt verilmesi</li>
                <li>Yetkili İş Ortağı başvurularının değerlendirilmesi</li>
                <li>Sözleşme süreçlerinin yürütülmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
                <li>Pazarlama ve tanıtım faaliyetleri (açık rıza ile)</li>
                <li>Müşteri memnuniyeti analizleri</li>
              </ul>
            </>
          ),
        },
        {
          id: "isleme-sebepleri",
          title: "4. Hukuki Sebepler",
          content: (
            <>
              <p>
                Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak
                işlenmektedir:
              </p>
              <ul>
                <li>Açık rızanızın bulunması</li>
                <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
                <li>Hukuki yükümlülüğün yerine getirilmesi</li>
                <li>Meşru menfaatler doğrultusunda işlenmesi</li>
                <li>Tarafınızca alenileştirilmiş olması</li>
              </ul>
            </>
          ),
        },
        {
          id: "aktarim",
          title: "5. Verilerin Aktarımı",
          content: (
            <>
              <p>
                Kişisel verileriniz, Kanun&apos;un 8. ve 9. maddelerinde belirtilen koşullara uygun olarak aşağıdaki taraflarla
                paylaşılabilir:
              </p>
              <ul>
                <li>Yetkili İş Ortaklarımız (bölgenizdeki temsilciler)</li>
                <li>Hizmet aldığımız altyapı sağlayıcıları (hosting, email)</li>
                <li>Yasal yükümlülükler kapsamında resmi kurumlar</li>
                <li>Hukuki destek alınan avukat ve danışmanlar</li>
              </ul>
              <p>Verileriniz açık rızanız olmaksızın yurt dışına aktarılmamaktadır.</p>
            </>
          ),
        },
        {
          id: "haklariniz",
          title: "6. Haklarınız",
          content: (
            <>
              <p>
                KVKK&apos;nın 11. maddesi uyarınca, kişisel verileriniz hakkında aşağıdaki haklara sahipsiniz:
              </p>
              <ul>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlendiğine dair bilgi talep etme</li>
                <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Verilerin aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                <li>Silme veya yok edilmesini isteme</li>
                <li>Düzeltme, silme ve yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>Otomatik sistemler ile analiz edilmesi sonucu aleyhinize çıkan sonuca itiraz etme</li>
                <li>Zarara uğramanız halinde tazminat talep etme</li>
              </ul>
              <p>
                Haklarınızı kullanmak için <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a> adresine yazılı
                başvurabilirsiniz.
              </p>
            </>
          ),
        },
        {
          id: "guvenlik",
          title: "7. Veri Güvenliği",
          content: (
            <>
              <p>Şarjup, kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirleri almaktadır:</p>
              <ul>
                <li>SSL sertifikalı güvenli iletişim</li>
                <li>Şifrelenmiş veri depolama</li>
                <li>Yetkilendirilmiş erişim kontrolü</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Personel KVKK eğitimleri</li>
              </ul>
            </>
          ),
        },
        {
          id: "iletisim",
          title: "8. İletişim",
          content: (
            <>
              <p>KVKK kapsamındaki tüm sorularınız ve haklarınızı kullanmak için bizimle iletişime geçebilirsiniz:</p>
              <p>
                <strong>Email:</strong> info@sarjup.com.tr
                <br />
                <strong>Telefon / WhatsApp:</strong> 0540 366 41 41
                <br />
                <strong>Adres:</strong> Kocaeli / İzmit, Türkiye
              </p>
              <p>Başvurularınız 30 gün içinde değerlendirilerek tarafınıza yanıtlanacaktır.</p>
            </>
          ),
        },
      ]}
    />
  );
}
