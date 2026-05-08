import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalBackground } from "@/components/animations/global-background";
import { ScrollToTop } from "@/components/animations/scroll-to-top";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Şarjup | Modern işletmeler için akıllı şarj çözümü",
  description:
    "Şarjup, müşterilerinize masadan ayrılmadan kişisel cihazlarını şarj edebilecekleri güvenli ve otonom bir hizmet sunan akıllı şarj çözümüdür.",
  openGraph: {
    title: "Şarjup | Modern işletmeler için akıllı şarj çözümü",
    description:
      "Kafeler, restoranlar, oteller ve AVM'ler için NFC tabanlı taşınabilir telefon şarj cihazı kiralama çözümü.",
    url: "https://sarjup.com.tr",
    siteName: "Şarjup",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LenisProvider>
            <GlobalBackground />
            <Navbar />
            <main className="relative z-10">{children}</main>
            <Footer />
            <ScrollToTop />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
