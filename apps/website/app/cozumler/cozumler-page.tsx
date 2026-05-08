"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Battery,
  Cpu,
  Shield,
  ThermometerSun,
  CreditCard,
  Volume2,
  Smartphone,
  ArrowRight,
  Coffee,
  Wine,
  Hotel,
  Waves,
  Building,
  Music,
  TrendingUp,
} from "lucide-react";
import { Reveal } from "@/components/animations/reveal";

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-base font-medium uppercase tracking-[0.3em] text-emerald-400">
      <span className="h-px w-12 bg-emerald-400" />
      {text}
    </span>
  );
}

const audienceCards = [
  {
    icon: Coffee,
    title: "Kafe & Restoran",
    description: "Müşteri masada kalır, ek sipariş verir.",
  },
  {
    icon: Wine,
    title: "Bar & Lounge",
    description: "Müşteri sosyalleşirken cihazı şarjda.",
  },
  {
    icon: Music,
    title: "Meyhane",
    description: "Uzun masalar, uzun gece, sürekli güç.",
  },
  {
    icon: Waves,
    title: "Beach Club",
    description: "Plajda telefon güvende, müşteri rahat.",
  },
  {
    icon: Hotel,
    title: "Otel & Dinlenme Tesisi",
    description: "Misafirlere premium hizmet katmanı.",
  },
  {
    icon: Building,
    title: "Diğer İşletmeler",
    description: "Müşteri trafiği olan her yerde uygun.",
  },
];

const steps = [
  {
    no: "01",
    title: "Müşteri Şarj Cihazı İster",
    description:
      "Müşteri masaya oturur, telefonunun şarjı bittiğinde garsona şarj cihazı talep eder.",
  },
  {
    no: "02",
    title: "Yetkili Cihazı Hazırlar",
    description:
      "Yetkili personel Şarjup standından cihazı alır ve müşterinin masasına götürür.",
  },
  {
    no: "03",
    title: "NFC Kart ile Aktivasyon",
    description:
      "Yetkili, RFID kartını cihazın okuyucusuna yaklaştırır. Cihaz aktive olur ve 30 dakikalık süre başlar. LED ve buzzer ile onay verilir.",
  },
  {
    no: "04",
    title: "Müşteri Telefonunu Şarj Eder",
    description:
      "USB-C hızlı şarj 3.0 ile telefon güvenli şekilde dolar. Müşteri masada kalır, sosyalleşmeye devam eder. İsterse yetkiliden ek 30 dakika talep edebilir.",
  },
  {
    no: "05",
    title: "Süre Sonunda Geri Teslim",
    description:
      "Süre bittiğinde buzzer uyarı verir. Yetkili cihazı standa geri koyar. Tüm işlem panel üzerinden takip edilir.",
  },
];

const features = [
  {
    icon: Battery,
    title: "20.000 mAh Yüksek Kapasite",
    description: "Bir cihazla onlarca telefon. Uzun ömürlü, güvenilir batarya teknolojisi.",
    className: "lg:col-span-2",
    accent: "text-cyan-400",
    extra: (
      <div className="mt-5 h-2.5 rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
          initial={{ width: "20%" }}
          whileInView={{ width: "92%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </div>
    ),
  },
  { icon: Zap, title: "USB-C 3.0", description: "Hızlı şarj. 30 dakikada anlamlı kapasite.", accent: "text-emerald-400" },
  { icon: Smartphone, title: "NFC", description: "Saniyeler içinde başlat.", accent: "text-cyan-400" },
  { icon: Cpu, title: "LED", description: "Anında durum kontrol.", accent: "text-emerald-400" },
  {
    icon: CreditCard,
    title: "Akıllı Kart Sistemi",
    description: "İki farklı RFID kart ile tam kontrol:",
    className: "lg:col-span-2",
    accent: "text-cyan-400",
    extra: (
      <ul className="mt-4 space-y-2 text-sm text-white/65">
        <li>• 30 dakika aktivasyon kartı</li>
        <li>• Süre yenileme kartı</li>
        <li>• Yetkilendirilmiş kullanım</li>
      </ul>
    ),
  },
  { icon: ThermometerSun, title: "Isı Sensörü", description: "Aşırı ısınmaya karşı otomatik koruma.", accent: "text-emerald-400" },
  { icon: Shield, title: "Güvenlik Sensörleri", description: "Çoklu güvenlik katmanı.", accent: "text-cyan-400" },
  { icon: Volume2, title: "Buzzer", description: "Süre bitiminde sesli bildirim.", accent: "text-emerald-400" },
];

const specs = [
  ["Batarya", "20.000 mAh"],
  ["Şarj Standardı", "USB-C 3.0"],
  ["Aktivasyon", "NFC + RFID"],
  ["Süre Yönetimi", "30 dk + yenileme"],
  ["Güvenlik", "Isı + Çoklu sensör"],
  ["Gösterge", "LED durum + Buzzer"],
  ["Tasarım", "Modern masaüstü"],
  ["Yönetim", "Web panel + Mobile app"],
];

const advantages = [
  {
    icon: Smartphone,
    title: "Müşteri Memnuniyeti",
    description:
      "Müşteriniz telefonunu yanından ayırmadan, güvenle şarj edebilir. Kişisel cihaz, kişisel kontrol.",
    className: "from-cyan-500/10 to-transparent",
  },
  {
    icon: TrendingUp,
    title: "Yeni Gelir Kapısı",
    description:
      "Müşteri masada kaldıkça ek sipariş, ek içecek, ek satış. Şarj hizmetinin kendisi de değer yaratır.",
    className: "from-emerald-500/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Sıfır Risk",
    description:
      "Emanet sorumluluğu yok. Cihaz hasar/kayıp riski yok. Yasal yükümlülük yok. Tamamen otonom sistem.",
    className: "from-cyan-500/10 via-emerald-500/10 to-transparent",
  },
];

export function CozumlerPage() {
  return (
    <main className="relative overflow-x-hidden text-white">
      <section className="bg-transparent px-4 pt-32 md:px-8">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center">
          <div className="w-full">
            <Reveal>
              <SectionLabel text="Çözümler" />
            </Reveal>
            <div className="mt-6 space-y-1">
              {["Akıllı", "şarj", "çözümü."].map((line, idx) => (
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
            <Reveal delay={0.45} className="mt-8 max-w-[600px] text-xl leading-relaxed text-white/60">
              Modern işletmelerin müşterilerine güvenli, otonom ve premium şarj deneyimi sunabilmesi için tasarlandı.
              20.000 mAh güç. NFC kontrol. Sıfır risk.
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Hedef Kitle" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Her işletmenin
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">yeni standardı.</span>
            </h2>
            <p className="mt-8 max-w-[640px] text-lg text-white/60">
              Müşterinize premium deneyim sunmak istediğiniz her yerde Şarjup yanınızda.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {audienceCards.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delay={i * 0.07}
                  className="min-h-[200px] rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <Icon className="mb-4 h-8 w-8 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Nasıl Çalışır" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">5 saniyede</span>
              <br />
              şarj başlar.
            </h2>
          </Reveal>

          <div className="mt-16 space-y-8">
            {steps.map((step, i) => (
              <Reveal key={step.no} delay={i * 0.08} className="relative flex gap-6">
                <div className="relative flex w-16 flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400/60 bg-cyan-400/5 font-mono text-2xl font-extralight">
                    {step.no}
                  </div>
                  {i < steps.length - 1 ? <div className="mt-2 h-full w-0.5 bg-gradient-to-b from-cyan-400/40 to-emerald-400/40" /> : null}
                </div>
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
                  <h3 className="text-2xl font-medium text-white">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Özellikler" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Premium teknoloji.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Sade kullanım.</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal
                  key={feature.title}
                  delay={i * 0.06}
                  className={`rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.16)] ${feature.className ?? ""}`}
                >
                  <Icon className={`h-8 w-8 ${feature.accent}`} />
                  <h3 className="mt-5 text-xl font-medium">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{feature.description}</p>
                  {feature.extra}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Şarjup Pro" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">Detaylar fark yaratır.</h2>
          </Reveal>

          <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-8">
              <div className="absolute left-4 top-4 text-white/30">+</div>
              <div className="absolute right-4 top-4 text-white/30">+</div>
              <div className="absolute bottom-4 left-4 text-white/30">+</div>
              <div className="absolute bottom-4 right-4 text-white/30">+</div>

              <div className="relative flex h-full items-center justify-center">
                <motion.div
                  className="absolute h-40 w-40 rounded-full border border-cyan-300/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute h-56 w-56 rounded-full border border-emerald-300/25"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute h-72 w-72 rounded-full border border-cyan-200/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
                />
                <svg viewBox="0 0 200 200" className="h-48 w-48 text-cyan-300/90">
                  <motion.polygon
                    points="100,20 165,60 165,140 100,180 35,140 35,60"
                    fill="none"
                    stroke="url(#cozumGradient)"
                    strokeWidth="2.4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 58, ease: "linear", repeat: Infinity }}
                    style={{ transformOrigin: "50% 50%" }}
                  />
                  <defs>
                    <linearGradient id="cozumGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#00D4FF" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs tracking-[0.2em] text-white/70">
                SORA video gelecek
              </div>
            </Reveal>

            <Reveal delay={0.12} className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
              <h3 className="text-3xl font-light tracking-[-0.02em]">Teknik Özellikler</h3>
              <div className="mt-8 divide-y divide-white/10">
                {specs.map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">{key}</span>
                    <span className="text-sm font-medium text-white">{val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Avantajlar" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              İşletmeniz için
              <br />3 önemli kazanç.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {advantages.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delay={i * 0.1}
                  className={`min-h-[320px] rounded-[32px] border border-white/10 bg-gradient-to-br ${item.className} p-10 transition-transform duration-300 hover:scale-[1.02]`}
                >
                  <Icon className="h-16 w-16 text-cyan-300" />
                  <h3 className="mt-7 text-[28px] font-normal">{item.title}</h3>
                  <p className="mt-4 text-base leading-7 text-white/70">{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1000px] text-center">
          <Reveal>
            <SectionLabel text="Çözümünüzü Konuşalım" />
            <h2 className="mt-6 text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-[-0.04em]">
              Çözümünüzü
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                birlikte tasarlayalım.
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-[600px] text-lg text-white/60">
              Her işletmenin ihtiyacı farklı. Sizin için en uygun çözümü konuşmak için bize ulaşın.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/iletisim"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-10 text-base font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
            >
              Bize Ulaşın
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/partnerler"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 px-10 text-base font-medium text-white transition-colors duration-300 hover:bg-white/10"
            >
              Partner Ol
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
