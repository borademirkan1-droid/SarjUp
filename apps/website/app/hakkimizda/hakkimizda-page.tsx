"use client";

import Link from "next/link";
import { ArrowRight, Award, Check, Lightbulb, Shield, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { useReveal } from "@/lib/hooks/use-reveal";
import { networkStats } from "@/lib/data/partners";

const values = [
  {
    icon: Shield,
    title: "Güven",
    color: "text-cyan-400",
    description:
      "Müşteriniz cihazını size emanet etmez. Şarjup masada, yanında kalır. Sıfır risk, sıfır sorumluluk.",
  },
  {
    icon: Lightbulb,
    title: "Yenilikçilik",
    color: "text-emerald-400",
    description:
      "NFC, akıllı yönetim, otonom çalışma. Sektörün standartlarını biz belirliyoruz, takip etmiyoruz.",
  },
  {
    icon: Award,
    title: "Kalite",
    color: "text-cyan-400",
    description:
      "20.000 mAh batarya, premium tasarım, uzun ömürlü altyapı. Hızlı kazanç değil, sürdürülebilir başarı için tasarlandı.",
  },
];

const stats = [
  {
    value: `${networkStats.totalPartners}+`,
    label: "Partner Mekan",
    description: "Aktif Şarjup partneri",
  },
  {
    value: `${networkStats.totalCities}`,
    label: "Şehir",
    description: "Türkiye geneli",
  },
  {
    value: `${networkStats.activePartners}`,
    label: "Aktif Hizmet",
    description: "Şu anda kullanımda",
  },
  {
    value: "∞",
    label: "Hedef",
    description: "Sınırsız büyüme",
  },
];

function SectionLabel({ text, colorClass = "bg-emerald-400" }: { text: string; colorClass?: string }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-base font-medium uppercase tracking-[0.3em] text-emerald-400">
      <span className={`h-px w-12 ${colorClass}`} />
      {text}
    </span>
  );
}

export function HakkimizdaPage() {
  const { ref: reasonRef } = useReveal({ threshold: 0.2 });

  return (
    <main className="relative overflow-x-hidden text-white">
        <section className="bg-transparent px-4 pt-32 md:px-8">
          <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center">
            <div className="w-full">
              <Reveal>
                <SectionLabel text="HAKKIMIZDA" />
              </Reveal>

              <div className="mt-6 space-y-1">
                {["Şarjı", "yeniden", "tasarlıyoruz."].map((line, index) => (
                  <Reveal
                    key={line}
                    delay={index * 0.15}
                    duration={0.8}
                    className={`text-[clamp(56px,9vw,128px)] font-extralight leading-[0.95] tracking-[-0.04em] ${
                      index === 2 ? "bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent" : "text-white"
                    }`}
                  >
                    {line}
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.45} className="mt-8 max-w-[600px] text-xl leading-relaxed text-white/60">
                Modern işletmelerin müşterilerine premium şarj deneyimi sunmaları için akıllı çözümler geliştiriyoruz.
              </Reveal>
            </div>
          </div>
        </section>

        <section ref={reasonRef} className="bg-transparent px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionLabel text="NEDEN ŞARJUP?" />
            </Reveal>

            <Reveal className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Çünkü artık her işletme,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                daha iyi bir deneyim sunmalı.
              </span>
            </Reveal>

            <div className="mt-16 grid gap-10 lg:grid-cols-2">
              <Reveal className="rounded-3xl border border-red-400/20 bg-black/20 p-8 backdrop-blur-sm">
                <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-red-400/80">PROBLEM</p>
                <h3 className="mt-6 text-3xl font-normal">Eski Sistem</h3>
                <div className="mt-8 space-y-4">
                  {[
                    "Müşteri telefonu emanete vermek istemiyor",
                    "İşletme için yüksek sorumluluk ve risk",
                    "Müşteri masadan ayrılınca ek sipariş kaybı",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4">
                      <AlertCircle className="mt-1 h-5 w-5 text-red-400" />
                      <p className="text-[15px] leading-relaxed text-white/70">{item}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1} className="rounded-3xl border border-emerald-400/20 bg-black/20 p-8 backdrop-blur-sm">
                <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-emerald-400">ÇÖZÜM</p>
                <h3 className="mt-6 text-3xl font-normal">Şarjup ile</h3>
                <div className="mt-8 space-y-4">
                  {[
                    "Cihaz müşterinin yanında masada kalır, güvende",
                    "Sıfır risk, sıfır sorumluluk - tamamen otonom sistem",
                    "Müşteri masada kalır, ek sipariş ve gelir",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4">
                      <Check className="mt-1 h-5 w-5 text-emerald-400" />
                      <p className="text-[15px] leading-relaxed text-white/70">{item}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="mx-auto mt-16 max-w-[800px] text-center text-lg leading-[1.7] text-white/80">
              Şarjup; modern işletmelerin müşterilerine güvenli, otonom ve premium bir şarj deneyimi sunabilmesi için tasarlandı.
              Hem işletme hem müşteri için yeni bir standart yaratıyoruz.
            </Reveal>
          </div>
        </section>

        <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-2">
            <Reveal className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent p-8 md:min-h-[320px] md:p-12">
              <SectionLabel text="VİZYONUMUZ" colorClass="bg-cyan-400" />
              <p className="mt-8 text-[clamp(22px,3vw,28px)] font-light leading-[1.4] text-white/90">
                Türkiye&apos;nin pazar lideri olmaktan başlayıp, uluslararası bir markaya dönüşerek dünyanın her yerindeki modern
                işletmeleri müşterilerine benzersiz bir deneyim sunabilmesi için donatmak.
              </p>
            </Reveal>

            <Reveal
              delay={0.12}
              className="rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-8 md:min-h-[320px] md:p-12"
            >
              <SectionLabel text="MİSYONUMUZ" colorClass="bg-emerald-400" />
              <p className="mt-8 text-[clamp(22px,3vw,28px)] font-light leading-[1.4] text-white/90">
                Her işletmenin müşterisine premium şarj deneyimi sunabilmesi için akıllı, güvenli ve otonom çözümler
                geliştiriyoruz. Şarjı bir problem olmaktan çıkarıyoruz.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal className="text-center">
              <SectionLabel text="DEĞERLERİMİZ" />
              <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">Üzerinde durduğumuz 3 ilke.</h2>
            </Reveal>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Reveal
                    key={value.title}
                    delay={index * 0.1}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                  >
                    <Icon className={`h-12 w-12 ${value.color}`} />
                    <h3 className="mt-8 text-2xl font-medium text-white">{value.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/60">{value.description}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionLabel text="RAKAMLARLA" />
              <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">Sayılarla Şarjup.</h2>
            </Reveal>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item, index) => (
                <Reveal
                  key={item.label}
                  delay={index * 0.08}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]"
                >
                  <p className="text-[clamp(48px,6vw,96px)] font-extralight leading-none text-white">{item.value}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                  <p className="mt-3 text-sm text-white/60">{item.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-transparent px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto w-full max-w-[1000px] text-center">
            <Reveal>
              <SectionLabel text="BİZE KATILIN" colorClass="bg-cyan-400" />
              <h2 className="mt-6 text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-[-0.04em]">
                İşletmeniz için
                <br />
                yeni bir kapı açın.
              </h2>
              <p className="mx-auto mt-8 max-w-[600px] text-lg leading-relaxed text-white/60">
                Müşteri memnuniyeti, ek gelir, sıfır risk. Şarjup partnerliği ile işletmenizi bir adım öteye taşıyın.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/partnerler"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-10 text-base font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(34,211,238,0.45)]"
              >
                Partner Ol
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 px-10 text-base font-medium text-white transition-colors duration-300 hover:bg-white/10"
              >
                Bize Ulaşın
              </Link>
            </Reveal>
          </div>
        </section>
    </main>
  );
}
