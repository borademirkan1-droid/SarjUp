"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Çözümler", href: "/cozumler" },
  { label: "Fiyatlandırma", href: "/fiyatlandirma" },
  { label: "Partnerler", href: "/partnerler" },
  { label: "İletişim", href: "/iletisim" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "border-white/5 bg-black/40 py-4 backdrop-blur-xl" : "border-transparent bg-transparent py-5"
      }`}
    >
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8"
      >
        <Link href="/" className="group flex items-center py-2">
          <Image
            src="/logo.png"
            alt="Şarjup logosu"
            width={220}
            height={56}
            className="h-10 w-auto object-contain transition duration-300 group-hover:drop-shadow-[0_0_16px_rgba(16,185,129,0.35)] md:h-14"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1 text-sm font-medium tracking-[-0.01em] text-black/70 transition-colors duration-300 hover:text-black dark:text-white/70 dark:hover:text-white"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 md:gap-3">
          <ThemeToggle className="h-9 w-9 border-none bg-transparent p-2 text-black/80 hover:bg-black/10 hover:text-black dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white" />
          <Link
            href="https://admin.sarjup.com.tr"
            target="_blank"
            className="hidden h-10 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 dark:bg-white dark:text-black md:inline-flex"
          >
            Panel Girişi
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black/80 transition-colors hover:bg-black/10 md:hidden dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
            aria-label="Menüyü aç"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-4 mt-4 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-lg backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-black/85"
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-black/80 dark:text-white/80"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="https://admin.sarjup.com.tr"
                target="_blank"
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black"
                onClick={() => setMobileOpen(false)}
              >
                Panel Girişi
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
