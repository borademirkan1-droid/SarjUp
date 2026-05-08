"use client";

import { TurkeyMap } from "@/components/animations/turkey-map";
import { networkStats, partners } from "@/lib/data/partners";

export function NetworkSection() {
  const marqueeItems = [...partners.map((partner) => partner.name), ...partners.map((partner) => partner.name)];

  return (
    <section className="relative overflow-hidden bg-transparent px-4 py-24 text-white md:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">{"// OUR NETWORK"}</p>

        <h2 className="mt-6 text-[clamp(48px,7vw,96px)] font-light leading-[0.95] tracking-[-0.04em]">
          Türkiye&apos;nin
          <br />
          her köşesinde
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">.</span>
        </h2>

        <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-white/60">
          Modern işletmeler artık Şarjup&apos;la müşterilerine premium şarj sunuyor.
        </p>

        <div className="mt-12 grid min-h-[500px] gap-6 rounded-[32px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(0,20,40,0.4),rgba(0,0,0,0.6))] p-8 backdrop-blur-[20px] md:p-12 lg:grid-cols-[1fr_280px]">
          <div className="mx-auto w-full max-w-[900px]">
            <TurkeyMap />
          </div>

          <aside className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:block">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Stats</p>

            <div className="mt-6">
              <p className="text-5xl font-light">{networkStats.totalPartners}+</p>
              <p className="text-sm text-white/60">Mekan</p>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div>
              <p className="text-5xl font-light">{networkStats.totalCities}</p>
              <p className="text-sm text-white/60">Şehir</p>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {networkStats.activePartners} Aktif
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                {networkStats.comingSoon} Yakında
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-0 py-5">
          <p className="px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">--- PARTNERLERIMIZ ---</p>
          <div className="group mt-4 overflow-hidden">
            <div className="marquee-track flex w-max items-center gap-5 whitespace-nowrap px-6 text-lg text-white/40 group-hover:[animation-play-state:paused]">
              {marqueeItems.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-5">
                  {item}
                  <span className="text-white/25">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
