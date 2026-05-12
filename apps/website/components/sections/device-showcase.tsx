"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

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

function SarjupDevice() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 260 }}>
      <svg
        viewBox="0 0 280 260"
        width="280"
        height="260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_60px_rgba(0,200,220,0.25)]"
      >
        <defs>
          <linearGradient id="chromeSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="30%" stopColor="#2d3561" />
            <stop offset="60%" stopColor="#c8d6e5" />
            <stop offset="80%" stopColor="#8395a7" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="chromeSideR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="30%" stopColor="#2d3561" />
            <stop offset="60%" stopColor="#c8d6e5" />
            <stop offset="80%" stopColor="#8395a7" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="acrylicFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8f4f8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#f0f8ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c8e6f0" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#06d6a0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sol krom yan panel */}
        <path d="M 20 245 L 20 120 Q 20 20 80 20 L 95 20 L 95 245 Z"
          fill="url(#chromeSide)" opacity="0.9" />

        {/* Sağ krom yan panel */}
        <path d="M 260 245 L 260 120 Q 260 20 200 20 L 185 20 L 185 245 Z"
          fill="url(#chromeSideR)" opacity="0.9" />

        {/* Ana gövde - koyu arka plan */}
        <path d="M 95 20 L 185 20 Q 185 20 185 245 L 95 245 Z"
          fill="url(#bodyGrad)" />

        {/* Akrilik yüzey efekti */}
        <path d="M 80 20 Q 140 8 200 20 L 200 245 L 80 245 Z"
          fill="url(#acrylicFace)" />

        {/* Çerçeve şekli - arch */}
        <path d="M 20 245 L 20 120 Q 20 20 140 20 Q 260 20 260 120 L 260 245 Z"
          fill="none" stroke="url(#cyanGlow)" strokeWidth="1.5" opacity="0.4" />

        {/* Logo dairesi */}
        <circle cx="140" cy="130" r="32" fill="none" stroke="url(#cyanGlow)" strokeWidth="2" filter="url(#glow)" />
        <circle cx="140" cy="130" r="26" fill="#0f172a" />

        {/* Şimşek ikonu */}
        <path d="M 145 113 L 135 130 L 141 130 L 136 148 L 148 128 L 142 128 Z"
          fill="url(#cyanGlow)" filter="url(#glow)" />

        {/* LED sarj göstergesi noktaları */}
        <circle cx="112" cy="88" r="4" fill="#00b4d8" opacity="0.9" filter="url(#glow)" />
        <circle cx="124" cy="88" r="4" fill="#00b4d8" opacity="0.7" />
        <circle cx="136" cy="88" r="4" fill="#1a1a2e" stroke="#334155" strokeWidth="1" />

        {/* ŞarjUp yazısı */}
        <text x="140" y="185" textAnchor="middle" fill="white" fontSize="13" fontWeight="700"
          fontFamily="system-ui, sans-serif" letterSpacing="0.5">ŞarjUp</text>
        <text x="140" y="200" textAnchor="middle" fill="rgba(255,255,255,0.35)"
          fontSize="7" fontFamily="monospace" letterSpacing="1">sarjup.com.tr</text>

        {/* Alt bilgi şeridi */}
        <rect x="80" y="230" width="120" height="12" rx="2" fill="rgba(255,255,255,0.04)" />
        <text x="140" y="239" textAnchor="middle" fill="rgba(255,255,255,0.25)"
          fontSize="5.5" fontFamily="monospace">0540 366 41 41 • @sarjup_</text>

        {/* Kablo */}
        <path d="M 108 245 Q 108 256 98 262 Q 80 270 70 290"
          stroke="#2d3561" strokeWidth="6" strokeLinecap="round" />
        <path d="M 108 245 Q 108 256 98 262 Q 80 270 70 290"
          stroke="#4a5568" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 2" />

        {/* Konnektör ucu */}
        <rect x="65" y="288" width="10" height="5" rx="1" fill="#718096" />

        {/* GPS anteni küçük nokta */}
        <circle cx="190" cy="60" r="3" fill="#06d6a0" opacity="0.8" filter="url(#glow)" />

        {/* Yüzey parlaması */}
        <path d="M 95 22 Q 140 12 185 22 L 185 80 Q 140 60 95 80 Z"
          fill="white" opacity="0.04" />
      </svg>

      {/* Ambient glow */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full blur-3xl"
          style={{ background: "radial-gradient(ellipse, rgba(0,180,216,0.15) 0%, transparent 70%)" }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

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
            <SarjupDevice />
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
