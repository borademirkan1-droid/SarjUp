"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { SarjupDevice } from "@/components/sarjup-device";

type Feature = {
  id: string;
  label: string;
  sub: string;
  position: { top: string; left: string };
  lineEnd: { x: number; y: number };
  side: "left" | "right";
};

const FEATURES: Feature[] = [
  {
    id: "led",
    label: "Kalan Sarj Göstergesi",
    sub: "LED pil durumu anlık izleme",
    position: { top: "22%", left: "4%" },
    lineEnd: { x: 108, y: 88 },
    side: "left",
  },
  {
    id: "gps",
    label: "Uydu Takip Sistemi",
    sub: "Çalınmaya karşı GPS koruma",
    position: { top: "8%", left: "58%" },
    lineEnd: { x: 190, y: 60 },
    side: "right",
  },
  {
    id: "cable",
    label: "Hızlı Sarj Sargı Kablosu",
    sub: "Örgü kaplama dayanıklı kablo",
    position: { top: "72%", left: "2%" },
    lineEnd: { x: 90, y: 220 },
    side: "left",
  },
  {
    id: "panel",
    label: "Firmanıza Özel Yüzey",
    sub: "Markanıza uyarlanabilir ön panel",
    position: { top: "75%", left: "58%" },
    lineEnd: { x: 200, y: 180 },
    side: "right",
  },
];

export function DeviceShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReduced = useReducedMotion();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#050d1a] py-24 md:py-36">
      {/* Arka plan grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8">
        {/* Başlık */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
            {"// ÜRÜN"}
          </p>
          <h2 className="text-[clamp(36px,5vw,72px)] font-bold leading-[1] tracking-[-0.03em] text-white">
            Masa üstü{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              teknoloji
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/50">
            Kompakt tasarım, premium malzeme. Markanıza özel kişiselleştirme.
          </p>
        </motion.div>

        {/* Cihaz + özellik anotasyonları */}
        <div className="relative mx-auto" style={{ maxWidth: 700, minHeight: 380 }}>
          {/* Cihaz merkez */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="flex justify-center"
          >
            <SarjupDevice className="mx-auto" />
          </motion.div>

          {/* Özellik callout'ları */}
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={prefersReduced ? false : { opacity: 0, x: feature.side === "left" ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
              className={`absolute flex items-center gap-3 ${feature.side === "right" ? "flex-row-reverse" : ""}`}
              style={{ top: feature.position.top, left: feature.position.left }}
            >
              {/* Nokta */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>

              {/* Çizgi */}
              <span className={`h-px w-8 bg-cyan-400/40 shrink-0`} />

              {/* Metin */}
              <div className={`${feature.side === "right" ? "text-right" : "text-left"}`}>
                <p className="text-[13px] font-semibold leading-tight text-white">{feature.label}</p>
                <p className="text-[11px] text-white/40">{feature.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alt teknik grid */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-24 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { label: "20.000 mAh", sub: "Pil kapasitesi" },
            { label: "NFC v3.0", sub: "Temassız aktivasyon" },
            { label: "3-in-1", sub: "Evrensel konnektör" },
            { label: "IP54", sub: "Toz & sıvı koruması" },
          ].map((spec) => (
            <div
              key={spec.label}
              className="rounded-2xl border border-white/8 bg-white/4 p-5 text-center backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-white">{spec.label}</p>
              <p className="mt-1 text-xs text-white/45">{spec.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
