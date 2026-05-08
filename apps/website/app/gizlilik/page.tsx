import type { Metadata } from "next";
import { LegalLayout } from "@/components/sections/legal-layout";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Şarjup",
  description:
    "Şarjup'un gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında detaylar.",
};

export default function GizlilikPage() {
  return (
    <LegalLayout
      badge="GİZLİLİK POLİTİKASI"
      pageTitle="Gizlilik ve Veri Koruma"
      pageSubtitle="Web sitemizi ziyaret ederken ve hizmetlerimizi kullanırken kişisel verilerinizin nasıl işlendiği hakkında bilgi."
      lastUpdated="27 Nisan 2026"
      sections={[
        {
          id: "giris",
          title: "1. Giriş",
          content: (
            <>
              <p>
                Şarjup (&quot;biz&quot;, &quot;Şirket&quot;), kullanıcılarımızın ve müşterilerimizin kişisel verilerinin korunmasına
                büyük önem vermektedir. Bu Gizlilik Politikası, web sitemizi (sarjup.com.tr) ve hizmetlerimizi kullanırken
                kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.
              </p>
              <p>Web sitemizi kullanarak bu Gizlilik Politikası&apos;nı kabul etmiş olursunuz.</p>
            </>
          ),
        },
        {
          id: "topladigimiz",
          title: "2. Topladığımız Bilgiler",
          content: (
            <>
              <h3>Doğrudan Sağladığınız Bilgiler</h3>
              <ul>
                <li>İletişim formları ile ad, soyad, email, telefon</li>
                <li>İşletme bilgileri (kurumsal müşteriler için)</li>
                <li>WhatsApp, email, telefon iletişimlerinde paylaşılan bilgiler</li>
              </ul>
              <h3>Otomatik Toplanan Bilgiler</h3>
              <ul>
                <li>IP adresiniz ve genel konum bilginiz</li>
                <li>Tarayıcı tipi ve versiyonu</li>
                <li>Sayfa görüntüleme istatistikleri</li>
                <li>Çerezler ile toplanan oturum bilgileri</li>
              </ul>
            </>
          ),
        },
        {
          id: "kullanim",
          title: "3. Bilgilerin Kullanımı",
          content: (
            <>
              <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
              <ul>
                <li>Hizmetlerimizi sunmak ve iyileştirmek</li>
                <li>İletişim taleplerinize yanıt vermek</li>
                <li>Pazarlama ve bilgilendirme (açık rıza ile)</li>
                <li>Web sitesi performansını analiz etmek</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
                <li>Dolandırıcılık ve kötüye kullanımı önlemek</li>
              </ul>
            </>
          ),
        },
        {
          id: "cerezler",
          title: "4. Çerezler (Cookies)",
          content: (
            <>
              <p>
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerezler, web sitemizi ziyaret
                ettiğinizde tarayıcınıza kaydedilen küçük dosyalardır.
              </p>
              <h3>Kullandığımız Çerez Türleri</h3>
              <ul>
                <li>
                  <strong>Zorunlu Çerezler:</strong> Sitenin çalışması için gerekli
                </li>
                <li>
                  <strong>Performans Çerezleri:</strong> Site kullanım analizleri
                </li>
                <li>
                  <strong>İşlevsel Çerezler:</strong> Tema tercihleri vb.
                </li>
              </ul>
              <p>
                Tarayıcı ayarlarınızdan çerezleri kontrol edebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmak
                bazı site özelliklerini etkileyebilir.
              </p>
            </>
          ),
        },
        {
          id: "paylasim",
          title: "5. Bilgilerin Paylaşımı",
          content: (
            <>
              <p>Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:</p>
              <ul>
                <li>Açık rızanızın bulunması</li>
                <li>Yetkili İş Ortağımıza yönlendirme (sizden gelen talep üzerine)</li>
                <li>Hizmet sağlayıcılarımız (hosting, email, vb.)</li>
                <li>Yasal yükümlülükler kapsamında resmi makamlar</li>
              </ul>
              <p>Verilerinizi pazarlama amacıyla üçüncü taraflara satmayız.</p>
            </>
          ),
        },
        {
          id: "guvenlik-koruma",
          title: "6. Güvenlik",
          content: (
            <>
              <p>Verilerinizin güvenliği için endüstri standardı önlemler alıyoruz:</p>
              <ul>
                <li>SSL/TLS şifreleme ile güvenli iletişim</li>
                <li>Erişim kontrolü ve yetkilendirme</li>
                <li>Düzenli güvenlik testleri</li>
                <li>Veri yedekleme ve felaket kurtarma planları</li>
              </ul>
              <p>
                Ancak hiçbir internet veya elektronik depolama sistemi %100 güvenli değildir. Bu nedenle &quot;uygun&quot;
                güvenlik standartlarını sağlamak için çalışsak da mutlak güvenliği garanti edemeyiz.
              </p>
            </>
          ),
        },
        {
          id: "saklama",
          title: "7. Veri Saklama Süreleri",
          content: (
            <>
              <p>Kişisel verilerinizi yalnızca gerekli olduğu süre boyunca saklarız:</p>
              <ul>
                <li>İletişim formları: 2 yıl</li>
                <li>Müşteri kayıtları: Sözleşme süresi + 10 yıl (ticari mevzuat)</li>
                <li>Pazarlama tercihleri: Açık rıza süresince</li>
                <li>Web sitesi analitik verileri: 14 ay</li>
              </ul>
            </>
          ),
        },
        {
          id: "haklariniz-gizlilik",
          title: "8. Haklarınız",
          content: (
            <>
              <p>Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
              <ul>
                <li>Verilerinize erişim hakkı</li>
                <li>Düzeltme talep etme hakkı</li>
                <li>Silme talep etme hakkı</li>
                <li>İşlemeyi kısıtlama hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
                <li>İtiraz etme hakkı</li>
                <li>Pazarlama iletişimini durdurma hakkı</li>
              </ul>
              <p>
                Haklarınızı kullanmak için <a href="mailto:info@sarjup.com.tr">info@sarjup.com.tr</a> adresine başvurabilirsiniz.
              </p>
            </>
          ),
        },
        {
          id: "ucuncu-taraf",
          title: "9. Üçüncü Taraf Bağlantıları",
          content: (
            <>
              <p>
                Web sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir (örn. Instagram, WhatsApp). Bu sitelerin gizlilik
                politikalarından Şarjup sorumlu değildir. Bu siteleri ziyaret etmeden önce kendi gizlilik politikalarını
                incelemenizi öneririz.
              </p>
            </>
          ),
        },
        {
          id: "degisiklikler",
          title: "10. Politika Değişiklikleri",
          content: (
            <>
              <p>
                Bu Gizlilik Politikası&apos;nı zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayınlanacak ve
                &quot;Son güncelleme&quot; tarihi yenilenecektir. Önemli değişiklikler durumunda email veya site bildirimi ile haber
                verilir.
              </p>
              <p>Politikayı düzenli aralıklarla incelemenizi öneririz.</p>
            </>
          ),
        },
        {
          id: "iletisim-gizlilik",
          title: "11. İletişim",
          content: (
            <>
              <p>Bu Gizlilik Politikası ile ilgili sorularınız için bize ulaşabilirsiniz:</p>
              <p>
                <strong>Email:</strong> info@sarjup.com.tr
                <br />
                <strong>Telefon:</strong> 0540 366 41 41
                <br />
                <strong>Adres:</strong> Kocaeli / İzmit, Türkiye
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
