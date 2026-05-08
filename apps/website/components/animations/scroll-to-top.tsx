"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setIsVisible(scrollPosition > windowHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: number, options?: { duration?: number; easing?: (t: number) => number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 2, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          aria-label="Sayfanın başına dön"
          className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-cyan-500/20 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black"
        >
          <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
          <span className="animate-ping-slow absolute inset-0 rounded-full bg-cyan-400/20" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
