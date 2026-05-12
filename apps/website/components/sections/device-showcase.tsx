"use client";

import Image from "next/image";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";

const SPECS = [
  { label: "20.000 mAh", sub: "Pil kapasitesi" },
  { label: "NFC v3.0", sub: "Temassız aktivasyon" },
  { label: "3-in-1", sub: "Evrensel konnektör" },
  { label: "IP54", sub: "Toz & sıvı koruması" },
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
          className="mb-16 text-center"
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

        {/* Fotoğraf */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.95, y: 24 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto mb-16 max-w-[500px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,212,255,0.12)]"
        >
          <Image
            src="/cihaz/cihaz-hero.webp"
            alt="ŞarjUp cihazı masada"
            width={500}
            height={890}
            className="w-full object-cover"
            sizes="(max-width: 768px) 90vw, 500px"
          />
        </motion.div>

        {/* Teknik özellikler */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {SPECS.map((spec) => (
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
