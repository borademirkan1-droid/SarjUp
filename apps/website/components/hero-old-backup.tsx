"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, BatteryCharging } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 pb-10 pt-32 md:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/30"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 top-44 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl dark:bg-emerald-400/25"
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
            <BatteryCharging className="h-4 w-4" />
            B2B NFC Şarj Ekosistemi
          </p>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
            Modern işletmeler için
            <br className="hidden md:block" /> akıllı şarj çözümü
          </h1>

          <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Müşterilerinize masadan ayrılmadan cihazlarını şarj etme imkanı sunun.
            Kayıp ve hasar riski olmadan, ek gelir kapısı.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/partnerler"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Partner Ol
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-base font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-emerald-300/50 dark:hover:text-emerald-300"
            >
              Bize Ulaşın
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative rounded-[2.25rem] border border-black/10 bg-white/70 p-4 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/15 dark:bg-slate-900/60 dark:shadow-[0_0_40px_rgba(16,185,129,0.18)]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-black/5 bg-gradient-to-br from-blue-50 to-emerald-50 p-3 dark:border-white/10 dark:from-blue-950/40 dark:to-emerald-950/40">
              <picture>
                <source srcSet="/cihaz/cihaz-hero.webp" type="image/webp" />
                <img
                  src="/cihaz/cihaz-hero.png"
                  alt="Şarjup akıllı şarj cihazı - restoran masasında"
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-2xl object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 dark:text-slate-300"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
}
