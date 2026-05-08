import Image from "next/image";
import Link from "next/link";
import { SocialIcons } from "@/components/animations/social-icons";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black/80 text-white backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-20 md:px-8 md:pt-32 md:pb-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-[clamp(40px,6vw,88px)] font-extralight leading-[1] tracking-[-0.04em] text-white">
            Modern işletmeler için
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              akıllı şarj
            </span>
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">.</span>
          </h2>

          <Link
            href="/partnerler"
            className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/30 px-8 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:text-black lg:w-auto"
          >
            Hemen Partner Olun
            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mt-16 h-px w-full bg-white/5" />

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <Image src="/logo.png" alt="Şarjup logosu" width={186} height={48} className="h-12 w-auto object-contain" />
            <p className="mt-6 max-w-[240px] text-sm leading-relaxed text-white/60">Modern işletmeler için akıllı şarj çözümü.</p>
            <div className="mt-6">
              <SocialIcons />
            </div>
          </div>

          <div>
            <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">Ürün</h3>
            <nav className="space-y-3">
              <Link href="/cozumler" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Çözümler
              </Link>
              <Link href="/#ozellikler" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Özellikler
              </Link>
              <Link href="/partnerler" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Partnerlik
              </Link>
              <Link href="/fiyatlandirma" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Fiyatlandırma
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">Şirket</h3>
            <nav className="space-y-3">
              <Link href="/hakkimizda" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Hakkımızda
              </Link>
              <Link href="/kariyer" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Kariyer
              </Link>
              <Link href="/iletisim" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                İletişim
              </Link>
              <Link href="/basin" className="block text-sm text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                Basın Kiti
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">İletişim</h3>
            <div className="space-y-3 text-sm text-white/70">
              <p className="text-white/90 font-medium">Bora Demirkan</p>
              <p className="text-xs text-white/40">Vergi No: 2870431990</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Kemalpaşa Mah. Cumhuriyet Blv.<br />
                Dündar Rorf İş Merk No:76 İç Kapı No:116<br />
                İzmit / Kocaeli
              </p>
              <a href="tel:+905403664141" className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <span className="text-white/40">📞</span>
                0540 366 41 41
              </a>
              <a href="mailto:info@sarjup.com.tr" className="inline-flex items-center gap-3 transition-colors hover:text-white">
                <span className="text-white/40">✉️</span>
                info@sarjup.com.tr
              </a>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white/10">
                🇹🇷 Made in Türkiye
              </span>
            </div>
          </div>
        </div>

        {/* Ödeme yöntemleri ve güvenlik */}
        <div className="flex flex-col gap-4 border-t border-white/5 px-0 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              256-bit SSL
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-white/30 mr-1">Güvenli ödeme:</span>
            <Image
              src="/logos/visa.svg"
              alt="Visa ile ödeme"
              width={52}
              height={33}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/mastercard.svg"
              alt="Mastercard ile ödeme"
              width={52}
              height={33}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logos/iyzico.svg"
              alt="iyzico ile öde"
              width={90}
              height={30}
              className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 px-0 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 font-mono text-xs text-white/40">
            <span>© 2026 ŞARJUP</span>
            <span>•</span>
            <span>Tüm hakları saklıdır.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <Link href="/kvkk" className="text-xs text-white/40 transition-colors hover:text-white">
              KVKK
            </Link>
            <Link href="/gizlilik" className="text-xs text-white/40 transition-colors hover:text-white">
              Gizlilik
            </Link>
            <Link href="/mesafeli-satis" className="text-xs text-white/40 transition-colors hover:text-white">
              Mesafeli Satış Sözleşmesi
            </Link>
            <Link href="/teslimat-iade" className="text-xs text-white/40 transition-colors hover:text-white">
              Teslimat & İptal
            </Link>
            <span className="font-mono text-xs text-white/30">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
