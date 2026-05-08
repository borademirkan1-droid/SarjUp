"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Minus, Plus, Zap } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";

const durations = [
  { label: "Aylık", months: 1, price: 1200, badge: null },
  { label: "3 Aylık", months: 3, price: 1100, badge: null },
  { label: "6 Aylık", months: 6, price: 1000, badge: "Popüler" },
  { label: "9 Aylık", months: 9, price: 900, badge: null },
  { label: "12 Aylık", months: 12, price: 800, badge: "En Avantajlı" },
];

const features = [
  "Kurulum ücreti yok",
  "7/24 teknik destek dahil",
  "Bakım ve onarım dahil",
  "Minimum bağlılık süresi yok",
  "NFC akıllı aktivasyon",
  "Anlık bildirim sistemi",
  "Online yönetim paneli",
  "SMS & e-posta bildirimleri",
];

const businesses = [
  { emoji: "☕", label: "Kafe" },
  { emoji: "🍽️", label: "Restoran" },
  { emoji: "🏖️", label: "Beach Club" },
  { emoji: "🌿", label: "Dinlenme Tesisi" },
  { emoji: "🏨", label: "Otel" },
  { emoji: "💪", label: "Spor Salonu" },
  { emoji: "🏪", label: "AVM" },
  { emoji: "🎭", label: "Eğlence Mekanı" },
];

function getQuantityDiscount(count: number): number {
  if (count >= 6) return 200;
  if (count >= 3) return 100;
  return 0;
}

function getQuantityLabel(count: number): string {
  if (count >= 10) return "10+ cihaz";
  if (count >= 6) return "6–9 cihaz";
  if (count >= 3) return "3–5 cihaz";
  return "1–2 cihaz";
}

export function FiyatlandirmaPage() {
  const [selectedDuration, setSelectedDuration] = useState(2); // 6 aylık default
  const [deviceCount, setDeviceCount] = useState(1);
  const [specialOffer, setSpecialOffer] = useState(false);

  const duration = durations[selectedDuration];
  const discount = getQuantityDiscount(deviceCount);
  const unitPrice = Math.max(duration.price - discount, 0);
  const totalMonthly = unitPrice * deviceCount;
  const totalPeriod = totalMonthly * duration.months;
  const savingsVsMonthly = (1200 - duration.price) * deviceCount * duration.months;

  const handleDeviceChange = (val: number) => {
    if (val >= 10) {
      setSpecialOffer(true);
      setDeviceCount(10);
    } else {
      setSpecialOffer(false);
      setDeviceCount(Math.max(1, val));
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      {/* Hero */}
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#0066FF]/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-4 py-1.5 text-sm font-medium text-[#0066FF]">
              <Zap className="h-3.5 w-3.5" />
              Şeffaf Fiyatlandırma
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
              İşletmenize Özel
              <br />
              <span className="bg-gradient-to-r from-[#0066FF] to-[#10B981] bg-clip-text text-transparent">
                Esnek Fiyatlar
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/60 md:text-lg">
              Kurulum ücreti yok. Teknik destek dahil. Sözleşme zorunluluğu yok.
              Cihaz sayısına ve süreye göre avantajlı fiyatlar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-10">

            {/* Duration Selector */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-white/50">Kira Süresi</p>
              <div className="flex flex-wrap gap-2">
                {durations.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedDuration(i)}
                    className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      selectedDuration === i
                        ? "bg-[#0066FF] text-white shadow-[0_0_20px_rgba(0,102,255,0.4)]"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {d.label}
                    {d.badge && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-bold text-white">
                        {d.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Count */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-white/50">Cihaz Adedi</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleDeviceChange(deviceCount - 1)}
                  disabled={deviceCount <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="min-w-[3rem] text-center text-2xl font-bold text-white">
                  {deviceCount >= 10 ? "10+" : deviceCount}
                </span>

                <button
                  type="button"
                  onClick={() => handleDeviceChange(deviceCount + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                  {getQuantityLabel(deviceCount)}
                  {discount > 0 && (
                    <span className="ml-1 text-[#10B981]">
                      · -{discount} ₺/cihaz
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Price Display */}
            {specialOffer ? (
              <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 p-6 text-center">
                <p className="text-lg font-semibold text-[#10B981]">
                  10+ cihaz için özel teklif alın
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Büyük ölçekli projeler için özel fiyatlandırma sunuyoruz.
                </p>
                <Link
                  href="/iletisim"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0ea271]"
                >
                  Teklif İste
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-xs text-white/40">Cihaz Başına / Ay</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {unitPrice.toLocaleString("tr-TR")} ₺
                  </p>
                  {discount > 0 && (
                    <p className="mt-1 text-xs text-[#10B981]">
                      {discount} ₺ adet indirimi uygulandı
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#0066FF]/30 bg-[#0066FF]/10 p-5 text-center ring-1 ring-[#0066FF]/30">
                  <p className="text-xs text-white/40">Aylık Toplam ({deviceCount} cihaz)</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {totalMonthly.toLocaleString("tr-TR")} ₺
                  </p>
                  <p className="mt-1 text-xs text-white/40">+ KDV</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-xs text-white/40">{duration.months} Aylık Toplam</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {totalPeriod.toLocaleString("tr-TR")} ₺
                  </p>
                  {savingsVsMonthly > 0 && (
                    <p className="mt-1 text-xs text-[#10B981]">
                      {savingsVsMonthly.toLocaleString("tr-TR")} ₺ tasarruf
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Discount Info */}
        <Reveal delay={0.1}>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { range: "1–2 cihaz", note: "Standart fiyat" },
              { range: "3–5 cihaz", note: "100 ₺/cihaz indirim" },
              { range: "6–9 cihaz", note: "200 ₺/cihaz indirim" },
              { range: "10+ cihaz", note: "Özel teklif" },
            ].map((tier) => (
              <div
                key={tier.range}
                className="rounded-xl border border-white/5 bg-white/3 px-4 py-3 text-center"
              >
                <p className="text-sm font-semibold text-white">{tier.range}</p>
                <p className="mt-0.5 text-xs text-white/40">{tier.note}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* What's Included */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <Reveal>
          <h2 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">
            Her Pakete Dahil
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f} delay={i * 0.05}>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#10B981]/20">
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                </div>
                <span className="text-sm text-white/80">{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Target Businesses */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <Reveal>
          <h2 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">
            Hangi İşletmeler İçin?
          </h2>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-3">
          {businesses.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.04}>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80">
                <span>{b.emoji}</span>
                {b.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0066FF] to-[#0040CC] p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold text-white md:text-4xl">
              Hemen Başlayın
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/70">
              Cihazları işletmenize kuralım, siz gelirinizi büyütün.
              Kurulum ücreti yok, risk yok.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0066FF] transition-all hover:scale-105 hover:bg-white/90"
              >
                Ücretsiz Bilgi Al
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/905403664141"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                WhatsApp ile Yaz
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
