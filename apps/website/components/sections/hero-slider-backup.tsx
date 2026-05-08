"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type HeroSlide = {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const SLIDES: HeroSlide[] = [
  {
    image: "/cihaz/cihaz-hero.png",
    title: "modern işletmeler için",
    subtitle: "akıllı şarj çözümü",
    cta: "Partner Ol",
    href: "/partnerler",
  },
  {
    image: "/cihaz/cihaz-kullanim.png",
    title: "müşteri masadan",
    subtitle: "ayrılmaz",
    cta: "Daha Fazla",
    href: "/cozumler",
  },
  {
    image: "/cihaz/cihaz-gercek.png",
    title: "premium şarj",
    subtitle: "deneyimi",
    cta: "Mekanlar",
    href: "/partnerler",
  },
  {
    image: "/cihaz/cihaz-detay.png",
    title: "20.000 mAh",
    subtitle: "yüksek performans",
    cta: "Özellikler",
    href: "/cozumler",
  },
];

function padSlideNumber(value: number) {
  return String(value).padStart(2, "0");
}

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const totalSlides = SLIDES.length;

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const autoPlayDuration = isMobile ? 5000 : 6000;

  const goToSlide = useCallback(
    (nextIndex: number) => {
      setActiveIndex((nextIndex + totalSlides) % totalSlides);
    },
    [totalSlides],
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();

    if (prefersReducedMotion || isPaused || isHovering) return;

    timerRef.current = window.setInterval(() => {
      goNext();
    }, autoPlayDuration);

    return clearTimer;
  }, [autoPlayDuration, clearTimer, goNext, isHovering, isPaused, prefersReducedMotion, activeIndex]);

  const handleManualNavigate = (index: number) => {
    goToSlide(index);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < 60) return;
    if (info.offset.x < 0) goNext();
    else goPrev();
  };

  return (
    <section
      className="relative h-screen w-screen overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => setIsPaused((prev) => !prev)}
    >
      <div className="absolute inset-0">
        {SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.div
              key={slide.image}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              aria-hidden={!isActive}
            >
              <motion.div
                className="absolute inset-0"
                animate={isActive ? { scale: [1.05, 1.15] } : { scale: 1.05 }}
                transition={isActive ? { duration: autoPlayDuration / 1000, ease: "linear" } : { duration: 0.3 }}
              >
                <Image
                  src={slide.image}
                  alt={`${slide.title} ${slide.subtitle}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="absolute inset-0 z-10"
        drag={isMobile ? "x" : false}
        dragElastic={0.15}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 dark:from-black/75 dark:via-black/45 dark:to-black/25" />

        <div className="absolute inset-0 flex items-end px-5 pb-16 pt-28 sm:px-10 md:items-center md:pb-20 md:px-14 lg:px-20">
          <div className="relative z-20 w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${activeIndex}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="space-y-2"
              >
                <div className="text-[clamp(80px,12vw,200px)] font-extralight lowercase leading-[0.9] tracking-[-0.04em] text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.3)] max-md:text-[18vw]">
                  {SLIDES[activeIndex]?.title}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  className="text-[clamp(44px,7vw,120px)] font-extralight lowercase leading-[0.9] tracking-[-0.04em] text-white/95 [text-shadow:0_4px_20px_rgba(0,0,0,0.28)] max-md:text-[8vw]"
                >
                  {SLIDES[activeIndex]?.subtitle}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
                className="mt-10"
              >
                <Link
                  href={SLIDES[activeIndex]?.href ?? "/"}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-7 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-emerald-400"
                  onClick={(event) => event.stopPropagation()}
                >
                  {SLIDES[activeIndex]?.cta}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {SLIDES.map((slide, index) => (
            <button
              key={`desktop-indicator-${slide.image}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleManualNavigate(index);
              }}
              className="relative h-10 w-[2px] overflow-hidden bg-white/35"
              aria-label={`${index + 1}. slayta git`}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-b from-blue-500 to-emerald-400"
                initial={false}
                animate={{ scaleY: activeIndex === index ? 1 : 0 }}
                style={{ transformOrigin: "bottom" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:hidden">
          {SLIDES.map((slide, index) => (
            <button
              key={`mobile-indicator-${slide.image}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleManualNavigate(index);
              }}
              className="relative h-[2px] w-10 overflow-hidden bg-white/35"
              aria-label={`${index + 1}. slayta git`}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-400"
                initial={false}
                animate={{ scaleX: activeIndex === index ? 1 : 0 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 left-6 z-20 font-mono text-sm text-white/70 md:left-10 md:bottom-8 max-md:left-5 max-md:top-24 max-md:bottom-auto">
          <div className="relative h-5 w-24 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`counter-${activeIndex}`}
                className="absolute inset-0"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {padSlideNumber(activeIndex + 1)} / {padSlideNumber(totalSlides)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
