"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  MapPin,
  Users,
  Award,
  MessageCircle,
  ArrowRight,
  Handshake,
  Target,
  ChevronDown,
  Check,
} from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { TurkeyMap } from "@/components/animations/turkey-map";
import { networkStats } from "@/lib/data/partners";
import { useState } from "react";

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-base font-medium uppercase tracking-[0.3em] text-emerald-400">
      <span className="h-px w-12 bg-emerald-400" />
      {text}
    </span>
  );
}

const gains = [
  {
    icon: MapPin,
    color: "text-cyan-400",
    title: "Bölgenizin Yetkili Temsilcisi",
    description:
      "Belirlenen şehir/bölgede Şarjup'un tek temsilcisi siz olursunuz. Pazar payınızı koruma altına alın.",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400",
    title: "Tekrar Eden Gelir Modeli",
    description: "İşletmelerle aylık abonelik bazlı çalışın. Her ay düzenli, sürdürülebilir gelir.",
  },
  {
    icon: Award,
    color: "text-cyan-400",
    title: "Tam Marka Desteği",
    description: "Pazarlama materyalleri, satış desteği, teknik eğitim. Şarjup ekibi her adımda yanınızda.",
  },
  {
    icon: Users,
    color: "text-emerald-400",
    title: "Büyüyen Network",
    description:
      "Türkiye genelindeki Yetkili İş Ortağı ağının parçası olun. Bilgi paylaşımı, ortak büyüme.",
  },
];

const steps = [
  {
    no: "01",
    icon: MessageCircle,
    title: "WhatsApp'tan Ulaşın",
    description:
      "Bizimle WhatsApp üzerinden iletişime geçin. İlgi alanınızı, bölgenizi ve mevcut deneyiminizi paylaşın.",
    duration: "5 dakika",
    color: "from-cyan-500/8 to-transparent",
  },
  {
    no: "02",
    icon: Users,
    title: "Karşılıklı Tanışma",
    description:
      "Programımızı, koşulları ve karşılıklı beklentileri detaylı görüşelim. Bölgeniz için fizibilite değerlendirmesi yapalım.",
    duration: "1-3 gün",
    color: "from-emerald-500/8 to-transparent",
  },
  {
    no: "03",
    icon: Award,
    title: "Yetkili İş Ortağı Olun",
    description:
      "Sözleşmeyi imzalayın, eğitiminizi alın, ilk cihazlarınızı teslim alın. Bölgenizde Şarjup'u temsil etmeye başlayın.",
    duration: "1 hafta",
    color: "from-cyan-500/8 via-emerald-500/8 to-transparent",
  },
];

const whyItems = [
  {
    no: "01",
    title: "Yenilikçi ürün",
    description: "20.000 mAh, NFC, RFID, akıllı sensörler. Sektörün en gelişmiş cihazı.",
  },
  {
    no: "02",
    title: "Büyüyen pazar",
    description:
      "Türkiye'nin gelişen kafe/restoran sektöründe premium hizmet talebi her geçen yıl artıyor.",
  },
  {
    no: "03",
    title: "Düşük rekabet",
    description:
      "B2B masaüstü şarj segmentinde organize oyuncu sayısı sınırlı. Erken giren, pazarı yakalar.",
  },
  {
    no: "04",
    title: "Tam destek",
    description: "Pazarlama, eğitim, teknik destek. Yalnız bırakmayız.",
  },
  {
    no: "05",
    title: "Ekosistem",
    description: "Web panel, mobil uygulama, otomatik yönetim. Cihazları idare etmeniz için her şey hazır.",
  },
];

const faqs = [
  {
    q: "Yetkili İş Ortağı olmak için hangi koşulları sağlamalıyım?",
    a: "Hedef sektörde (kafe/restoran/işletme) bağlantılarınızın bulunması, satış ya da bölge yönetimi deneyiminiz, girişimci bir ruhunuz olması idealdir. Detaylar için görüşmemizi bekliyoruz.",
  },
  {
    q: "Başlangıçta ne kadar sermaye gerekir?",
    a: "Bu konu görüşmemiz sonucunda netleşir. Pilot süreçte düşük başlangıç seçenekleri sunuyoruz. Önemli olan motivasyonunuz ve bölge potansiyelidir.",
  },
  {
    q: "Hangi bölgelerde Yetkili İş Ortağı arıyorsunuz?",
    a: "Şu anda Türkiye'nin tüm 81 ilinde başvuru kabul ediyoruz. İstanbul, Ankara, İzmir, Antalya gibi büyük şehirler önceliklidir ancak her şehirden değerli başvuru alıyoruz.",
  },
  {
    q: "Eğitim ve destek nasıl sağlanıyor?",
    a: "İmzanın ardından Şarjup ekibi tarafından kapsamlı bir eğitim programı uygulanır: ürün eğitimi, satış teknikleri, panel kullanımı, teknik destek. Ayrıca tüm süreçte yanınızdayız.",
  },
  {
    q: "Sözleşme ve gelir paylaşımı nasıl çalışıyor?",
    a: "Sözleşme detayları görüşmemiz sırasında paylaşılır. Şeffaf, sürdürülebilir ve karşılıklı kazanca dayalı bir model üzerinde çalışıyoruz.",
  },
];

export function PartnerlerPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative overflow-x-hidden text-white">
      <section className="bg-transparent px-4 pt-32 md:px-8">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center">
          <div className="w-full">
            <Reveal>
              <SectionLabel text="Yetkili İş Ortağı Programı" />
            </Reveal>

            <div className="mt-6 space-y-1">
              {["Şarjup", "Network'ünün", "parçası olun."].map((line, idx) => (
                <Reveal
                  key={line}
                  delay={idx * 0.15}
                  className={`text-[clamp(56px,9vw,128px)] font-extralight leading-[0.95] tracking-[-0.04em] ${
                    idx === 2 ? "bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent" : "text-white"
                  }`}
                >
                  {line}
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.45} className="mt-8 max-w-[700px] text-xl leading-relaxed text-white/60">
              Bölgenizde Şarjup&apos;u temsil eden Yetkili İş Ortağı&apos;mız olun. Modern işletmelere premium şarj çözümümüzü sunarken,
              büyüyen bir markanın parçası olun.
            </Reveal>

            <Reveal delay={0.6} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="https://wa.me/905403664141?text=Merhaba%2C%20%C5%9Earjup%20Yetkili%20%C4%B0%C5%9F%20Orta%C4%9F%C4%B1%20program%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                target="_blank"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-10 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_rgba(16,185,129,0.5)]"
              >
                WhatsApp&apos;tan Başvur
                <MessageCircle className="h-5 w-5" />
              </Link>
              <a
                href="#kazanimlar"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/30 px-10 text-base font-medium text-white transition-colors duration-300 hover:bg-white/10"
              >
                Detaylar
                <span>↓</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="kazanimlar" className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Kazanımlarınız" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Premium markanın
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">avantajları.</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            {gains.map((gain, i) => {
              const Icon = gain.icon;
              return (
                <Reveal
                  key={gain.title}
                  delay={i * 0.08}
                  className="min-h-[240px] rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <Icon className={`mb-6 h-12 w-12 ${gain.color}`} />
                  <h3 className="text-[22px] font-medium">{gain.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-white/65">{gain.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Başvuru Süreci" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              3 adımda
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Şarjup ailesine.</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal
                  key={step.no}
                  delay={i * 0.1}
                  className={`relative min-h-[320px] rounded-[32px] border border-white/10 bg-gradient-to-br ${step.color} p-10`}
                >
                  <span className="absolute right-6 top-6 font-mono text-[64px] font-extralight text-white/10">{step.no}</span>
                  <Icon className="mb-6 mt-6 h-12 w-12 text-emerald-400" />
                  <h3 className="text-2xl font-medium">{step.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-white/70">{step.description}</p>
                  <span className="mt-5 inline-flex rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] tracking-[0.1em] text-emerald-400">
                    {step.duration}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Reveal>
              <SectionLabel text="Neden Şarjup?" />
              <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
                Yatırım yapmaya değer
                <br />
                bir markaya katılın.
              </h2>
            </Reveal>

            <div className="mt-10 divide-y divide-white/5">
              {whyItems.map((item, i) => (
                <Reveal key={item.no} delay={i * 0.06} className="flex items-start gap-6 py-6">
                  <span className="w-10 font-mono text-3xl text-white/30">{item.no}</span>
                  <div>
                    <h3 className="text-2xl font-normal text-white">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-white/65">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15} className="relative aspect-[4/5] rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 p-8">
            <div className="absolute left-4 top-4 text-white/30">+</div>
            <div className="absolute right-4 top-4 text-white/30">+</div>
            <div className="absolute bottom-4 left-4 text-white/30">+</div>
            <div className="absolute bottom-4 right-4 text-white/30">+</div>
            <div className="flex h-full items-center justify-center">
              <motion.div
                className="absolute h-44 w-44 rounded-full border border-cyan-300/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute h-60 w-60 rounded-full border border-emerald-300/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
              />
              <svg viewBox="0 0 200 200" className="h-44 w-44">
                <motion.polygon
                  points="100,20 165,60 165,140 100,180 35,140 35,60"
                  fill="none"
                  stroke="url(#partnerGradient)"
                  strokeWidth="2.4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "50% 50%" }}
                />
                <defs>
                  <linearGradient id="partnerGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs tracking-[0.2em] text-white/70">
              SORA partner görseli buraya gelecek
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Aktif Bölgeler" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Türkiye&apos;de
              <br />
              hangi şehirler boşta?
            </h2>
            <p className="mt-8 max-w-[700px] text-lg text-white/60">
              Aşağıdaki haritada işaretlenmemiş şehirler hala bekleniyor. Bölgenizin Yetkili İş Ortağı siz olun.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 rounded-[32px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(0,20,40,0.4),rgba(0,0,0,0.6))] p-8 backdrop-blur-[20px] md:p-12 lg:grid-cols-[280px_1fr]">
            <Reveal className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">AÇIK BÖLGELER</p>
              <p className="mt-5 text-5xl font-light text-white">75+</p>
              <p className="text-sm text-white/60">İl (resmi)</p>
              <div className="my-6 h-px bg-white/10" />
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Partner Durumu</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {networkStats.totalPartners} aktif partner noktası
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <Target className="h-4 w-4 text-cyan-400" />
                İlk başvuran avantajı
              </p>
            </Reveal>

            <div className="mx-auto w-full max-w-[900px]">
              <TurkeyMap />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1200px] text-center">
          <Reveal>
            <SectionLabel text="Hemen Başlayın" />
            <h2 className="mt-6 text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-[-0.04em]">
              Bölgenizde
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                ilk Yetkili İş Ortağı olun.
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-[700px] text-lg text-white/65">
              Tek bir mesajla başlayın. Bölgenizde Şarjup network&apos;ünün ilk temsilcisi olabilirsiniz. WhatsApp üzerinden bize
              ulaşın, en kısa sürede dönüş yapalım.
            </p>
          </Reveal>

          <Reveal
            delay={0.12}
            className="mt-16 grid gap-8 rounded-[32px] border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 p-10 backdrop-blur-xl lg:grid-cols-[1fr_auto]"
          >
            <div className="text-left">
              <div className="inline-flex items-center gap-3 text-2xl font-medium text-white">
                <MessageCircle className="h-8 w-8 text-emerald-400" />
                WhatsApp ile başvurun
              </div>
              <p className="mt-3 text-white/70">Hızlı, kolay, anında geri dönüş</p>
              <p className="mt-4 text-lg text-white">0540 366 41 41</p>

              <div className="mt-8 space-y-2 text-sm text-white/60">
                <p className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> Bölge bilgisi alacağız
                </p>
                <p className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> İlk görüşme tamamen ücretsiz
                </p>
                <p className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> Hiçbir ön ödeme talep edilmez
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Link
                href="https://wa.me/905403664141?text=Merhaba%2C%20%C5%9Earjup%20%C4%B0%C5%9F%20Ortakl%C4%B1%C4%9F%C4%B1%20program%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.%20Bulundu%C4%9Fum%20%C5%9Fehir%3A%20%5B%C5%9Eehir%5D"
                target="_blank"
                className="inline-flex h-16 items-center justify-center gap-3 rounded-full bg-emerald-500 px-10 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_38px_rgba(16,185,129,0.55)]"
              >
                Hemen Mesaj Gönder
                <MessageCircle className="h-6 w-6" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1000px]">
          <Reveal className="text-center">
            <SectionLabel text="Sıkça Sorular" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">Aklınıza takılanlar.</h2>
          </Reveal>

          <div className="mt-14 space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <Reveal
                  key={faq.q}
                  delay={i * 0.05}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-colors hover:bg-white/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq((prev) => (prev === i ? null : i))}
                    className="flex w-full items-center justify-between text-left text-lg font-medium text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={isOpen ? { height: "auto", opacity: 1, marginTop: 16 } : { height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden text-[15px] leading-7 text-white/70"
                  >
                    {faq.a}
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
