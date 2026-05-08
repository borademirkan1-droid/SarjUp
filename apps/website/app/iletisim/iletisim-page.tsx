"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/animations/reveal";
import Link from "next/link";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  Building2,
  HeadphonesIcon,
  Briefcase,
  Users,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  Facebook,
  Instagram,
} from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

function SectionLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-3 font-mono text-base font-medium uppercase tracking-[0.3em] text-emerald-400">
      <span className="h-px w-12 bg-emerald-400" />
      {text}
    </span>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function IletisimPage() {
  const [socialTip, setSocialTip] = useState<"tiktok" | "facebook" | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("loading");
    setErrorMsg("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:    data.get("firstName")    as string,
          lastName:     data.get("lastName")     as string,
          email:        data.get("email")        as string,
          phone:        data.get("phone")        as string,
          businessType: data.get("businessType") as string,
          region:       data.get("region")       as string,
          message:      data.get("message")      as string,
        }),
      });

      if (res.ok) {
        setFormStatus("success");
        form.reset();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Bir hata oluştu.");
        setFormStatus("error");
      }
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setFormStatus("error");
    }
  };

  return (
    <main className="relative overflow-x-hidden text-white">
      <section className="bg-transparent px-4 pt-32 md:px-8">
        <div className="mx-auto flex h-[70vh] w-full max-w-[1440px] items-center">
          <div className="w-full">
            <Reveal>
              <SectionLabel text="İletişim" />
            </Reveal>
            <div className="mt-6 space-y-1">
              {["Bize", "ulaşın."].map((line, idx) => (
                <Reveal
                  key={line}
                  delay={idx * 0.15}
                  className={`text-[clamp(56px,9vw,128px)] font-extralight leading-[0.95] tracking-[-0.04em] ${
                    idx === 1 ? "bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent" : "text-white"
                  }`}
                >
                  {line}
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.35} className="mt-8 max-w-[600px] text-lg leading-relaxed text-white/65">
              İşletmeniz için en uygun çözümü konuşalım. WhatsApp, email veya formumuz aracılığıyla bize ulaşabilirsiniz.
              24 saat içinde dönüş yapıyoruz.
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Hızlı İletişim" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">Tek tıkla bağlantı.</h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            <Reveal className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-10">
              <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-[11px] text-emerald-400">ÖNERİLEN</span>
              <MessageCircle className="mt-6 h-14 w-14 text-emerald-400" />
              <h3 className="mt-5 text-2xl font-medium">WhatsApp</h3>
              <p className="mt-2 text-2xl font-medium text-white">0540 366 41 41</p>
              <p className="mt-2 text-sm text-white/60">Anında yanıt, hızlı çözüm</p>
              <Link
                href="https://wa.me/905403664141"
                target="_blank"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(16,185,129,0.45)]"
              >
                Mesaj Gönder <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
              <Phone className="h-14 w-14 text-cyan-400" />
              <h3 className="mt-5 text-2xl font-medium">Telefon</h3>
              <p className="mt-2 text-2xl font-medium text-white">0540 366 41 41</p>
              <p className="mt-2 text-sm text-white/60">Hafta içi 09:00-18:00</p>
              <a
                href="tel:+905403664141"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Hemen Ara <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>

            <Reveal delay={0.2} className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
              <Mail className="h-14 w-14 text-cyan-400" />
              <h3 className="mt-5 text-2xl font-medium">Email</h3>
              <p className="mt-2 text-lg font-medium text-white">info@sarjup.com.tr</p>
              <p className="mt-2 text-sm text-white/60">24 saat içinde yanıt</p>
              <a
                href="mailto:info@sarjup.com.tr"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Email Gönder <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Email Kanalları" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Doğru kapıya
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">yönlendirin.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                color: "text-cyan-400",
                label: "GENEL",
                email: "info@sarjup.com.tr",
                desc: "Genel sorularınız, bilgi talepleri ve her türlü iletişim için.",
              },
              {
                icon: HeadphonesIcon,
                color: "text-emerald-400",
                label: "DESTEK",
                email: "destek@sarjup.com.tr",
                desc: "Mevcut işletmeler için teknik destek, ürün soruları ve operasyonel konular.",
              },
              {
                icon: Briefcase,
                color: "text-cyan-400",
                label: "İŞ ORTAĞI",
                email: "partner@sarjup.com.tr",
                desc: "Yetkili İş Ortağı başvuruları ve partnership fırsatları için özel iletişim kanalı.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.email}
                  delay={i * 0.08}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                >
                  <Icon className={`mb-4 h-8 w-8 ${item.color}`} />
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                  <a href={`mailto:${item.email}`} className="mb-3 block text-lg font-medium text-white hover:text-cyan-300">
                    {item.email}
                  </a>
                  <p className="text-sm leading-6 text-white/65">{item.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Bize Yazın" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Detaylı bilgi mi
              <br />
              istiyorsunuz?
            </h2>
            <p className="mt-8 max-w-[700px] text-lg text-white/60">
              Aşağıdaki formu doldurun, en kısa sürede dönüş yapalım. 24 saat içinde yanıt alacaksınız.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur md:p-12">
              <form onSubmit={handleFormSubmit} className="space-y-4" aria-label="İletişim formu">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Adınız *", "text", "Adınız", "firstName"],
                    ["Soyadınız", "text", "Soyadınız", "lastName"],
                    ["Email", "email", "ornek@email.com", "email"],
                    ["Telefon", "tel", "0540 ___ __ __", "phone"],
                  ].map(([label, type, placeholder, name]) => (
                    <label key={String(name)} className="block">
                      <span className="mb-2 block text-xs tracking-[0.05em] text-white/60">{label}</span>
                      <input
                        type={String(type)}
                        name={String(name)}
                        placeholder={String(placeholder)}
                        aria-label={String(label)}
                        required={name === "firstName"}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-white/8"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs tracking-[0.05em] text-white/60">İşletme Türü</span>
                    <div className="relative">
                      <select
                        name="businessType"
                        aria-label="İşletme Türü"
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-all focus:border-emerald-400/50 focus:bg-white/8"
                      >
                        <option value="">Seçiniz</option>
                        <option>Kafe</option>
                        <option>Restoran</option>
                        <option>Bar / Lounge</option>
                        <option>Meyhane</option>
                        <option>Beach Club</option>
                        <option>Otel / Tesis</option>
                        <option>AVM</option>
                        <option>Diğer</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs tracking-[0.05em] text-white/60">Bölge</span>
                    <div className="relative">
                      <select
                        name="region"
                        aria-label="Bölge"
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-all focus:border-emerald-400/50 focus:bg-white/8"
                      >
                        <option value="">Şehir seçiniz</option>
                        <option>İstanbul</option>
                        <option>Ankara</option>
                        <option>İzmir</option>
                        <option>Antalya</option>
                        <option>Bursa</option>
                        <option>Kocaeli</option>
                        <option>Eskişehir</option>
                        <option>Adana</option>
                        <option>Konya</option>
                        <option>Gaziantep</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs tracking-[0.05em] text-white/60">Mesaj</span>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Mesajınızı yazın..."
                    aria-label="Mesaj"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none transition-all focus:border-emerald-400/50 focus:bg-white/8"
                  />
                </label>

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  aria-label="Mesajı Gönder"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(34,211,238,0.28)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {formStatus === "loading" ? (
                    <>Gönderiliyor...</>
                  ) : (
                    <>Mesajı Gönder <Send className="h-4 w-4" /></>
                  )}
                </button>

                {formStatus === "success" && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    ✅ Mesajınız alındı! En geç 24 saat içinde dönüş yapacağız.
                  </div>
                )}

                {formStatus === "error" && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    ❌ {errorMsg}
                  </div>
                )}
              </form>
            </Reveal>

            <Reveal delay={0.1} className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 p-8 md:p-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">DOĞRUDAN İLETİŞİM</p>
              <h3 className="mt-4 text-[28px] font-normal text-white">Hızlı yanıt mı istiyorsunuz?</h3>
              <p className="mt-3 text-white/65">Form yerine bu kanalları tercih edebilirsiniz.</p>

              <div className="mt-8 space-y-3">
                <Link
                  href="https://wa.me/905403664141"
                  target="_blank"
                  className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-white transition-transform hover:scale-[1.01]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">WhatsApp</span>
                  <span className="ml-auto">→</span>
                </Link>
                <a
                  href="tel:+905403664141"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/90 transition-colors hover:bg-white/10"
                >
                  <Phone className="h-5 w-5" />
                  <span>0540 366 41 41</span>
                </a>
                <a
                  href="mailto:info@sarjup.com.tr"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/90 transition-colors hover:bg-white/10"
                >
                  <Mail className="h-5 w-5" />
                  <span>info@sarjup.com.tr</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Konumumuz" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Türkiye&apos;nin
              <br />
              endüstri kalbinde.
            </h2>
            <p className="mt-8 max-w-[760px] text-lg text-white/60">
              Genel merkezimiz Kocaeli/İzmit&apos;te. Türkiye&apos;nin sanayi ve lojistik merkezinde, hızlı erişim ve verimli operasyon
              için ideal konumda.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
              <ComposableMap projection="geoMercator" projectionConfig={{ center: [35.5, 39], scale: 2400 }} width={800} height={500} style={{ width: "100%", height: "auto" }}>
                <Geographies geography="/data/turkey-cities.json">
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="rgba(255,255,255,0.02)"
                        stroke="rgba(0,212,255,0.35)"
                        strokeWidth={0.5}
                        style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                      />
                    ))
                  }
                </Geographies>
                <Marker coordinates={[29.92, 40.77]}>
                  <circle r={12} fill="rgba(16,185,129,0.25)" className="animate-ping-slow" />
                  <circle r={6} fill="#10B981" stroke="#fff" strokeWidth={1.5} />
                </Marker>
              </ComposableMap>
            </Reveal>

            <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">GENEL MERKEZ</p>
              <h3 className="mt-4 text-3xl font-normal text-white">Kocaeli, İzmit</h3>
              <div className="mt-8 space-y-4 text-white/80">
                <p className="flex items-center gap-3 text-base">
                  <MapPin className="h-5 w-5 text-white/50" /> Kocaeli / İzmit, Türkiye
                </p>
                <a href="tel:+905403664141" className="flex items-center gap-3 text-base hover:text-white">
                  <Phone className="h-5 w-5 text-white/50" /> 0540 366 41 41
                </a>
                <a href="mailto:info@sarjup.com.tr" className="flex items-center gap-3 text-base hover:text-white">
                  <Mail className="h-5 w-5 text-white/50" /> info@sarjup.com.tr
                </a>
                <p className="flex items-center gap-3 text-base">
                  <Clock className="h-5 w-5 text-white/50" /> Hafta içi: 09:00 - 18:00 / Hafta sonu: Kapalı
                </p>
              </div>
              <p className="mt-6 text-sm italic text-white/50">
                Müşteri ziyaretleri için randevu gerekir. WhatsApp üzerinden randevu alabilirsiniz.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <SectionLabel text="Çalışma Saatleri" />
            <h2 className="mt-6 text-[clamp(40px,5vw,72px)] font-light leading-[0.95] tracking-[-0.04em]">
              Her zaman
              <br />
              erişilebiliriz.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, color: "text-cyan-400", label: "HAFTA İÇİ", value: "09:00 - 18:00", desc: "Pazartesi - Cuma" },
              { icon: Clock, color: "text-white/40", label: "HAFTA SONU", value: "Kapalı", desc: "Cumartesi - Pazar" },
              { icon: MessageCircle, color: "text-emerald-400", label: "WHATSAPP", value: "< 1 saat", desc: "Mesai saatleri içinde" },
              { icon: Mail, color: "text-cyan-400", label: "EMAİL", value: "24 saat", desc: "Maksimum yanıt süresi" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.label} delay={i * 0.06} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                  <Icon className={`mb-3 h-8 w-8 ${item.color}`} />
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                  <p className="text-2xl font-medium text-white">{item.value}</p>
                  <p className="mt-2 text-[13px] text-white/60">{item.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-black/20 to-transparent px-4 py-16 md:px-8">
        <div className="mx-auto w-full max-w-[1000px] text-center">
          <Reveal>
            <SectionLabel text="Sosyal Medya" />
            <h2 className="mt-6 text-4xl font-light tracking-[-0.04em]">Bizi takip edin.</h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 flex justify-center gap-4">
            <a
              href="https://instagram.com/sarjup_"
              target="_blank"
              aria-label="Instagram"
              className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Instagram className="h-6 w-6" />
            </a>

            <button
              type="button"
              aria-label="TikTok"
              onMouseEnter={() => setSocialTip("tiktok")}
              onMouseLeave={() => setSocialTip(null)}
              onClick={(e) => {
                e.preventDefault();
                setSocialTip("tiktok");
              }}
              className="relative inline-flex h-16 w-16 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60"
            >
              <TikTokIcon />
              <span
                className={`pointer-events-none absolute -top-9 rounded-md border border-white/10 bg-black/90 px-3 py-1 text-xs text-white/80 backdrop-blur transition-opacity ${
                  socialTip === "tiktok" ? "opacity-100" : "opacity-0"
                }`}
              >
                Yakında
              </span>
            </button>

            <button
              type="button"
              aria-label="Facebook"
              onMouseEnter={() => setSocialTip("facebook")}
              onMouseLeave={() => setSocialTip(null)}
              onClick={(e) => {
                e.preventDefault();
                setSocialTip("facebook");
              }}
              className="relative inline-flex h-16 w-16 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60"
            >
              <Facebook className="h-6 w-6" />
              <span
                className={`pointer-events-none absolute -top-9 rounded-md border border-white/10 bg-black/90 px-3 py-1 text-xs text-white/80 backdrop-blur transition-opacity ${
                  socialTip === "facebook" ? "opacity-100" : "opacity-0"
                }`}
              >
                Yakında
              </span>
            </button>

            <a
              href="https://wa.me/905403664141"
              target="_blank"
              aria-label="WhatsApp"
              className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <WhatsAppIcon />
            </a>
          </Reveal>

          <Reveal delay={0.16} className="mt-6 text-sm text-white/50">
            @sarjup_ — günlük güncellemeler için Instagram&apos;da bizi takip edin.
          </Reveal>
        </div>
      </section>

      <section className="bg-transparent px-4 py-24 md:px-8">
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-2">
          <Reveal className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-10">
            <Building2 className="h-12 w-12 text-cyan-400" />
            <h3 className="mt-6 text-3xl font-normal">İşletme misiniz?</h3>
            <p className="mt-3 text-white/70">Cihazlarımız ve çözümlerimiz hakkında detaylı bilgi alın.</p>
            <Link
              href="/cozumler"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Çözümleri Keşfet <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="rounded-[32px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-10">
            <Users className="h-12 w-12 text-emerald-400" />
            <h3 className="mt-6 text-3xl font-normal">Yetkili İş Ortağı mı olmak istiyorsunuz?</h3>
            <p className="mt-3 text-white/70">Bölgenizde Şarjup&apos;u temsil edin. Network&apos;ümüze katılın.</p>
            <Link
              href="/partnerler"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            >
              Partner Programı <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
