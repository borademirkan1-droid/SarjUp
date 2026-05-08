"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

type StatItem = {
  value: number;
  suffix: string;
  label: string;
  displayText?: string;
};

const stats: StatItem[] = [
  { value: 20000, suffix: " mAh", label: "Batarya kapasitesi" },
  { value: 80, suffix: "%+", label: "Müşteri memnuniyeti artışı" },
  { value: 24, suffix: "/7", label: "Kesintisiz hizmet" },
  { value: 0, suffix: "", label: "Sorumluluk riski", displayText: "Sıfır" },
];

function Counter({
  to,
  suffix,
  inView,
}: {
  to: number;
  suffix: string;
  inView: boolean;
}) {
  const value = useMotionValue(0);
  const spring = useSpring(value, { duration: 2 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (inView) {
      value.set(to);
    }
  }, [inView, to, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString("tr-TR");
      }
    });
  }, [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="bg-transparent px-4 pb-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Rakamlarla Şarjup
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <p className="text-3xl font-semibold text-blue-600 dark:text-emerald-300 md:text-4xl">
                {stat.displayText ? (
                  stat.displayText
                ) : (
                  <>
                    <Counter to={stat.value} suffix={stat.suffix} inView={inView} />
                    {stat.suffix}
                  </>
                )}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
