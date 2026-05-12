"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type ProductStageProps = {
  mediaSrc?: string;
  alt?: string;
  className?: string;
};

function isVideo(src: string) {
  const normalized = src.toLowerCase();
  return normalized.endsWith(".mp4") || normalized.endsWith(".webm");
}

function ProductStage({ mediaSrc, alt = "ŞarjUp cihazı", className }: ProductStageProps) {
  const reducedMotion = useReducedMotion();
  const src = mediaSrc || "/cihaz/cihaz-hero.webp";
  const isMediaVideo = isVideo(src);

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className={`relative aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,212,255,0.15)] max-md:max-w-[75vw] ${className ?? ""}`}
    >
      {isMediaVideo ? (
        <video src={src} autoPlay loop muted playsInline className="h-full w-full object-cover" />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 75vw, 360px"
          priority
        />
      )}
    </motion.div>
  );
}

export function CinematicHero() {
  const reducedMotion = useReducedMotion();
  const titleLines = useMemo(() => ["Şarjı", "Yeniden", "Tasarladık"], []);
  const currentDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return formatter.format(new Date());
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden text-black dark:text-white">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-12 pt-28 md:px-8 lg:px-8">
        <div className="mt-20 mb-8 flex flex-wrap items-center gap-4 border-b border-black/10 pb-5 font-mono text-[13px] font-medium uppercase tracking-[0.15em] text-black/50 dark:border-white/10 dark:text-white/50">
          <span className="inline-flex items-center gap-2.5">
            <motion.span
              className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10B981]"
              animate={reducedMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Live
          </span>
          <span className="h-px w-8 bg-black/20 dark:bg-white/20" />
          <span>20.000 mAh</span>
          <span className="h-px w-8 bg-black/20 dark:bg-white/20" />
          <span>NFC v3.0</span>
          <span className="h-px w-8 bg-black/20 dark:bg-white/20" />
          <span>ISTANBUL ↗</span>
          <span className="ml-auto text-[12px] tracking-[0.12em] text-black/35 dark:text-white/30">{currentDate}</span>
        </div>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1fr_1.35fr]">
          <div className="max-w-xl">
            <motion.p
              initial={reducedMotion ? undefined : { opacity: 0, x: -24 }}
              animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-emerald-500 dark:text-emerald-300"
            >
              <span className="h-px w-8 bg-emerald-400/80" />
              {"// Next Generation Charging"}
            </motion.p>

            <div className="space-y-1">
              {titleLines.map((line, index) => (
                <motion.div
                  key={line}
                  initial={reducedMotion ? undefined : { y: 60, opacity: 0 }}
                  animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                  className={`text-[clamp(48px,7vw,96px)] font-bold leading-[0.95] tracking-[-0.04em] ${
                    index === 2
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"
                      : "text-black dark:text-white"
                  }`}
                >
                  {line}
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={reducedMotion ? undefined : { y: 20, opacity: 0 }}
              animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
              className="mt-6 max-w-[480px] text-lg leading-relaxed text-black/60 dark:text-white/60"
            >
              Modern işletmeler için. Akıllı. Otonom. Premium.
            </motion.p>

            <motion.div
              initial={reducedMotion ? undefined : { y: 20, opacity: 0 }}
              animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.65, ease: "easeOut" }}
              className="mt-12 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/cozumler" aria-label="İşletmeler için Şarjup çözümlerini keşfedin" className="group">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 transition-colors duration-300 group-hover:text-white/80">
                    İŞLETMELERE
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-black shadow-lg transition-all hover:scale-[1.02] hover:shadow-cyan-500/30">
                    Çözümleri Keşfet
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
              <Link href="/partnerler" aria-label="Yetkili İş Ortağı programı hakkında bilgi alın" className="group">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 transition-colors duration-300 group-hover:text-white/80">
                    İŞ ORTAĞI ADAYLARINA
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-8 py-4 text-[15px] font-medium text-white transition-all hover:bg-emerald-500/10 hover:border-emerald-400/50">
                    İş Ortağı Olun
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.p
              initial={reducedMotion ? undefined : { y: 20, opacity: 0 }}
              animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.8, ease: "easeOut" }}
              className="mt-6 max-w-[500px] text-[13px] text-white/45"
            >
              İşletme misiniz, yoksa Şarjup&apos;u temsil etmek mi istiyorsunuz? Yukarıdaki seçeneklerle doğru yere ulaşın.
            </motion.p>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <ProductStage />
          </div>
        </div>


<div className="absolute bottom-7 left-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-black/40 dark:text-white/40 md:left-10">
          <motion.div
            className="h-px bg-current"
            animate={reducedMotion ? undefined : { width: [24, 50, 24] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span>Scroll</span>
          <motion.span animate={reducedMotion ? undefined : { y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </div>
      </div>
    </section>
  );
}
