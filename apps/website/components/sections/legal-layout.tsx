"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/animations/reveal";
import { AlertCircle, Mail, Calendar } from "lucide-react";
import Link from "next/link";

type Section = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalLayoutProps = {
  pageTitle: string;
  pageSubtitle: string;
  lastUpdated: string;
  sections: Section[];
  badge?: string;
};

export function LegalLayout({
  pageTitle,
  pageSubtitle,
  lastUpdated,
  sections,
  badge = "YASAL",
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter((el): el is HTMLElement => Boolean(el));

      const current = sectionElements.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= 200 && rect.bottom >= 200;
      });

      if (current) setActiveSection(current.id);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <main className="relative pb-32 pt-32 text-white">
      <section className="mx-auto max-w-4xl px-4 pb-16 md:px-8">
        <Reveal>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-emerald-400" />
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-emerald-400">{badge}</span>
          </div>

          <h1 className="mb-6 text-5xl font-extralight leading-[0.95] tracking-tight md:text-7xl">{pageTitle}</h1>

          <p className="mb-8 max-w-2xl text-lg text-white/60">{pageSubtitle}</p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Calendar className="h-4 w-4" />
              <span>Son güncelleme: {lastUpdated}</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <p className="text-sm leading-relaxed text-white/80">
                <strong className="text-amber-400">Bilgilendirme:</strong> Bu metin Türkiye&apos;de geçerli yasal düzenlemeler
                doğrultusunda hazırlanmış bir şablondur ve avukat onayı için gözden geçirilmektedir. Hukuki bağlayıcılığı için
                final versiyonu bekleyiniz.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <div className="mb-4 border-b border-white/10 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                İÇİNDEKİLER
              </div>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`rounded-lg px-3 py-2 text-sm transition-all ${
                      activeSection === section.id
                        ? "border-l-2 border-emerald-400 bg-emerald-500/10 text-emerald-400"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="max-w-3xl">
            {sections.map((section, index) => (
              <Reveal key={section.id} delay={index * 0.05}>
                <div id={section.id} className="scroll-mt-32 mb-16">
                  <h2 className="mb-6 border-b border-white/10 pb-3 text-3xl font-light text-white">{section.title}</h2>
                  <div className="legal-prose">{section.content}</div>
                </div>
              </Reveal>
            ))}
          </article>
        </div>
      </section>

      <section className="mx-auto mt-32 max-w-4xl px-4 md:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/3 p-12 text-center backdrop-blur-xl">
          <Mail className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
          <h3 className="mb-3 text-2xl font-light">Sorularınız mı var?</h3>
          <p className="mx-auto mb-6 max-w-lg text-white/60">
            Bu metinle ilgili sorularınız için bize ulaşabilirsiniz. Veri sorumlumuz size yardımcı olacaktır.
          </p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-medium text-black transition-transform hover:scale-105"
          >
            İletişime Geçin →
          </Link>
        </div>
      </section>
    </main>
  );
}
